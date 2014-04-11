
var sibilant=sibilant || {};

/**
 * @typedef sibilant.Participant
 * @property origin - The origin of this participant, confirmed via trusted sources.
 * @function receive - Callback for this participant to receive a packet.  Will be called with participant as "this".
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

sibilant.PostMessageParticipantListener=function(config) {
	this.participants={};
	this.router=config.router || sibilant.defaultRouter;
	
	window.addEventListener("message", function(event) {
		var participant=this.findParticipant(event.origin,event.sourceWindow);
		if(!participant) {
			participant=self.registerParticipant({
				'origin': event.origin,
				'sourceWindow': event.source,
				'credentials': event.data.entity
			});
		}
		participant.send(event.data,participant);
	}, false);
	
};

sibilant.PostMessageParticipantListener.prototype.findParticipant=function(origin,sourceWindow) {
	var byOrigin=this.participants[origin];
	if(byOrigin) {
		return byOrigin.find(function(p) { 
			return p.sourceWindow === sourceWindow;
		});
	}
	return null;
};

sibilant.PostMessageParticipantListener.prototype.registerParticipant=function(config) {
	this.participants[origin]=this.participants[origin] || [];
	var participant=new sibilant.PostMessageParticipant(config);
	this.participants[origin].push(participant);
	
	this.router.registerParticipant(participant);
	
	return participant;
};
