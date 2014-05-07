var sibilant=sibilant || {};

/**
 * @class
 * @extends sibilant.Participant
 * @param {string} name
 */
sibilant.MulticastParticipant=sibilant.util.extend(sibilant.Participant,function(name) {
	sibilant.Participant.apply(this,arguments);
	this.name=name;
	this.participantType="multicast";
	this.members=[];
});

/**
 * Receives a packet on behalf of the multicast group.
 * @param {sibilant.TransportPacket} packet
 * @returns {Boolean}
 */
sibilant.MulticastParticipant.prototype.receiveFromRouter=function(packet) {
	this.members.forEach(function(m) { m.receiveFromRouter(packet);});
	return false;
};

/**
 * 
 * @param {sibilant.Participant} participant
 */
sibilant.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
};

sibilant.MulticastParticipant.prototype.heartbeatStatus=function() {
	var status= sibilant.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.members=this.members.map(function(m) { return m.address;});
	return status;
};