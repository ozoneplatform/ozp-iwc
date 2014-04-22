
var sibilant=sibilant || {};

/**
 * @class
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

sibilant.PostMessageParticipantListener.prototype.findParticipant=function(sourceWindow) {
	return this.participants.find(function(p) { 
			return p.sourceWindow === sourceWindow;
	});
};

sibilant.PostMessageParticipantListener.prototype.registerParticipant=function(config) {
	var participant=new sibilant.PostMessageParticipant(config);
	this.participants.push(participant);
	
	this.router.registerParticipant(participant);
	
	return participant;
};

sibilant.PostMessageParticipantListener.prototype.receiveFromPostMessage=function(config) {
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
 * @param {string} name
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