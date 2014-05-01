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
	this.msgId=0;
};

/**
 * Populates fields relevant to this packet if they aren't already set:
 * src, ver, msgId, and time.
 * @param {sibilant.TransportPacket} packet
 * @returns {sibilant.TransportPacket}
 */
sibilant.Participant.prototype.fixPacket=function(packet) {
	// clean up the packet a bit on behalf of the sender
	packet.src=packet.src || this.address;
	packet.ver = packet.ver || 1;

	// if the packet doesn't have a msgId, use a timestamp
	if(!packet.msgId) {
		var now=sibilant.util.now();
		packet.msgId = packet.msgId || this.generateMsgId();

		// might as well be helpful and set the time, too
		packet.time = packet.time || now;
	}
	return packet;
};

/**
 * Sends a packet to this participants router.  Calls fixPacket
 * before doing so.
 * @param {sibilant.TransportPacket} packet
 * @returns {sibilant.TransportPacket}
 */
sibilant.Participant.prototype.send=function(packet) {
	packet=this.fixPacket(packet);
	this.router.send(packet,this);
	return packet;
};


sibilant.Participant.prototype.generateMsgId=function() {
	return "i:" + this.msgId++;
};