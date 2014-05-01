/** @namespace */
var sibilant=sibilant || {};

/**
 * @class sibilant.PostMessageParticipant
 * @extends sibilant.Participant
 * @param {object} config
 * @param {string} config.origin
 * @param {object} config.sourceWindow
 * @param {object} config.credentials
 */
sibilant.PostMessageParticipant=sibilant.util.extend(sibilant.Participant,function(config) {
	sibilant.Participant.apply(this,arguments);
	this.origin=config.origin;
	this.sourceWindow=config.sourceWindow;
	this.credentials=config.credentials;
	this.securitySubject.push("origin:"+this.origin);
});

/**
 * Receives a packet on behalf of this participant and forwards it via PostMessage.
 * @param {sibilant.TransportPacketContext} packetContext 
 */
sibilant.PostMessageParticipant.prototype.receiveFromRouter=function(packetContext) {
	this.sendToRecipient(packetContext.packet);
	return true;
};

/**
 * Sends a message to the other end of our connection.  Wraps any string mangling
 * necessary by the postMessage implementation of the browser.
 * @param {sibilant.TransportPacket} packet
 * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
 * @returns {undefined}
 */
sibilant.PostMessageParticipant.prototype.sendToRecipient=function(packet) {
	this.sourceWindow.postMessage(JSON.stringify(packet),this.origin);
};

/**
 * The participant hijacks anything addressed to "$transport" and serves it
 * directly.  This isolates basic connection checking from the router, itself.
 * @param {object} packet
 * @returns {undefined}
 */
sibilant.PostMessageParticipant.prototype.handleTransportPacket=function(packet) {
	var reply={
		'ver': 1,
		'dst': this.address,
		'src': '$transport',
		'replyTo': packet.msgId,
		'msgId': this.generateMsgId(),
		'entity': {
			"address": this.address
		}
	};
	this.sendToRecipient(reply);
};


/**
 * 
 * @todo track the last used timestamp and make sure we don't send a duplicate messageId
 * @param {sibilant.TransportPacket} packet
 * @param {type} event
 * @returns {undefined}
 */
sibilant.PostMessageParticipant.prototype.forwardFromPostMessage=function(packet,event) {
	if(typeof(packet) !== "object") {
		sibilant.log.error("Unknown packet received: " + JSON.stringify(packet));
		return;
	}
	if(event.origin !== this.origin) {
		/** @todo participant changing origins should set off more alarms, probably */
		sibilant.metrics.counter("transport."+participant.address+".invalidSenderOrigin").inc();
		return;
	}
	
	packet=this.fixPacket(packet);
	
	// if it's addressed to $transport, hijack it
	if(packet.dst === "$transport") {
		this.handleTransportPacket(packet);
	} else {
		this.router.send(packet,this);
	}
};

/**
 * @class
 * @param {object} config
 * @param {sibilant.Router} config.router
 */
sibilant.PostMessageParticipantListener=function(config) {
	config = config || {};
	this.participants=[];
	this.router=config.router || sibilant.defaultRouter;
	
	var self=this;
	
	window.addEventListener("message", function(event) {
		self.receiveFromPostMessage(event);
	}, false);	
};

/**
 * Finds the participant associated with the given window.  Unfortunately, this is an
 * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
 * compare windows other than equality.
 * @param {object} sourceWindow - the participant window handle from message's event.source 
 */
sibilant.PostMessageParticipantListener.prototype.findParticipant=function(sourceWindow) {
	for(var i=0; i< this.participants.length; ++i) {
		if(this.participants[i].sourceWindow === sourceWindow) {
			return this.participants[i];
		}
	};
};

/**
 * Process a post message that is received from a peer
 * @param {object} event - The event received from the "message" event handler
 * @param {string} event.origin
 * @param {object} event.source
 * @param {sibilant.TransportPacket} event.data
 */
sibilant.PostMessageParticipantListener.prototype.receiveFromPostMessage=function(event) {
	var participant=this.findParticipant(event.source);
	var packet=event.data;

	if(typeof(event.data)==="string") {
		packet=JSON.parse(event.data);
	}
	
	// if this is a window who hasn't talked to us before, sign them up
	if(!participant) {
		participant=new sibilant.PostMessageParticipant({
			'origin': event.origin,
			'sourceWindow': event.source,
			'credentials': packet.entity
		});
		this.router.registerParticipant(participant,packet);
		this.participants.push(participant);
	}
	
	participant.forwardFromPostMessage(packet,event);
};


