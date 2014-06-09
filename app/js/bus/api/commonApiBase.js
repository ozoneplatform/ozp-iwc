/**
 * The Common API Base implements the API Common Conventions.  It is intended to be subclassed by
 * the specific API implementations.
 * @class
 */
ozpIwc.CommonApiBase = function(config) {
	config = config || {};
	this.data={};
};
/**
 * Creates a new value for the given packet's request.  Subclasses must override this
 * function to return the proper value based upon the packet's resource, content type, or
 * other parameters.
 * 
 * @abstract
 * @param {type} packet
 * @returns {ozpIwc.CommonApiValue} an object implementing the commonApiValue interfaces
 */
ozpIwc.CommonApiBase.prototype.makeValue=function(packet) {
	throw new Error("Subclasses of CommonApiBase must implement the makeValue(packet) function.");
};

/** 
 * Turn an event into a list of change packets to be sent to the watchers.
 * @param {object} evt
 * @param {ozpIwc.CommonApiBase} evt.node - The node being changed.
 * @param {object} evt.oldData - Information about the previous value of the node, or undefined if it was just created.
 * @param {object} evt.newData - Information about the new value of the node, or undefined if it was just created.
	}
 */
ozpIwc.CommonApiBase.prototype.triggerChange=function(evt) {
	return evt.node.watchers.map(function(watcher) {
		var reply={
			'dst'   : watcher.src,
		  'replyTo' : watcher.msgId,
			'action': 'changed',
			'resource': evt.node.resource,
			'entity': {
				'newValue': evt.newValue,
				'oldValue': evt.oldValue
			}
		};

		
		return reply;
	});
};

ozpIwc.CommonApiBase.prototype.findOrMakeValue=function(packet) {
	var node=this.data[packet.resource];
	
	if(!node) {
		node=this.data[packet.resource]=this.makeValue(packet);
	}
	return node;
};

ozpIwc.CommonApiBase.prototype.receiveFromRouter=function(packetContext) {
	if(packetContext.leaderState !== 'leader')	{
		// if not leader, just drop it.
		return;
	}
	
	var packet=packetContext.packet;
	var checkdown=[];
	var handler;
	if(packet.action) {
		handler="handle" + packet.action.charAt(0).toUpperCase() + packet.action.slice(1).toLowerCase();
		checkdown.push(handler);
	}
	
	if(typeof(this[handler]) !== 'function') {
		handler='defaultHandler';
	}
	
	var results=handler.call(this.target,packetContext);
	results.forEach(function(reply) {
		this.send(reply);
	},this.participant);
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleGet=function(packetContext) {
	var node=this.findOrMakeValue(packetContext.packet);
	
	return [node.toPacket({'action': 'ok'})];
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleSet=function(packetContext) {
	var packet=packetContext.packet;
	
	var node=this.findOrMakeValue(packet);
	
	var responses=this.triggerChange(node.set(packet));
	
	responses.unshift({'action': 'ok'});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleDelete=function(packetContext) {
	var packet=packetContext.packet;
	
	var node=this.findOrMakeValue(packet);
	
	var responses=this.triggerChange(node.deleteData());
	
	responses.unshift({'action': 'ok'});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleWatch=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.findOrMakeValue(packet);
	
	node.watch(packet);
	
	var response={'action': 'ok'};

	// TODO: Return the entity if the watcher is permitted

	return [response];
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleUnwatch=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.findOrMakeValue(packet);
	
	node.unwatch(packet);
		
	return [{'action': 'ok'}];
};



