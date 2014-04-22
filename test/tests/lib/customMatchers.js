var customMatchers={
	toBeInstanceOf: function() { return {
		compare: function(actual,expected) {
			var result={ pass: actual instanceof expected };
			if(result.pass) {
				result.message="Expected " + actual + " to NOT be an instance of " + expected;
			} else {
				result.message="Expected " + actual + " to be an instance of " + expected;
			}
			return result;
		}
	};}
};


var FakePeer=function() {
	this.events=new sibilant.Event();
		
	this.events.mixinOnOff(this);
		
	this.packets=[];
	this.send=function(packet) {
		this.packets.push(packet);
	};
};


var TestParticipant=function(config) {
	this.origin=config.origin || "foo.com";
	
	this.packets=[];
	this.messageId=1;
	this.callbacks={};
	this.connect=function(router) {
		this.router=router;
		this.address=router.registerParticipant({},this);
	};
	
	if(config.router) {
		this.connect(config.router);
	}
	
	this.receive=function(packet){ 
		if(this.callbacks[packet.replyTo]) {
			this.callbacks[packet.replyTo](packet);
		}
		this.packets.push(packet); 
		return true;
	};

	this.send=function(packet,callback) {
		packet.ver=packet.ver || 1;
		packet.src=packet.src || this.address;
		packet.dst=packet.dst || config.dst;
		packet.msgId= packet.msgId || this.messageId++;
		packet.time=packet.time || new Date().getTime();

		if(callback) {
			this.callbacks[packet.msgId]=callback;
		}
		this.router.send(packet,this);
		return packet;
	};
	
	this.reply=function(originalPacket,packet,callback) {
		packet.ver=packet.ver || originalPacket.ver || 1;
		packet.src=packet.src || originalPacket.dst || this.address;
		packet.dst=packet.dst || originalPacket.src || config.dst;
		packet.msgId= packet.msgId || this.messageId++;
		packet.time=packet.time || new Date().getTime();
		
		packet.replyTo=originalPacket.msgId;

		packet.action=packet.action || originalPacket.action;
		packet.resource=packet.resource || originalPacket.resource;

		if(callback) {
			this.callbacks[packet.msgId]=callback;
		}
		this.router.send(packet,this);
		return packet;	
	};
};

