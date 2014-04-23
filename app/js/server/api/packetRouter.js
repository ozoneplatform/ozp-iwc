var sibilant=sibilant || {};

sibilant.PacketRouter = function(config) {
	this.actionMapper = config.actionMapper || function(packet) { return packet.action; };
	this.target = config.target;
	this.deadPacket = config.deadPacketHandler || function(packet) {};
};

sibilant.PacketRouter.prototype.receive=function(packet,extraInfo) {
	// make more elaborate rules, if necessary
	var action=this.actionMapper(packet,extraInfo);
	
	if(action in this.target) {
		this.target[action].apply(this.target,packet);
	} else {
		this.defaultAction(packet);
	}
};
