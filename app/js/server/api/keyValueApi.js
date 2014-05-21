var ozpIwc=ozpIwc || {};


/**
 * @typedef {object} ozpIwc.KeyValuePair
 * @property {object} data
 * @property {string} contentType
 * @property {object} permissions
 * @property {object} watchers
 */

/**
 * @class
 */
ozpIwc.KeyValueApi = function() {
	this.kvStore=new ozpIwc.KeyValueStore({
		defaultData: function() { 
			return { 
				data: undefined,
				contentType:"application/json",
				permissions:[],
				watchers:[],
				children: []
			};
		}
	});
};

/** 
 * Turn an event into a list of change packets to be sent to the watchers.
 * @todo if we implement multi-dst packets, only return the one. 
 * @param {object} evt
 * @param {string} evt.path - The path of the changed node.
 * @param {ozpIwc.KeyValuePair} evt.node - The node being changed.
 * @param {object} evt.oldData - Value of the node prior to being changed.
 * @param {object} evt.newData - Current value of the node.
	}
 */
ozpIwc.KeyValueApi.prototype.triggerChange=function(evt) {
	return evt.node.watchers.map(function(watcher) {
		var reply={
			'dst'   : watcher.src,
		  'replyTo' : watcher.msgId,
			'action': 'changed',
			'resource': evt.path,
			'entity': {	}
		};
		if(evt.newData || evt.oldData) {
			reply.entity.newValue=evt.newData;
			reply.entity.oldValue=evt.oldData;
		}
		if(evt.addChild) {
			reply.entity.addChild=evt.addChild;
		}
		if(evt.removeChild) {
			reply.entity.removeChild=evt.removeChild;
		}
		return reply;
	});
};


/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApi.prototype.handleGetAsLeader=function(packetContext) {
	return [{
		'action': 'success',
		'entity': this.kvStore.get(packetContext.packet.resource).data
	}];
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApi.prototype.handleSetAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	var oldData=node.data;
	node.data=packet.entity;
	this.kvStore.set(packet.resource,node);
	
	var responses=this.triggerChange({
		'path':packet.resource,
		'node': node,
		'oldData' : oldData,
		'newData' : node.data
	});
	
	responses.unshift({'action': 'success'});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApi.prototype.handleDeleteAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	this.kvStore.delete(packet.resource);
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'oldData' : node.data,
		'newData' : undefined
	});
	
	responses.unshift({'action': 'success'});
	
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApi.prototype.handleWatchAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	
	node.watchers.push({
		src: packet.src,
		msgId: packet.msgId
	});
		
	this.kvStore.set(packet.resource,node);
	return [{
		'action': 'success',
		'entity': {}
	}];
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApi.prototype.handleUnwatchAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	node.watchers=node.watchers.filter(function(w) {
		return packet.replyTo !== w.msgId && packet.src !==w.src;
	});
	
	this.kvStore.set(packet.resource,node);
	
	return [{
		'action': 'success',
		'entity': {}
	}];
};

ozpIwc.KeyValueApi.prototype.handleListAsLeader=function(packetContext) {
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
ozpIwc.KeyValueApi.prototype.handlePushAsLeader=function(packetContext) {
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
ozpIwc.KeyValueApi.prototype.handleUnshiftAsLeader=function(packetContext) {
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
ozpIwc.KeyValueApi.prototype.handlePopAsLeader=function(packetContext) {
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
ozpIwc.KeyValueApi.prototype.handleShiftAsLeader=function(packetContext) {
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

ozpIwc.KeyValueApi.prototype.generateSync=function() {
	return this.kvStore.data;
};

ozpIwc.KeyValueApi.prototype.receiveSync=function(data) {
	this.kvStore.data=data;
};
