ozpIwc.DataApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);
	this.children=[];
});

ozpIwc.DataApiValue.prototype.toPacket=function() {
	var packet=ozpIwc.CommonApiValue.prototype.toPacket.apply(this,arguments);
	packet.links=packet.links || {};
	packet.links.children=this.children;
	return packet;
};

ozpIwc.DataApiValue.prototype.pushChild=function(child) {
	this.children.push(child);
	this.version++;
};

ozpIwc.DataApiValue.prototype.unshiftChild=function(child) {
	this.children.unshift(child);
	this.version++;
};

ozpIwc.DataApiValue.prototype.popChild=function() {
	this.version++;
	return this.children.pop();
};

ozpIwc.DataApiValue.prototype.shiftChild=function() {
	this.version++;
	return this.children.shift();
};
