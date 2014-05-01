
sibilant.InternalParticipant=sibilant.util.extend(sibilant.Participant,function(config) {
	sibilant.Participant.apply(this,arguments);
	this.replyCallbacks={};
	
	this.events=new sibilant.Event();
	this.events.mixinOnOff(this);
});

/**
 * @param {sibilant.PacketContext} packetContext
 * @returns {boolean} true if this packet could have additional recipients
 */
sibilant.InternalParticipant.prototype.receiveFromRouter=function(packetContext) { 
	var packet=packetContext.packet;
	if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
		this.replyCallbacks[packet.replyTo](packet);
	} else {
		this.events.trigger("receive",packet);
	}	
};


sibilant.InternalParticipant.prototype.send=function(packet,callback) {
	var packet=sibilant.Participant.prototype.send.apply(this,arguments);
	
	if(callback) {
		this.replyCallbacks[packet.msgId]=callback;
	}
	return packet;
};