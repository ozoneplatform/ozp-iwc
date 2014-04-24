var sibilant=sibilant || {};

/**
 * @class
 * @mixes sibilant.security.Actor
 * @property {string} address - The assigned address to this address.
 * @property {sibilant.security.Subject} securitySubject - The subject for this principal.
 */
sibilant.Participant=function() {
	this.securitySubject=[];
};

/**
 * @param {sibilant.PacketContext} packetContext
 * @returns {boolean} true if this packet could have additional recipients
 */
sibilant.Participant.prototype.receiveFromRouter=function(packetContext) { 
	// doesn't really do anything other than return a bool and prevent "unused param" warnings
	return !packetContext;
	};

/**
 * @param {sibilant.Router} router
 * @param {string} address
 * @returns {boolean} true if this packet could have additional recipients
 */
sibilant.Participant.prototype.connectToRouter=function(router,address) {
	this.address=address;
	this.router=router;
	this.securitySubject=this.securitySubject || [];
	this.securitySubject.push("participant:"+address);
};

/**
 * @class
 * @extends sibilant.Participant
 * @param {string} name
 */
sibilant.MulticastParticipant=sibilant.util.extend(sibilant.Participant,function(name) {
	this.name=name;
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