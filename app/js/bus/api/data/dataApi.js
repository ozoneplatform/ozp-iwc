var ozpIwc=ozpIwc || {};

ozpIwc.DataApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.CommonApiBase.prototype.handleListAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	if(packet.resource) {
		var node=this.kvStore.get(packet.resource);
		return [{'action': 'success','entity': node.children}];
	} else {
		return [{'action': 'success','entity': this.kvStore.keys()}];
	}
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handlePushAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);

	var key;
	do {
		key=packet.resource +"/"+ ozpIwc.util.generateId();
	} while(this.kvStore.hasKey(key));

	// save the new child
	var childNode=this.kvStore.get(key);
	childNode.data=packet.entity;
	this.kvStore.set(key,childNode);
	
	// save a copy of the old data
	node.children.push(key);
	this.kvStore.set(packet.resource,node);	
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'addChild' : key
	});
	responses.unshift({'action': 'success','entity': {'resource':key}});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleUnshiftAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);

	var key;
	do {
		key=packet.resource +"/"+ ozpIwc.util.generateId();
	} while(this.kvStore.hasKey(key));

	// save the new child
	var childNode=this.kvStore.get(key);
	childNode.data=packet.entity;
	this.kvStore.set(key,childNode);
	
	// save a copy of the old data
	node.children.unshift(key);
	this.kvStore.set(packet.resource,node);	
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'addChild' : key
	});
	responses.unshift({'action': 'success','entity': {'resource':key}});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handlePopAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	
	if(!node.children.length) {
		return [{action:'noChild'}];
	}
	var key=node.children.pop();
	
	this.kvStore.set(packet.resource,node);
	// save the new child
	var childNode=this.kvStore.get(key);
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'removeChild' : key
	});
	responses.unshift({action: 'success',entity: childNode.data});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleShiftAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	
	if(!node.children.length) {
		return [{action:'noChild'}];
	}
	var key=node.children.shift();
	
	this.kvStore.set(packet.resource,node);
	// save the new child
	var childNode=this.kvStore.get(key);
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'removeChild' : key
	});
	responses.unshift({action: 'success',entity: childNode.data});
	return responses;
};
