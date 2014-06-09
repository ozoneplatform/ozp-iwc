/**
 * The Common API Base implements the API Common Conventions.  It is intended to be subclassed by
 * the specific API implementations.
 * @class
 */
ozpIwc.CommonApiBase = function(config) {
	config = config || {};
	this.participant=config.participant;
	
	this.participant.on("receive",ozpIwc.CommonApiBase.prototype.routePacket,this);
	
	this.data={};
};
/**
 * Creates a new value for the given packet's request.  Subclasses must override this
 * function to return the proper value based upon the packet's resource, content type, or
 * other parameters.
 * 
 * @abstract
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.CommonApiValue} an object implementing the commonApiValue interfaces
 */
ozpIwc.CommonApiBase.prototype.makeValue=function(packet) {
	throw new Error("Subclasses of CommonApiBase must implement the makeValue(packet) function.");
};

/**
 * Determines whether the action implied by the packet is permitted to occur on
 * node in question.
 * @todo the refactoring of security to allow action-level permissions
 * @todo make the packetContext have the srcSubject inside of it
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.CommonApiBase.prototype.isPermitted=function(node,packetContext) {
	var subject=packetContext.srcSubject || ["participant:"+packetContext.packet.src];
	
	var permissions=node.permissions;
	return ozpIwc.authorization.isPermitted(subject,permissions);
};


/** 
 * Turn an event into a list of change packets to be sent to the watchers.
 * @param {object} evt
 * @param {ozpIwc.CommonApiValue} evt.node - The node being changed.
 * @param {object} evt.oldData - Information about the previous value of the node, or undefined if it was just created.
 * @param {object} evt.newData - Information about the new value of the node, or undefined if it was just created.
	}
 */
ozpIwc.CommonApiBase.prototype.notifyWatchers=function(evt) {
	return evt.node.watchers.map(function(watcher) {
		// @TODO check that the recipient has permission to both the new and old values
		var reply={
			'dst'   : watcher.src,
		  'replyTo' : watcher.msgId,
			'action': 'changed',
			'resource': evt.node.resource,
			'permissions': [].concat(evt.newValue.permissions||[]).concat(evt.oldValue.permissions||[]),
			'entity': {
				'newValue': evt.newValue,
				'oldValue': evt.oldValue
			}
		};
		this.participant.send(reply);
	});
};

/**
 * For a given packet, return the value if it already exists, otherwise create the value
 * using makeValue()
 * @protected
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.CommonApiBase.prototype.findOrMakeValue=function(packet) {
	var node=this.data[packet.resource];
	
	if(!node) {
		node=this.data[packet.resource]=this.makeValue(packet);
	}
	return node;
};

/**
 * Accept a packet and do all of the pre/post routing checks.  This include
 * <ul>
 * <li> Pre-routing checks	<ul>
 *		<li> Permission check</li>
 *		<li> ACL Checks (todo)</li>
 *		<li> Precondition checks</li>
 * </ul></li>
 * <li> Post-routing actions <ul>
 *		<li> Reply to requester </li>
 *		<li> If node version changed, notify all watchers </li>
 * </ul></li>
 * @param {ozpIwc.TransportPacketContext} packetContext
 * @returns {undefined}
 */
ozpIwc.CommonApiBase.prototype.routePacket=function(packetContext) {
	if(packetContext.leaderState !== 'leader')	{
		// if not leader, just drop it.
		return;
	}	
	
	var node=this.findOrMakeValue(packetContext.packet);
	
	this.isPermitted(node,packetContext)
		.success(this.invokeHandler,this)
		.failure(function() {
			packetContext.reply({'action':'noPerm'});				
		});
};

/**
 * Invoke the proper handler for the packet after determining that
 * they handler has permission to perform this action.
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 * @returns {undefined}
 */
ozpIwc.CommonApiBase.prototype.invokeHandler=function(node,packetContext) {
	var packet=packetContext.packet;

	try {
		// check resourceValidity
		this.validateResource(node,packetContext);

		// check preconditions
		this.checkPreconditions(node,packetContext);
	} catch(e) {
		// @todo create error type that contains the action and entity
		packetContext.reply({'action': 'failed', 'entity': e});
	}
	
	var handler;
	if(packet.action) {
		handler="handle" + packet.action.charAt(0).toUpperCase() + packet.action.slice(1).toLowerCase();
	}
	if(!handler || typeof(this[handler]) !== 'function') {
		packetContext.reply({
			'action': 'badAction',
			'entity': packet.action
		});
	}
	
	var oldValue=node.toPacket();
	handler.call(this.target,node,packetContext);
	var newValue=node.toPacket();

	// if the version changed, send an update to all watchers
	if(oldValue.version !== newValue.version )	{
		this.notifyWatchers({
			'node': node,
			'oldValue': oldValue,
			'newValue': newValue
		});
	}	
};


/**
 * @param {ozpIwc.CommonApiValue} node
 */
ozpIwc.CommonApiBase.prototype.handleGet=function(node) {
	return [node.toPacket({'action': 'ok'})];
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleSet=function(node,packetContext) {
	var responses=this.triggerChange(node.set(packetContext.packet));
	
	responses.unshift({'action': 'ok'});
	return responses;
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleDelete=function(node) {
	var responses=this.triggerChange(node.deleteData());
	
	responses.unshift({'action': 'ok'});
	return responses;
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleWatch=function(node,packetContext) {
	node.watch(packetContext.packet);
	
	// @TODO: Return the entity if the watcher is permitted
	var response={'action': 'ok'};
	return [response];
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleUnwatch=function(node,packetContext) {
	node.unwatch(packetContext.packet);
		
	return [{'action': 'ok'}];
};
