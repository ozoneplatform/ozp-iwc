var sibilant=sibilant || {};

/**
 * @typedef sibilant.TransportPacket
 * @property {string} src - The participant address that sent this packet
 * @property {string} dst - The intended recipient of this packet
 * @property {Number} ver - Protocol Version.  Should be 1
 * @property {Number} msgId - A unique id for this packet.
 * @property {object} entity - The payload of this packet.
 * @property {object} [permissions] - Permissions required to see the payload of this packet.
 * @property {Number} [time] - The time in milliseconds since epoch that this packet was created.
 * @property {Number} [replyTo] - Reference to the msgId that this is in reply to.
 * @property {string} [action] - Action to be performed.
 * @property {string} [resource] - Resource to perform the action upon.
 */

/**
 * @class 
 * @param {object} config
 * @param {sibilant.TransportPacket} config.packet
 * @param {sibilant.Router} config.router
 * @param {sibilant.Participant} [config.srcParticpant]
 * @param {sibilant.Participant} [config.dstParticpant]
 * @property {sibilant.TransportPacket} packet
 * @property {sibilant.Router} router
 * @property {sibilant.Participant} [srcParticpant]
 * @property {sibilant.Participant} [dstParticpant]
 */
sibilant.TransportPacketContext=function(config) {
	for(var i in config) {
		this[i]=config[i];
	}
};

/**
 * 
 * @param {sibilant.TransportPacket} response
 * @returns {sibilant.TransportPacket} the packet that was sent
 */
sibilant.TransportPacketContext.prototype.replyTo=function(response) {
	var now=new Date().getTime();
	response.ver = response.ver || 1;
	response.time = response.time || now;
	// TODO: track the last used timestamp and make sure we don't send a duplicate messageId
	// default the msgId to the current timestamp
	response.msgId = response.msgId || now;
	response.replyTo=response.replyTo || this.packet.msgId;
	response.src=response.src || this.packet.dst;
	response.dst=response.dst || this.packet.src;
	this.router.send(response);
	return response;
};

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
 */
sibilant.RouterWatchdog=sibilant.util.extend(sibilant.InternalParticipant,function(config) {
	sibilant.InternalParticipant.apply(this,arguments);
	
	this.participantType="routerWatchdog";
	this.on("connected",function() {
		this.name=this.router.self_id;
	},this);
	
	this.heartbeatFrequency=config.heartbeatFrequency || 10000;
	var self=this;
	
	this.timer=window.setInterval(function() {
		var heartbeat={
			dst: "names.api",
			action: "set",
			resource: "/router/" + self.router.self_id,
			entity: { participants: {} }
		};
		for(var k in self.router.participants) {
			heartbeat.entity.participants[k]=self.router.participants[k].heartbeatStatus();
		}
		self.send(heartbeat);
	},this.heartbeatFrequency);
});

sibilant.RouterWatchdog.prototype.connectToRouter=function(router,address) {
	sibilant.Participant.prototype.connectToRouter.apply(this,arguments);
	this.name=router.self_id;
};

sibilant.RouterWatchdog.prototype.shutdown=function() {
	window.clearInterval(this.timer);
};

/**
 * @class
 * @param {object} [config]
 * @param {sibilant.Peer} [config.peer=sibilant.defaultPeer]
 */
sibilant.Router=function(config) {
	config=config || {};
	this.peer=config.peer || sibilant.defaultPeer;

//	this.nobodyAddress="$nobody";
//	this.routerControlAddress='$transport';
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
	this.watchdog=new sibilant.RouterWatchdog({router: this});
	this.registerParticipant(this.watchdog);
};

/**
 * Allows a listener to add a new participant.  
 * @fires sibilant.Router#registerParticipant
 * @param {object} participant the participant object that contains a send() function.
 * @param {object} packet The handshake requesting registration.
 * @returns {string} returns participant id
 */
sibilant.Router.prototype.registerParticipant=function(participant,packet) {
	packet = packet || {};
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
	participant.connectToRouter(this,participant_id);
	
	sibilant.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
	return participant_id;
};

/**
 * @fires sibilant.Router#preSend
 * @param {sibilant.TransportPacket} packet
 * @param {sibilant.Participant} sendingParticipant
 */
sibilant.Router.prototype.deliverLocal=function(packet,sendingParticipant) {
	if(!packet) {
		throw "Cannot deliver a null packet!";
	}
	var localParticipant=this.participants[packet.dst];
	if(!localParticipant) {
		return;
	}
	var packetContext=new sibilant.TransportPacketContext({
		'packet':packet,
		'router': this,
		'srcParticipant': sendingParticipant,
		'dstParticipant': localParticipant
	});

	var preDeliverEvent=new sibilant.CancelableEvent({
		'packet': packet,
		'dstParticipant': localParticipant,
		'srcParticipant': sendingParticipant			
	});

	if(this.events.trigger("preDeliver",preDeliverEvent).canceled) {
		sibilant.metrics.counter("transport.packets.rejected").inc();
		return;
	}

	sibilant.authorization.isPermitted(localParticipant.securitySubject,packet.permissions)
		.success(function() {
			sibilant.metrics.counter("transport.packets.delivered").inc();
			localParticipant.receiveFromRouter(packetContext);
		})
		.failure(function() {
			/** @todo do we send a "denied" message to the destination?  drop?  who knows? */
			sibilant.metrics.counter("transport.packets.forbidden").inc();
		});
	
};


/**
 * Registers a participant for a multicast group
 * @param {sibilant.Participant} participant
 * @param {String[]} multicastGroups
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
	this.deliverLocal(packet,sendingParticipant);
	this.events.trigger("send",{'packet': packet});
	this.peer.send(packet);
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

