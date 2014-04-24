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
 * @param {sibilant.TransportPacket} packet 
 */
sibilant.PostMessageParticipant.prototype.receiveFromRouter=function(packet) {
	if(!packet) { throw "CANNOT SEND NULL"; }
	this.sourceWindow.postMessage(packet,this.origin);
	return true;
};


sibilant.PostMessageParticipant.prototype.forwardFromPostMessage=function(event) {
	if(event.origin === this.origin) {
		var packet=event.data;
		packet.src=packet.src || this.address;
		
		this.router.send(event.data,this);
	} else {
		sibilant.metrics.counter("transport."+participant.address+".invalidSenderOrigin").inc();
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
	
	// if this is a window who hasn't talked to us before, sign them up
	if(!participant) {
		participant=new sibilant.PostMessageParticipant({
			'origin': event.origin,
			'sourceWindow': event.source,
			'credentials': event.data.entity
		});
		this.router.registerParticipant(participant,packet);
		this.participants.push(participant);
	}
	
	participant.forwardFromPostMessage(event);
	
};


