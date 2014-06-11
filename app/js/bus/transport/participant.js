var ozpIwc=ozpIwc || {};

/**
 * @class
 * @mixes ozpIwc.security.Actor
 * @property {string} address - The assigned address to this address.
 * @property {ozpIwc.security.Subject} securitySubject - The subject for this role.
 */
ozpIwc.Participant=function() {
    this.securitySubject=[];
};

/**
 * @param {ozpIwc.PacketContext} packetContext
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.Participant.prototype.receiveFromRouter=function(packetContext) {
    // doesn't really do anything other than return a bool and prevent "unused param" warnings
    return !packetContext;
};

/**
 * @param {ozpIwc.Router} router
 * @param {string} address
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.Participant.prototype.connectToRouter=function(router,address) {
    this.address=address;
    this.router=router;
    this.securitySubject=this.securitySubject || [];
    this.securitySubject.push("participant:"+address);
    this.msgId=0;
};

/**
 * Populates fields relevant to this packet if they aren't already set:
 * src, ver, msgId, and time.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.fixPacket=function(packet) {
    // clean up the packet a bit on behalf of the sender
    packet.src=packet.src || this.address;
    packet.ver = packet.ver || 1;

    // if the packet doesn't have a msgId, generate one
    packet.msgId = packet.msgId || this.generateMsgId();

    // might as well be helpful and set the time, too
    packet.time = packet.time || ozpIwc.util.now();
    return packet;
};

/**
 * Sends a packet to this participants router.  Calls fixPacket
 * before doing so.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.send=function(packet) {
    packet=this.fixPacket(packet);
    var self=this;
//	window.setTimeout(function(){
    self.router.send(packet,self);
//	},0);
    return packet;
};


ozpIwc.Participant.prototype.generateMsgId=function() {
    return "i:" + this.msgId++;
};

ozpIwc.Participant.prototype.heartbeatStatus=function() {
    return {
        address: this.address,
        subjects: this.securitySubject,
        type: this.participantType || this.constructor.name,
        name: this.name
    };
};