var ozpIwc=ozpIwc || {};

ozpIwc.DataApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.CommonApiBase.prototype.handleListAsLeader=function(node,packetContext) {
	return [{'action': 'success','entity': node.children}];
};

ozpIwc.DataApi.prototype.createChild=function(node,packetContext) {
	var key=this.generateKey(node.resource+"/");

	// save the new child
	var childNode=this.findOrMakeValue(key);
	childNode.set(packetContext.packet);
	return childNode;
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handlePushAsLeader=function(node,packetContext) {
	var childNode=this.createChild(node,packetContext);

	node.pushChild(childNode.resource);
	
	packetContext.reply({'action':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleUnshiftAsLeader=function(node,packetContext) {
	var childNode=this.createChild(node,packetContext);

	node.unshiftChild(childNode.resource);
	
	packetContext.reply({'action':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handlePopAsLeader=function(node,packetContext) {
	var child=this.findOrMakeValue(node.popChild());
	// delegate to the handleGet call
	this.invokeHandler(child,packetContext,this.handleGet);
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleShiftAsLeader=function(node,packetContext) {
	var child=this.findOrMakeValue(node.shiftChild());
	// delegate to the handleGet call
	this.invokeHandler(child,packetContext,this.handleGet);
};
