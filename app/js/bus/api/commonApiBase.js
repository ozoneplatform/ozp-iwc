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
 * @param {object} evt.node - The node being changed.
 */
ozpIwc.CommonApiBase.prototype.notifyWatchers=function(node,changes) {
	node.eachWatcher(function(watcher) {
		// @TODO check that the recipient has permission to both the new and old values
		var reply={
			'dst'   : watcher.src,
		  'replyTo' : watcher.msgId,
			'action': 'changed',
			'resource': node.resource,
			'permissions': changes.permissions,
			'entity': changes.entity
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
 * 
 * Determines if the given resource exists.
 * @param {string} resource
 * @returns {boolean}
 */
ozpIwc.CommonApiBase.prototype.hasKey=function(resource) {
	return resource in this.data;
};

/**
 * Generates a keyname that does not already exist and starts
 * with a given prefix.
 * @param {String} prefix
 * @returns {String}
 */
ozpIwc.CommonApiBase.prototype.createKey=function(prefix) {
	prefix=prefix || "";
	var key;
	do {
		key=prefix + ozpIwc.util.generateId();
	} while(this.hasKey(key));
	return key;
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
	var packet=packetContext.packet;

	if(packetContext.leaderState !== 'leader')	{
		// if not leader, just drop it.
		return;
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
	var node=this.findOrMakeValue(packetContext.packet);
	this.invokeHandler(node,packetContext,handler);
	
};
ozpIwc.CommonApiBase.prototype.validateResource=function(node,packetContext) {
	return packetContext.packet.resource;
};

ozpIwc.CommonApiBase.prototype.validatePreconditions=function(node,packetContext) {
	return packetContext.packet.ifTag && packetContext.packet.ifTag===node.version;
};

/**
 * Invoke the proper handler for the packet after determining that
 * they handler has permission to perform this action.
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 * @param {function} handler
 * @returns {undefined}
 */
ozpIwc.CommonApiBase.prototype.invokeHandler=function(node,packetContext,handler) {
	this.isPermitted(node,packetContext)
		.failure(function() {
			packetContext.reply({'action':'noPerm'});				
		})
		.success(function() {
			if(!this.validateResource(node,packetContext)) {
				packetContext.reply({'action': 'badResource'});
				return;
			}
			if(!this.validatePreconditions(node,packetContext)) {
				packetContext.reply({'action': 'noMatch'});
				return;
			}

			var snapshot=node.snapshot();
			handler.call(this,node,packetContext);
			var changes=node.changesSince(snapshot);
			
			if(changes)	{
				this.notifyWatchers(node,changes);
			}	
		},this);	
};


/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleGet=function(node,packetContext) {
	packetContext.reply(node.toPacket({'action': 'ok'}));
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleSet=function(node,packetContext) {
	node.set(packetContext.packet);
	packetContext.reply({'action':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleDelete=function(node,packetContext) {
	node.deleteData();
	packetContext.reply({'action':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleWatch=function(node,packetContext) {
	node.watch(packetContext.packet);
	
	// @TODO: Reply with the entity? Immediately send a change notice to the new watcher?  
	packetContext.reply({'action': 'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleUnwatch=function(node,packetContext) {
	node.unwatch(packetContext.packet);
	
	packetContext.reply({'action':'ok'});
};
