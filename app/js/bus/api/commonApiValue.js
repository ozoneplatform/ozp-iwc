ozpIwc.CommonApiValue = function(config) {
	config = config || {};
	this.watchers=[];
	this.resource=config.resource;
	this.deleteData();
};

ozpIwc.CommonApiValue.prototype.set=function(packet) {
	if(this.isValidContentType(packet.contentType)) {
		var oldValue=(this.entity)?this.toPacket():undefined;
		
		this.permissions=packet.permisions;
		this.contentType=packet.contentType;
		this.entity=packet.entity;
		this.version++;
		return {
			node: this,
			oldValue: oldValue,
			newValue: this.toPacket()
		};
	}
};

ozpIwc.CommonApiValue.prototype.watch=function(packet) {
	this.watchers.push({
		src: packet.src,
		msgId: packet.msgId
	});
};

ozpIwc.CommonApiValue.prototype.unwatch=function(packet) {
	this.watchers=this.watchers.filter(function(w) {
		return packet.replyTo !== w.msgId && packet.src !==w.src;
	});
};

ozpIwc.CommonApiValue.prototype.eachWatcher=function(callback,self) {
	this.watchers.forEach(function(w) {
		return callback.call(self,w);
	});
};

ozpIwc.CommonApiValue.prototype.deleteData=function() {
	var oldValue=this.toPacket();
	this.entity=undefined;
	this.contentType=undefined;
	this.permissions=[];
	this.version=0;
	return {
		node: this,
		oldValue: oldValue,
		newValue: undefined
	};
};

ozpIwc.CommonApiValue.prototype.toPacket=function(base) {
	base = base || {};
	base.entity=ozpIwc.util.clone(this.entity);
	base.contentType=this.contentType;
	base.permissions=ozpIwc.util.clone(this.permissions);
	base.eTag=this.version;
	base.resource=this.resource;
	return base;
};

ozpIwc.CommonApiValue.prototype.isValidContentType=function(contentType) {
	return true;
};
