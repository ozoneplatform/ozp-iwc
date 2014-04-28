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
