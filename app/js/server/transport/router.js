
var sibilant=sibilant || {};

/**
 * @typedef sibilant.Participant
 * @property {string} origin - The origin of this participant, confirmed via trusted sources.
 * @property {string} address - The assigned address to this address.
 * @property {function} receive - Callback for this participant to receive a packet.  Will be called with participant as "this".
 */

/**
 * @typedef sibilant.TransportPacket
 * @property {string} src - The participant address that sent this packet
 * @property {string} dst - The intended recipient of this packet
 * @property {Number} ver - Protocol Version.  Should be 1
 * @property {Number} msgId - A unique id for this packet.
 * @property {object} entity - The payload of this packet.
 * @property {Number} [time] - The time in milliseconds since epoch that this packet was created.
 * @property {Number} [replyTo] - Reference to the msgId that this is in reply to.
 * @property {string} [action] - Action to be performed.
 * @property {string} [resource] - Resource to perform the action upon.
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

	this.self_id=sibilant.util.generateId();
	
	// Stores all local addresses
	this.participants={};
	
	sibilant.metrics.gauge("transport.participants").set(function() {
		return Object.keys(self.participants).length;
	});

	this.events=new sibilant.Event();
	this.events.mixinOnOff(this);
	
	// Wire up to the peer
	this.peer.on("receive",function(event) {
		self.receiveFromPeer(event.packet);
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
		if(event.canceled) {
			sibilant.metrics.counter("transport.packets.invalidFormat").inc();
		}
	};
	this.events.on("preSend",checkFormat);

	// TODO: move all of this to the "names" service
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

};

sibilant.Router.prototype.createMessage=function(fields) {
	var now=new Date().getTime();
	fields.ver = fields.ver || 1;
	fields.time = fields.time || now;
	// TODO: track the last used timestamp and make sure we don't send a duplicate messageId
	// default the msgId to the current timestamp
	fields.msgId = fields.msgId || now;
	return fields;
};

sibilant.Router.prototype.createReply=function(message,fields) {
	fields=this.createMessage(fields);
	fields.replyTo=message.msgId;
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
sibilant.Router.prototype.registerParticipant=function(packet,participant) {
	var participant_id;
	do {
			participant_id=sibilant.util.generateId() + "." + this.self_id;
	} while(this.participants.hasOwnProperty(participant_id));

	var registerEvent=new sibilant.CancelableEvent({
		'packet': packet,
		'registration': packet.entity,
		'participant': participant
	});
	this.events.trigger("preRegisterParticipant",registerEvent);

	if(registerEvent.canceled){
		// someone vetoed this participant
		sibilant.log.log("registeredParticipant[DENIED] origin:"+participant.origin+ 
						" because " + registerEvent.cancelReason);
		return null;
	}
	this.participants[participant_id]=participant;
	participant.address=participant_id;
	
	sibilant.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
	return participant_id;
};

/**
 * @fires sibilant.Router#preSend
 * @param {sibilant.TransportPacket} packet
 * @param {sibilant.Participant} sendingParticipant
 * @return {boolean} True if the message was delivered locally
 */
sibilant.Router.prototype.deliverLocal=function(packet,sendingParticipant) {
	// check if the recipient is local.  If so, don't bother broadcasting.
	var localParticipant=this.participants[packet.dst];
	if(localParticipant) {
		var preDeliverEvent=new sibilant.CancelableEvent({
			'packet': packet,
			'dstParticipant': localParticipant
		});
		this.events.trigger("preDeliver",preDeliverEvent);
		if(preDeliverEvent.canceled) {
			sibilant.metrics.counter("transport.packets.rejected").inc();
			return false;
		}
		sibilant.metrics.counter("transport.packets.delivered").inc();
		return localParticipant.receive(packet,sendingParticipant);
	}
	return false;
};


/**
 * Registers a participant for a multicast group
 */
sibilant.Router.prototype.registerMulticast=function(participant,multicastGroups) {
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
sibilant.Router.prototype.send=function(packet,sendingParticipant) {

	var preSendEvent=new sibilant.CancelableEvent({
		'packet': packet,
		'participant': sendingParticipant
	});
	this.events.trigger("preSend",preSendEvent);

	if(preSendEvent.canceled) {
		sibilant.metrics.counter("transport.packets.sendCanceled");
		return;
	} 
	sibilant.metrics.counter("transport.packets.sent").inc();
	if(!this.deliverLocal(packet,sendingParticipant) || this.forwardAll) {
		sibilant.metrics.counter("transport.packets.sentToPeer").inc();
		this.events.trigger("send",{'packet': packet});
		this.peer.send(packet);
	}
};

/**
 * Recieve a packet from the peer
 * @fires sibilant.Router#peerReceive
 * @param packet {sibilant.TransportPacket} the packet to receive
 */
sibilant.Router.prototype.receiveFromPeer=function(packet) {
	sibilant.metrics.counter("transport.packets.receivedFromPeer").inc();
	var peerReceiveEvent=new sibilant.CancelableEvent({
		'packet' : packet.data,
		'rawPacket' : packet
	});
	this.events.trigger("prePeerReceive",peerReceiveEvent);

	if(!peerReceiveEvent.canceled){
		this.deliverLocal(packet.data);
	}
};

