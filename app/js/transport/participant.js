/** @namespace */
var sibilant=sibilant || {};

/**
 * @class sibilant.PostMessageParticipant
 * @augments sibilant.Participant
 * @param {object} config
 * @param {string} config.origin
 * @param {object} config.sourceWindow
 * @param {object} config.credentials
 */
sibilant.PostMessageParticipant=function(config) {
	this.origin=config.origin;
	this.sourceWindow=config.sourceWindow;
	this.credentials=config.credentials;
};

/**
 * Receives a packet on behalf of this participant and forwards it via PostMessage.
 * @param {sibilant.TransportPacket} packet 
 */
sibilant.PostMessageParticipant.prototype.receive=function(packet) {
	if(!packet) { throw "CANNOT SEND NULL"; }
	this.sourceWindow.postMessage(packet,this.origin);
	return true;
};


/**
 * @class
 * @param {object} config
 * @param {sibilant.Router} config.router
 */
sibilant.PostMessageParticipantListener=function(config) {
	this.participants={};
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
	return this.participants.find(function(p) { 
			return p.sourceWindow === sourceWindow;
	});
};

/**
 * Register a new participant.
 * @param {object} config
 * @param {string} config.origin
 * @param {object} config.sourceWindow
 * @param {object} config.credentials
 */
sibilant.PostMessageParticipantListener.prototype.registerParticipant=function(config) {
	var participant=new sibilant.PostMessageParticipant(config);
	this.participants.push(participant);
	return participant;
};

/**
 * Process a post message that is received from a peer
 * @param {object} event - The event received from the "message" event handler
 * @param {string} event.origin
 * @param {object} event.source
 * @param {sibilant.TransportPacket} event.data
 */
sibilant.PostMessageParticipantListener.prototype.receiveFromPostMessage=function(event) {
	var participant=this.findParticipant(event.sourceWindow);
	if(!participant) {
		participant=this.registerParticipant({
			'origin': event.origin,
			'sourceWindow': event.source,
			'credentials': event.data.entity
		});
	}

	if(event.origin === participant.origin) {
		this.router.send(event.data,participant);
	} else {
		sibilant.metrics.counter("transport."+participant.address+".invalidSenderOrigin").inc();
	}
};

/**
 * @class
 * @augments sibilant.Participant
 * @param {string} name
 */
sibilant.MulticastParticipant=function(name) {
	this.name=name;
	this.members=[];
};

/**
 * Receives a packet on behalf of the multicast group.
 * @param {sibilant.TransportPacket} packet
 * @returns {Boolean}
 */
sibilant.MulticastParticipant.prototype.receive=function(packet) {
	this.members.forEach(function(m) { m.receive(packet);});
	return false;
};

/**
 * 
 * @param {sibilant.Participant} participant
 */
sibilant.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
};