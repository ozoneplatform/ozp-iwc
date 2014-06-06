var ozpIwc=ozpIwc || {};

/**
 * @class
 * @extends ozpIwc.Participant
 * @param {string} name
 */
ozpIwc.MulticastParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(name) {
	ozpIwc.Participant.apply(this,arguments);
	this.name=name;
	this.participantType="multicast";
	this.members=[];
});

/**
 * Receives a packet on behalf of the multicast group.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean}
 */
ozpIwc.MulticastParticipant.prototype.receiveFromRouter=function(packet) {
	this.members.forEach(function(m) { m.receiveFromRouter(packet);});
	return false;
};

/**
 * 
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
};

ozpIwc.MulticastParticipant.prototype.heartbeatStatus=function() {
	var status= ozpIwc.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.members=this.members.map(function(m) { return m.address;});
	return status;
};