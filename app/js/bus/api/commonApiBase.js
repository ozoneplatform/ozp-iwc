/**
 * The API classes that can be used on the IWC bus. All of which subclass {{#crossLink "CommonApiBase"}}{{/crossLink}}
 * @module api
 * @submodule api.Type
 */

/**
 * The Common API Base implements the API Common Conventions.  It is intended to be subclassed by
 * the specific API implementations.
 *
 * @class CommonApiBase
 * @constructor
 * @param {object} config
 * @params {Participant} config.participant  the participant used for the Api communication
 */
 ozpIwc.CommonApiBase = function(config) {
	config = config || {};

   /**
    * The participant used for the Api communication on the bus.
    * @property participant
    * @type Participant
    * @default {}
    */
	this.participant=config.participant;
    this.participant.on("unloadState",ozpIwc.CommonApiBase.prototype.unloadState,this);
    this.participant.on("acquireState",ozpIwc.CommonApiBase.prototype.setState,this);
	this.participant.on("receiveApiPacket",ozpIwc.CommonApiBase.prototype.routePacket,this);

   /**
    * An events module for the API.
    * @property events
    * @type Event
    */
	this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);

   /**
    * @TODO (DOC)
    * @property dynamicNodes
    * @type Array
    * @default []
    */
    this.dynamicNodes=[];

    /**
     * Key value storage for the API. each element of the object is a node of the API.
     * @property data
     * @type Object
     * @default {}
     */
     this.data={};
};

/**
 * Finds or creates the corresponding node to store a server loaded resource.
 *
 * @method findNodeForServerResource
 * @param {ozpIwc.TransportPacket} serverObject The object to be stored.
 * @param {String} objectPath The full path resource of the object including it's root path.
 * @param {String} rootPath The root path resource of the object.
 *
 * @returns {#makeValue} The node that is now holding the data provided in the serverObject parameter.
 */
ozpIwc.CommonApiBase.prototype.findNodeForServerResource=function(serverObject,objectPath,rootPath) {
    var resource=objectPath.replace(rootPath,'');
    return this.findOrMakeValue({
        'resource': resource,
        'entity': serverObject.entity,
        'contentType': serverObject.contentType
    });
};

/**
 * Loads api data from the server.
 *
 * @method loadFromServer
 * @param {String} endpointName The name of the endpoint to load from the server.
 */
ozpIwc.CommonApiBase.prototype.loadFromServer=function(endpointName) {
    // fetch the base endpoint. it should be a HAL Json object that all of the 
    // resources and keys in it
    var endpoint=ozpIwc.endpoint(endpointName);
    var self=this;
    endpoint.get("/")
        .then(function(data) {
            self.loadLinkedObjectsFromServer(endpoint,data);

            // update all the collection values
            self.dynamicNodes.forEach(function(resource) {
                self.updateDynamicNode(self.data[resource]);
            });        
    }).catch(function(e) {
        //console.error("Could not load from api (" + endpointName + "): " + e.message,e);
    });
};

/**
 * Updates an Api node with server loaded HAL data.
 *
 * @method updateResourceFromServer
 * @param {ozpIwc.TransportPacket} object The object retrieved from the server to store.
 * @param {String} path The path of the resource retrieved.
 * @param {ozpIwc.Endpoint} endpoint the endpoint of the HAL data.
 */
ozpIwc.CommonApiBase.prototype.updateResourceFromServer=function(object,path,endpoint) {
    var node = this.findNodeForServerResource(object,path,endpoint.baseUrl);

    var snapshot=node.snapshot();
    node.deserialize(node,object);

    this.notifyWatchers(node,node.changesSince(snapshot));
    this.loadLinkedObjectsFromServer(endpoint,object);
};

/**
 * Traverses through HAL data from the server and updates api resources based on the data it finds.
 *
 * @method loadLinkedObjectsFromServer
 * @param {ozpIwc.Endpoint} endpoint the endpoint of the HAL data.
 * @param data the HAL data.
 */
ozpIwc.CommonApiBase.prototype.loadLinkedObjectsFromServer=function(endpoint,data) {
    // fetch the base endpoint. it should be a HAL Json object that all of the 
    // resources and keys in it
    if(!data) {
        return;
    }
    
    var self=this;
    if(data._embedded && data._embedded['item']) {
        for (var i in data._embedded['item']) {
            var object = data._embedded['item'][i];
            this.updateResourceFromServer(object,object._links.self.href,endpoint);
        }
    }
    if(data._links && data._links['item']) {
        data._links['item'].forEach(function(object) {
            var href=object.href;
            endpoint.get(href).then(function(objectResource){
                self.updateResourceFromServer(objectResource,href,endpoint);
            }).catch(function(error) {
                console.error("unable to load " + object.href + " because: ",error);
            });
        });
    }
};

    
/**
 * Creates a new value for the given packet's request.  Subclasses must override this
 * function to return the proper value based upon the packet's resource, content type, or
 * other parameters.
 *
 * @method makeValue
 * @abstract
 * @param {ozpIwc.TransportPacket} packet
 *
 * @returns {CommonApiValue} an object implementing the commonApiValue interfaces
 */
ozpIwc.CommonApiBase.prototype.makeValue=function(/*packet*/) {
	throw new Error("Subclasses of CommonApiBase must implement the makeValue(packet) function.");
};

/**
 * Determines whether the action implied by the packet is permitted to occur on
 * node in question.
 *
 * @todo the refactoring of security to allow action-level permissions
 * @todo make the packetContext have the srcSubject inside of it
 *
 * @method isPermitted
 * @param {ozpIwc.CommonApiValue} node The node of the api that permission is being checked against
 * @param {ozpIwc.TransportPacketContext} packetContext The packet of which permission is in question.
 *
 * @returns {ozpIwc.AsyncAction} An asynchronous response, the response will call either success or failure depending on
 * the result of the check.
 *
 * @example
 * ```
 * foo.isPermitted(node,packetContext)
 *      .success(function(){
 *          ...
 *      }).failure(function(){
 *          ...
 *      });
 * ```
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
 *
 * @method notifyWatchers
 * @param {CommonApiValue} node The node being changed.
 * @param {object} changes The changes to the node.
 */
ozpIwc.CommonApiBase.prototype.notifyWatchers=function(node,changes) {
    if(!changes) {
        return;
    }
    this.events.trigger("changedNode",node,changes);
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
 *
 * @method findOrMakeValue
 * @protected
 * @param {ozpIwc.TransportPacket} packet The data that will be used to either find or create the api node.
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
 *
 * @method hasKey
 * @param {string} resource The path of the resource in question.
 * @returns {boolean} Returns true if there is a node with a corresponding resource in the api.
 */
ozpIwc.CommonApiBase.prototype.hasKey=function(resource) {
	return resource in this.data;
};

/**
 * Generates a keyname that does not already exist and starts
 * with a given prefix.
 *
 * @method createKey
 * @param {String} prefix The prefix resource string.
 * @returns {String} The prefix resource string with an appended generated Id that is not already in use.
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
 *
 * @method routePacket
 * @param {ozpIwc.TransportPacketContext} packetContext The packet to route.
 *
 */
ozpIwc.CommonApiBase.prototype.routePacket=function(packetContext) {
	var packet=packetContext.packet;
    this.events.trigger("receive",packetContext);
    var self=this;
    var errorWrap=function(f) {
        try {
            f.apply(self);
        } catch(e) {
            if(!e.errorAction) {
                console.log("Unexpected error:",e);
            }
            packetContext.replyTo({
                'response': e.errorAction || "unknownError",
                'entity': e.message
            });
            return;
        }
    };
	if(packetContext.leaderState !== 'leader')	{
		// if not leader, just drop it.
		return;
	}
    
    if(packet.response && !packet.action) {
        console.log(this.participant.name + " dropping response packet ",packet);
        // if it's a response packet that didn't wire an explicit handler, drop the sucker
        return;
    }
    var node;
    
    errorWrap(function() {
        var handler=this.findHandler(packetContext);
        this.validateResource(node,packetContext);
        node=this.findOrMakeValue(packetContext.packet);

        this.isPermitted(node,packetContext)
            .success(function() {
                errorWrap(function() {
                    this.validatePreconditions(node,packetContext);
                    var snapshot=node.snapshot();
                    handler.call(this,node,packetContext);
                    this.notifyWatchers(node,node.changesSince(snapshot));

                    // update all the collection values
                    this.dynamicNodes.forEach(function(resource) {
                        this.updateDynamicNode(this.data[resource]);
                    },this);
                });
            },this)
            .failure(function() {
                packetContext.replyTo({'response':'noPerm'});				
            });
    });
};

/**
 * Determines which handler in the api is needed to process the given packet.
 *
 * @method findHandler
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context to find a proper handler for.
 *
 * @returns {Function} The handler for the given packet context.
 */
ozpIwc.CommonApiBase.prototype.findHandler=function(packetContext) {
    var action=packetContext.packet.action;
    var resource=packetContext.packet.resource;
    
    var handler;

    if(resource===null || resource===undefined) {
        handler="rootHandle";
    } else {
        handler="handle";
    }
    
	if(action) {
		handler+=action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
	} else {
        handler="defaultHandler";
    }
    
	if(!handler || typeof(this[handler]) !== 'function') {
       handler="defaultHandler";
	}
    return this[handler];
};


/**
 * Checks that the given packet context's resource meets the requirements of the api. Subclasses should override this
 * method as it performs no check by default.
 *
 * @method validateResource
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the resource to be validated.
 *
 * @returns {boolean} always returns true.
 */
ozpIwc.CommonApiBase.prototype.validateResource=function(/* node,packetContext */) {
	return true;
};

/**
 * Checks the given packet context's `ifTag` against the desired api node's `version`. Throws ApiError if ifTag exists
 * and doesn't match.
 *
 * @method validatePreconditions
 * @param node The api node being checked against.
 * @param packetContext The packet context to validate.
 *
 */
ozpIwc.CommonApiBase.prototype.validatePreconditions=function(node,packetContext) {
	if(packetContext.packet.ifTag && packetContext.packet.ifTag!==node.version) {
        throw new ozpIwc.ApiError('noMatch',"Latest version is " + node.version);
    }
};

/**
 * Checks that the given packet context's contextType meets the requirements of the api. Subclasses should override this
 * method as it performs no check by default.
 *
 * @method validateContextType
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the contextType to be validated.
 *
 * @returns {boolean} - always returns true.
 */
ozpIwc.CommonApiBase.prototype.validateContentType=function(node,packetContext) {
    return true;
};

/**
 * @TODO (DOC)
 * @method updateDynamicNode
 * @param node @TODO (DOC)
 */
ozpIwc.CommonApiBase.prototype.updateDynamicNode=function(node) {
    if(!node) {
        return;
    }
    var ofInterest=[];

    for(var k in this.data) {
        if(node.isUpdateNeeded(this.data[k])){
            ofInterest.push(this.data[k]);
        }                        
    }

    if(ofInterest) {
        var snapshot=node.snapshot();
        node.updateContent(ofInterest);
        this.notifyWatchers(node,node.changesSince(snapshot));
    }
};

/**
 * @TODO (DOC)
 * @method addDynamicNode
 * @param node @TODO (DOC)
 */
ozpIwc.CommonApiBase.prototype.addDynamicNode=function(node) {
    this.data[node.resource]=node;
    this.dynamicNodes.push(node.resource);
    this.updateDynamicNode(node);
};

/**
 * The default handler for the api when receiving packets. This handler is called when no handler was found for the
 * given packet context's action.
 *
 *
 * @method defaultHandler
 * @param {CommonApiValue}node @TODO is a node needed? or is this intended for subclass purposes
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context being handled.
 */
ozpIwc.CommonApiBase.prototype.defaultHandler=function(node,packetContext) {
    packetContext.replyTo({
        'response': 'badAction',
        'entity': {
            'action': packetContext.packet.action,
            'originalRequest' : packetContext.packet
        }
    });
};

/**
 * Common handler for packet contexts with `get` actions.
 *
 * @method handleGet
 * @param {ozpIwc.CommonApiValue} node The api node to retrieve.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the get action.
 */
ozpIwc.CommonApiBase.prototype.handleGet=function(node,packetContext) {
	packetContext.replyTo(node.toPacket({'response': 'ok'}));
};

/**
 * Common handler for packet contexts with `set` actions.
 *
 * @method handleSet
 * @param {ozpIwc.CommonApiValue} node The api node to store the packet contexts' data in.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the set action.
 */
ozpIwc.CommonApiBase.prototype.handleSet=function(node,packetContext) {
	node.set(packetContext.packet);
	packetContext.replyTo({'response':'ok'});
};

/**
 * Common handler for packet contexts with `delete` actions.
 *
 * @TODO (DOC)
 * @method handleDelete
 * @param {ozpIwc.CommonApiValue} node @TODO (DOC)
 * @param {ozpIwc.TransportPacketContext} packetContext @TODO (DOC)
 */
ozpIwc.CommonApiBase.prototype.handleDelete=function(node,packetContext) {
	node.deleteData();
	packetContext.replyTo({'response':'ok'});
};

/**
 * Common handler for packet contexts with `watch` actions.
 *
 * @method handleWatch
 * @param {ozpIwc.CommonApiValue} node The api node to register a watch on.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the watch action.
 */
ozpIwc.CommonApiBase.prototype.handleWatch=function(node,packetContext) {
	node.watch(packetContext.packet);
	
	// @TODO: Reply with the entity? Immediately send a change notice to the new watcher?  
	packetContext.replyTo({'response': 'ok'});
};

/**
 * Common handler for packet contexts with `unwatch` actions.
 *
 * @method handleUnwatch
 * @param {ozpIwc.CommonApiValue} node The api node to remove a watch registration from.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the unwatch action.
 */
ozpIwc.CommonApiBase.prototype.handleUnwatch=function(node,packetContext) {
	node.unwatch(packetContext.packet);
	
	packetContext.replyTo({'response':'ok'});
};

/**
 * Called when the leader participant fires its beforeUnload state. Releases the Api's data property
 * to be consumed by all, then used by the new leader.
 *
 * @method unloadState
 */
ozpIwc.CommonApiBase.prototype.unloadState = function(){
    this.participant.startElection({state:this.data});
    this.data = {};
};

/**
 * Called when the leader participant looses its leadership. This occurs when a new participant joins with a higher
 * priority
 *
 * @method transferState
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
 *
 * @method setState
 * @param {Object} state The object containing key value pairs to set as this api's state.
 */
ozpIwc.CommonApiBase.prototype.setState = function(state) {
    this.data = {};
    for (var key in state) {
        this.findOrMakeValue(state[key]);
    }
};

/**
 * Common handler for packet contexts with a `list` action but no resource.
 *
 * @method rootHandleList
 * @param {CommonApiValue}node @TODO is a node needed? or is this intended for subclass purposes
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context of the received request.
 */
ozpIwc.CommonApiBase.prototype.rootHandleList=function(node,packetContext) {
    packetContext.replyTo({
        'response':'ok',
        'entity': Object.keys(this.data)
    });
};

