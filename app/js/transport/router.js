
var sibilant=sibilant || {};

/**
 * @typedef sibilant.TransportPacket
 * @property {string} src - The participant address that sent this packet
 * @property {string} dst - The intended recipient of this packet
 * @property {Number} ver - Protocol Version.  Should be 1
 * @property {Number} msg_id - A unique id for this packet.
 * @property {object} entity - The payload of this packet.
 * @property {Number} [time] - The time in milliseconds since epoch that this packet was created.
 * @property {Number} [reply_to] - Reference to the msg_id that this is in reply to.
 */

/**
 * @typedef sibilant.Participant
 * @property origin - The origin of this participant, confirmed via trusted sources.
 * @function receive - Callback for this participant to receive a packet.  Will be called with participant as "this".
 */

/**
 * @event sibilant.Router#preRegisterParticipant
 * @mixes sibilant.CancelableEvent
 * @property {sibilant.TransportPacket} [packet] - The packet to be delivered
 * @property {object} registration - Information provided by the participant about it's registration
 * @property {sibilant.Participant} participant - The participant that will receive the packet

 */

/**
 * @event sibilant.Router#preSend
 * @mixes sibilant.CancelableEvent
 * @property {sibilant.TransportPacket} packet - The packet to be sent
 * @property {sibilant.Participant} participant - The participant that sent the packet
 */

/**
 * @event sibilant.Router#preDeliver
 * @mixes sibilant.CancelableEvent
 * @property {sibilant.TransportPacket} packet - The packet to be delivered
 * @property {sibilant.Participant} participant - The participant that will receive the packet
 */

/**
 * @event sibilant.Router#send
 * @property {sibilant.TransportPacket} packet - The packet to be delivered
 */

/**
 * @event sibilant.Router#prePeerReceive
 * @mixes sibilant.CancelableEvent
 * @property {sibilant.TransportPacket} packet
 * @property {sibilant.NetworkPacket} rawPacket
 */

/**
 * @class
 * @param {type} name
 */
sibilant.MulticastParticipant=function(name) {
	this.name=name;
	this.members=[];
};

sibilant.MulticastParticipant.prototype.origin=function(o) {
	return this.members.some(function(m) { return m.origin === o;});
};

sibilant.MulticastParticipant.prototype.receive=function(packet) {
	this.members.forEach(function(m) { m.receive(packet);});
	return false;
};

sibilant.MulticastParticipant.prototype.addMember=function(m) {
	this.members.push(m);
};


/**
 * @class
 * @param {object} [config]
 * @param {sibilant.Peer} [config.peer=sibilant.defaultPeer]
 * @param {boolean} [config.forwardAll=false]
 */
sibilant.Router=function(config) {
	config=config || {};
	this.peer=config.peer || sibilant.defaultPeer;
	this.forwardAll=config.forwardAll || false;

	this.nobodyAddress="$nobody";
	this.routerControlAddress='$transport';
	
	var self=this;	
	
	// Stores all local addresses
	this.participants={};
	
	sibilant.metrics.gauge("transport.participants").set(function() {
		return Object.keys(self.participants).length;
	});

	var checkFormat=function(event) {
		var message=event.packet;
		if(message.ver !== 1) {
			event.cancel("badVersion");
		}
		if(!message.src) {
			event.cancel("nullSource");
		}
		if(!message.dst) {
			event.cancel("nullDestination");
		}
//		if(!message.entity) {
//			event.cancel("nullEntity");
//		}
		
		if(event.canceled) {
			sibilant.metrics.counter("transport.packets.invalidFormat").inc();
		}
	};
	
	var checkSenderOrigin=function(event) {
		// TODO: allow nobodyAddress to talk to control addresses
		var knownParticipant=self.participants[event.packet.src];
		if(!knownParticipant || !knownParticipant.origin) {
			return;
		}
		if((typeof(knownParticipant.origin) === 'string' && knownParticipant.origin !== event.participant.origin)
		  || (typeof(knownParticipant.origin) === 'function' && !knownParticipant.origin(event.participant.origin))
		) {
			event.cancel("senderOriginMismatch");
			sibilant.metrics.counter("transport.packets.invalidSenderOrigin").inc();
		}
	};
	
	var events=new sibilant.Event();
	events.mixinOnOff(this);
	events.on("preSend",checkFormat);
	events.on("preSend",checkSenderOrigin);

	this.self_id=sibilant.util.generateId();
	
	this.createMessage=function(fields) {
		var now=new Date().getTime();
		fields.ver = fields.ver || 1;
		fields.time = fields.time || now;
		// TODO: track the last used timestamp and make sure we don't send a duplicate messageId
		// default the msg_id to the current timestamp
		fields.msg_id = fields.msg_id || now;
		return fields;
	};
	
	this.createReply=function(message,fields) {
		fields=this.createMessage(fields);
		fields.reply_to=message.msg_id;
		fields.src=fields.src || message.dst;
		fields.dst=fields.dst || message.src;
		return fields;
	};
	
	/**
	 * Allows a listener to add a new participant.  
	 * @fires sibilant.Router#registerParticipant
	 * @param {object} packet The handshake requesting registration.
	 * @param {object} participant the participant object that contains a send() function.
	 * @returns {string} returns participant id
	 */
	this.registerParticipant=function(packet,participant) {
		var participant_id;
		do {
				participant_id=sibilant.util.generateId() + "." + this.self_id;
		} while(this.participants.hasOwnProperty(participant_id));
		
		var registerEvent=new sibilant.CancelableEvent({
			'packet': packet,
			'registration': packet.entity,
			'participant': participant
		});
		events.trigger("preRegisterParticipant",registerEvent);

		if(registerEvent.canceled){
			// someone vetoed this participant
			sibilant.log.log("registeredParticipant[DENIED] origin:"+participant.origin+ 
							" because " + registerEvent.cancelReason);
			return null;
		}
		this.participants[participant_id]=participant;
		sibilant.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
		return participant_id;
	};
	
	/**
	 * @fires sibilant.Router#preSend
	 * @param {sibilant.TransportPacket} packet
	 * @param {sibilant.Participant} sendingParticipant
	 * @return {boolean} True if the message was delivered locally
	 */
	this.deliverLocal=function(packet,sendingParticipant) {
		// check if the recipient is local.  If so, don't bother broadcasting.
		var localParticipant=this.participants[packet.dst];
		if(localParticipant) {
			var preDeliverEvent=new sibilant.CancelableEvent({
				'packet': packet,
				'dstParticipant': localParticipant
			});
			events.trigger("preDeliver",preDeliverEvent);
			if(preDeliverEvent.canceled) {
				sibilant.metrics.counter("transport.packets.rejected").inc();
				return false;
			}
			sibilant.metrics.counter("transport.packets.delivered").inc();
			return localParticipant.receive(packet,sendingParticipant);
		}
		return false;
	};
	
	var self=this;
	this.participants[this.routerControlAddress] = {
		receive: function(packet,sendingParticipant) {
			var reply=self.createReply(packet,{	entity: {status: "ok"} });
			// if from nobody, register them
			if(packet.src===self.nobodyAddress) {
				var participantId=self.registerParticipant(packet,sendingParticipant);
				if(participantId === null) {
					reply.entity.status="denied";
				} else {
					reply.dst=participantId;
				}
			}
			
			if(packet.entity) {
				if(packet.entity.multicast) {
					reply.multicastAdded=self.registerMulticast(sendingParticipant,packet.entity.multicast);
				}
			}
			sendingParticipant.receive(reply);
			return true;
		},
		origin: "routerControlAddress.$router"
	};
	/**
	 * Registers a participant for a multicast group
	 */
	this.registerMulticast=function(participant,multicastGroups) {
		var self=this;
		multicastGroups.forEach(function(groupName) {
			var g=self.participants[groupName];
			if(!g) {
				g=self.participants[groupName]=new sibilant.MulticastParticipant(groupName);
			}
			g.addMember(participant);
		});
		return multicastGroups;
	};
	
	/**
	 * Used by participant listeners to route a message to other participants.
	 * @fires sibilant.Router#preSend
 	 * @fires sibilant.Router#send
 	 * @param {sibilant.TransportPacket} packet The packet to route.
	 * @param {sibilant.Participant} sendingParticipant Information about the participant that is attempting to send
	 *   the packet.
	 * @returns {undefined}
	 */
	this.send=function(packet,sendingParticipant) {

		var preSendEvent=new sibilant.CancelableEvent({
			'packet': packet,
			'participant': sendingParticipant
		});
		events.trigger("preSend",preSendEvent);

		if(preSendEvent.canceled) {
			sibilant.metrics.counter("transport.packets.sendCanceled");
			return;
		} 
		sibilant.metrics.counter("transport.packets.sent").inc();
		if(!this.deliverLocal(packet,sendingParticipant) || this.forwardAll) {
			sibilant.metrics.counter("transport.packets.sentToPeer").inc();
			events.trigger("send",{'packet': packet});
			this.peer.send(packet);
		}
	};
		
	/**
	 * Recieve a packet from the peer
	 * @fires sibilant.Router#peerReceive
	 * @param packet {object} the packet to receive
	 */
	this.receiveFromPeer=function(packet) {
		sibilant.metrics.counter("transport.packets.receivedFromPeer").inc();
		var peerReceiveEvent=new sibilant.CancelableEvent({
			'packet' : packet.data,
			'rawPacket' : packet
		});
		events.trigger("prePeerReceive",peerReceiveEvent);
			
		if(!peerReceiveEvent.canceled){
			this.deliverLocal(packet.data);
		}
	};

	// Wire up to the peer
	this.peer.on("receive",function(event) {
		self.receiveFromPeer(event.packet);
	});
};

//TODO: move autocreation elsewhere
sibilant.defaultRouter=new sibilant.Router();