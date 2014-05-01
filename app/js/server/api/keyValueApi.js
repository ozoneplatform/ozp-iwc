var sibilant=sibilant || {};


/**
 * @typedef {object} sibilant.KeyValuePair
 * @property {object} data
 * @property {string} contentType
 * @property {object} permissions
 * @property {object} watchers
 */

/**
 * @class
 */
sibilant.KeyValueApi = function() {
	this.kvStore=new sibilant.KeyValueStore({
		defaultData: function() { 
			return { 
				data: undefined,
				contentType:"application/json",
				permissions:[],
				watchers:[]
			};
		}
	});
};

/** 
 * Turn an event into a list of change packets to be sent to the watchers.
 * @todo if we implement multi-dst packets, only return the one. 
 * @param {object} evt
 * @param {string} evt.path - The path of the changed node.
 * @param {sibilant.KeyValuePair} evt.node - The node being changed.
 * @param {object} evt.oldData - Value of the node prior to being changed.
 * @param {object} evt.newData - Current value of the node.
	}
 */
sibilant.KeyValueApi.prototype.triggerChange=function(evt) {
	return evt.node.watchers.map(function(packet) {
		return {
			'dst'   : packet.src,
			'action': 'changed',
		  'replyTo' : packet.msgId,
			'resource': evt.path,
			'entity': {
				'newValue': evt.newData,
				'oldValue': evt.oldData
			}
		};
	});
};


/**
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.KeyValueApi.prototype.handleGetAsLeader=function(packetContext) {
	return [{
		'action': 'success',
		'entity': this.kvStore.get(packetContext.packet.resource).data
	}];
};

/**
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.KeyValueApi.prototype.handleSetAsLeader=function(packetContext) {
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
	
	responses.push({'action': 'success'});
	return responses;
};

/**
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.KeyValueApi.prototype.handlePushAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);

	// save a copy of the old data
	var oldData=node.data;
	
	// if not set, initialize to an array
	if(node.data===undefined) {
		node.data=[];
	} 	
	
	// can only operate on an array
	if(!Array.isArray(node.data)) {
		return [{
				'action': 'invalidOperation'
		}];
	}
	
	// copy the old data and push the value onto it
	node.data=node.data.slice();
	node.data.push(packet.entity);
	this.kvStore.set(packet.resource,node);
	
	var responses=this.triggerChange({
		'path':packet.resource,
		'node': node,
		'oldData' : oldData,
		'newData' : node.data
	});
	
	responses.push({
		'action': 'success',
		'entity': {
			'oldValue' : oldData,
			'newValue' : node.data
		}
	});
	return responses;
};



/**
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.KeyValueApi.prototype.handleDeleteAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	this.kvStore.delete(packet.resource);
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'oldData' : node.data,
		'newData' : undefined
	});
	
	responses.push({'action': 'success'});
	
	return responses;
};

/**
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.KeyValueApi.prototype.handleWatchAsLeader=function(packetContext) {
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
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.KeyValueApi.prototype.handleUnwatchAsLeader=function(packetContext) {
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

sibilant.KeyValueApi.prototype.handleListAsLeader=function(packetContext) {
	return [{'action': 'success','entity': this.kvStore.keys()}];
};	


sibilant.KeyValueApi.prototype.generateSync=function() {
	return this.kvStore.data;
};

sibilant.KeyValueApi.prototype.receiveSync=function(data) {
	this.kvStore.data=data;
};
