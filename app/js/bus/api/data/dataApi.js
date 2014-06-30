var ozpIwc=ozpIwc || {};

ozpIwc.DataApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.DataApi.prototype.makeValue = function(packet){
    return new ozpIwc.DataApiValue({resource: packet.resource});
};

ozpIwc.DataApi.prototype.createChild=function(node,packetContext) {
	var key=this.createKey(node.resource+"/");

	// save the new child
	var childNode=this.findOrMakeValue(key);
	childNode.set(packetContext.packet);
	return childNode;
};

ozpIwc.DataApi.prototype.handleList=function(node,packetContext) {
	packetContext.replyTo({
        'action': 'ok',
        'entity': node.listChildren()
    });
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handlePush=function(node,packetContext) {
	var childNode=this.createChild(node,packetContext);

	node.pushChild(childNode.resource);
	
	packetContext.replyTo({'action':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleUnshift=function(node,packetContext) {
	var childNode=this.createChild(node,packetContext);

	node.unshiftChild(childNode.resource);
	
	packetContext.replyTo({'action':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handlePop=function(node,packetContext) {
	var child=this.findOrMakeValue(node.popChild());
	// delegate to the handleGet call
	this.invokeHandler(child,packetContext,this.handleGet);
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleShift=function(node,packetContext) {
	var child=this.findOrMakeValue(node.shiftChild());
	// delegate to the handleGet call
	this.invokeHandler(child,packetContext,this.handleGet);
};
