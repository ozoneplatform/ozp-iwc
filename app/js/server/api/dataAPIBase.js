var sibilant=sibilant || {};


/**
 * @typedef {object} sibilant.DataApiNode
 * @property {object} data
 * @property {string} contentType
 * @property {object} permissions
 * @property {object} watchers
 */

/**
 * @class sibilant.DataApiBase
 */
sibilant.DataApiBase = function() {
	this.dataTree=new sibilant.DataTree({
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

sibilant.DataApiBase.prototype.triggerChange=function(evt) {
	evt.node.watchers.forEach(function(packetContext) {
		packetContext.reply({
			'action': 'changed',
			'entity': {
				'newValue': evt.newData,
				'oldValue': evt.oldData
			}
		});
	});
};


/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleGetAsLeader=function(packetContext) {
	return {
		'action': 'success',
		'entity': this.dataTree.get(packetContext.packet.resource).data
	};
};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleSetAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.dataTree.get(packet.resource);
	var oldData=node.data;
	node.data=packet.entity;
	this.dataTree.set(packet.resource,node);
	
	this.triggerChange({
		'path':packet.resource,
		'node': node,
		'oldData' : oldData,
		'newData' : node.data
	});
	return {
		'action': 'success',
		'entity': {}
	};
};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleDeleteAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.dataTree.get(packet.resource);
	this.dataTree.delete(packet.resource);
	
	this.triggerChange({
		'path': packet.resource,
		'node': node,
		'oldData' : node.data,
		'newData' : undefined
	});
	
	return {
		'action': 'success',
		'entity': {}
	};
};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleWatchAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.dataTree.get(packet.resource);
	node.watchers.push(packetContext);
	this.dataTree.set(packet.resource,node);
	return {
		'action': 'success',
		'entity': {}
	};
};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleUnwatchAsLeader=function(packetContext) {
	var node=this.dataTree.get(packet.resource);
	node.watchers=node.watchers.filter(function(w) {
		return packet.replyTo !== w.msgId && packet.src !==w.src;
	});
	this.dataTree.set(packet.resource,node);
	return {
		'action': 'success',
		'entity': {}
	};
};