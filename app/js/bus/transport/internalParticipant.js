
ozpIwc.InternalParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
	ozpIwc.Participant.apply(this,arguments);
	this.replyCallbacks={};
	this.participantType="internal";
	this.name=config.name;
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
});

/**
 * @param {ozpIwc.PacketContext} packetContext
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.InternalParticipant.prototype.receiveFromRouter=function(packetContext) { 
	var packet=packetContext.packet;
	if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
		if (!this.replyCallbacks[packet.replyTo](packet)) {
            this.cancelCallback(msgId);
        }
	} else {
		this.events.trigger("receive",packet);
	}
};


ozpIwc.InternalParticipant.prototype.send=function(packet,callback) {
	var packet=this.fixPacket(packet);
	if(callback) {
		this.replyCallbacks[packet.msgId]=callback;
	}
	ozpIwc.Participant.prototype.send.apply(this,arguments);

	return packet;
};

ozpIwc.InternalParticipant.prototype.cancelCallback=function(msgId) {
    if (msgId) {
        this.replyCallbacks[msgId]=undefined;
    }
}