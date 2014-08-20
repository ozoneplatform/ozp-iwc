/**
 * The Common API Base implements the API Common Conventions.  It is intended to be subclassed by
 * the specific API implementations.
 * @class
 */
ozpIwc.CommonApiBase = function(config) {
	config = config || {};
	this.participant=config.participant;
    this.participant.on("unloadState",ozpIwc.CommonApiBase.prototype.unloadState,this);
    this.participant.on("acquireState",ozpIwc.CommonApiBase.prototype.setState,this);
	this.participant.on("receiveApiPacket",ozpIwc.CommonApiBase.prototype.routePacket,this);

	this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    
    
    this.collectionNodes=[];
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
ozpIwc.CommonApiBase.prototype.makeValue=function(/*packet*/) {
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
	var subject=packetContext.srcSubject || {
        'rawAddress':packetContext.packet.src
    };

	return ozpIwc.authorization.isPermitted({
        'subject': subject,
        'object': node.permissions,
        'action': {'action':packetContext.action}
    });
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
            'src'   : this.participant.name,
		    'replyTo' : watcher.msgId,
			'response': 'changed',
			'resource': node.resource,
			'permissions': node.permissions,
			'entity': changes
		};
        
		this.participant.send(reply);
	},this);
};

/**
 * For a given packet, return the value if it already exists, otherwise create the value
 * using makeValue()
 * @protected
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.CommonApiBase.prototype.findOrMakeValue=function(packet) {
    if(packet.resource === null || packet.resource === undefined) {
        // return a throw-away value
        return new ozpIwc.CommonApiValue();
    }
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
* Route a packet to the appropriate handler.  The routing path is based upon
 * the action and whether a resource is defined. If the handler does not exist, it is routed 
 * to defaultHandler(node,packetContext)
 * 
 * Has Resource: handleAction(node,packetContext)
 *
 * No resource: rootHandleAction(node,packetContext)
 * 
 * Where "Action" is replaced with the packet's action, lowercase with first letter capitalized
 * (e.g. "doSomething" invokes "handleDosomething")
 * Note that node will usually be null for the rootHandlerAction calls.
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
    
    if(packet.response && !packet.action) {
        console.log(this.participant.name + " dropping response packet ",packet);
        // if it's a response packet that didn't wire an explicit handler, drop the sucker
        return;
    }
    
	var handler;
    this.events.trigger("receive",packetContext);

    if(packet.resource===null || packet.resource===undefined) {
        handler="rootHandle";
    } else {
        handler="handle";
    }
    
	if(packet.action) {
		handler+=packet.action.charAt(0).toUpperCase() + packet.action.slice(1).toLowerCase();
	} else {
        handler="defaultHandler";
    }
    
	if(!handler || typeof(this[handler]) !== 'function') {
       handler="defaultHandler";
	}
    var node;
    try {
        node=this.findOrMakeValue(packetContext.packet);
    } catch(e) {
        if(e.errorAction) {
            packetContext.replyTo({
                'response': e.errorAction,
                'entity': e.message
            });
            return;
        } else {
            throw e;
        }
    }
    if(packetContext.packet.resource && !this.validateResource(node,packetContext)) {
        packetContext.replyTo({'response': 'badResource'});
        return;
    }
	this.invokeHandler(node,packetContext,this[handler]);
	
};

ozpIwc.CommonApiBase.prototype.defaultHandler=function(node,packetContext) {
    console.log(this.participant.name + "/" + this.participant.address + " Received unexpected packet", packetContext);
    packetContext.replyTo({
        'response': 'badAction',
        'entity': packetContext.packet.action
    });
};


ozpIwc.CommonApiBase.prototype.validateResource=function(/* node,packetContext */) {
	return true;
};

ozpIwc.CommonApiBase.prototype.validatePreconditions=function(node,packetContext) {
	return !packetContext.packet.ifTag || packetContext.packet.ifTag===node.version;
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
	var async =this.isPermitted(node,packetContext);
		async.failure(function() {
			packetContext.replyTo({'response':'noPerm'});				
		})
		.success(function() {
			if(!this.validatePreconditions(node,packetContext)) {
				packetContext.replyTo({'response': 'noMatch'});
				return;
			}

			var snapshot=node.snapshot();
            try {
                handler.call(this,node,packetContext);
            } catch(e) {
                if(e.errorAction) {
                    packetContext.replyTo({
                        'response': e.errorAction,
                        'entity': e.message
                    });
                } else {
                    throw e;
                }
            }
			var changes=node.changesSince(snapshot);
			
			if(changes)	{
				this.notifyWatchers(node,changes);
            }
            // update all the collection values
            this.collectionNodes.forEach(function(resource) {
                var node=this.data[resource];
                var snapshot=node.snapshot();
                node.updateContent(this);
                var changes=node.changesSince(snapshot);
                if(changes) {
                    this.notifyWatchers(node,changes);
                }
            },this);
            
            
		},this);	
};

ozpIwc.CommonApiBase.prototype.addCollectionNode=function(resource,node) {
    this.data[resource]=node;
    node.resource=resource;
    this.collectionNodes.push(resource);
    node.updateContent(this);
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleGet=function(node,packetContext) {
	packetContext.replyTo(node.toPacket({'response': 'ok'}));
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleSet=function(node,packetContext) {
	node.set(packetContext.packet);
	packetContext.replyTo({'response':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleDelete=function(node,packetContext) {
	node.deleteData();
	packetContext.replyTo({'response':'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleWatch=function(node,packetContext) {
	node.watch(packetContext.packet);
	
	// @TODO: Reply with the entity? Immediately send a change notice to the new watcher?  
	packetContext.replyTo({'response': 'ok'});
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleUnwatch=function(node,packetContext) {
	node.unwatch(packetContext.packet);
	
	packetContext.replyTo({'response':'ok'});
};

/**
 * Called when the leader participant fires its beforeUnload state. Releases the Api's data property
 * to be consumed by all, then used by the new leader.
 */
ozpIwc.CommonApiBase.prototype.unloadState = function(){
    this.participant.startElection({state:this.data});
    this.data = {};
};

/**
 * Called when the leader participant looses its leadership. This occurs when a new participant joins with a higher
 * priority
 */
ozpIwc.CommonApiBase.prototype.transferState = function(){
    this.participant.sendElectionMessage("prevLeader", {
        state:this.data,
        prevLeader: this.participant.address
    });
    this.data = {};
};

/**
 * Sets the APIs data property. Removes current values, then constructs each API value anew.
 * @param state
 */
ozpIwc.CommonApiBase.prototype.setState = function(state) {
    this.data = {};
    for (var key in state) {
        this.findOrMakeValue(state[key]);
    }
};

 /** @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.rootHandleList=function(node,packetContext) {
    packetContext.replyTo({
        'response':'ok',
        'entity': Object.keys(this.data)
    });
};

