/**
 * @submodule bus.service.Type
 */

/**
 * The Intents Api.
 * Subclasses the {{#crossLink "ozpIwc.ApiBase"}}{{/crossLink}}.
 *
 * @class IntentsApi
 * @namespace ozpIwc
 * @extends ozpIwc.ApiBase
 * @constructor
 */
ozpIwc.IntentsApi = ozpIwc.createApi(function(config) {
    /**
     * @property persistenceQueue
     * @type {ozpIwc.AjaxPersistenceQueue|*}
     */
    this.persistenceQueue = config.persistenceQueue || new ozpIwc.AjaxPersistenceQueue();

    /**
     * @property endpoints
     * @type {Object[]}
     */
    this.endpoints=[
        {
            link: ozpIwc.linkRelPrefix+":intent",
            headers: []
        }
    ];
});

ozpIwc.IntentsApi.prototype.initializeData=function(deathScream) {
    deathScream=deathScream || { watchers: {}, collectors: [], data: []};
    this.watchers=deathScream.watchers;
    this.collectors = deathScream.collectors;
    deathScream.data.forEach(function(packet) {
        if(packet.resource.indexOf("/inFlightIntent") === 0){
            packet.entity = packet.entity || {};
            packet.entity.dState = packet.entity.state;
            packet.entity.state = "deserialize";
            this.createNode({
                resource: packet.resource, invokePacket: {},
                handlerChoices:[0,1],
                state: "deserialize"
            },ozpIwc.IntentsInFlightNode).deserializeLive(packet);
        }else {
            this.createNode({resource: packet.resource}).deserializeLive(packet);
        }
    },this);

    this.updateCollections();
    if(this.endpoints) {
        var self=this;
        return Promise.all(this.endpoints.map(function(u) {
            var e=ozpIwc.endpoint(u.link) ;
            return self.loadFromEndpoint(e,u.headers).catch(function(e) {
                ozpIwc.log.error(self.logPrefix,"load from endpoint ",e," failed: ",e);
            });
        }));
    } else {
        return Promise.resolve();
    }
};

// turn on bulkGet and list for everything
ozpIwc.IntentsApi.useDefaultRoute(["bulkGet", "list"]);

//====================================================================
// Intent Invocation Endpoints
//====================================================================

ozpIwc.IntentsApi.useDefaultRoute([ "watch", "unwatch", "delete"], "/inFlightIntent/{id}");

/**
 * A handler for invoke calls. Creates an inFlight-intent node and kicks off the inflight state machine.
 *
 * @method invokeIntentHandler
 * @param {Object} packet
 * @param {String} type
 * @param {String} action
 * @param {Object[]} handlers
 * @param {String} pattern
 * @returns {Promise}
 */
ozpIwc.IntentsApi.prototype.invokeIntentHandler=function(packet,type,action,handlers,pattern) {
    var self = this;
    var inflightNode = new ozpIwc.IntentsInFlightNode({
        resource: this.createKey("/inFlightIntent/"),
        src:packet.src,
        invokePacket: packet,
        type: type,
        action: action,
        handlerChoices: handlers,
        pattern: pattern
    });
    
    this.data[inflightNode.resource] = inflightNode;
    this.addCollector(inflightNode.resource);

    this.data[inflightNode.resource] = ozpIwc.InFlightIntentFSM.transition(inflightNode);
    return this.handleInflightIntentState(inflightNode).then(function() {
        return {
            entity: {
                inFlightIntent: self.data[inflightNode.resource].toPacket()
            }
        };
    });
};

/**
 * Handles the current state of the state machine.
 * If "choosing", the intent chooser will open.
 * If "delivering", the api will send the intent to the chosen handler
 * If "complete", the api will send the intent handler's reply back to the invoker and mark the inflight intent as deleted.
 * @param {Object} inflightNode
 * @returns {*}
 */
ozpIwc.IntentsApi.prototype.handleInflightIntentState=function(inflightNode) {
    switch(inflightNode.entity.state){
        case "choosing":
            return this.handleChoosing(inflightNode);
        case "delivering":
            this.handleDelivering(inflightNode);
            break;
        case "complete":
            this.handleComplete(inflightNode);
            break;
        default:
            break;
    }
    return Promise.resolve();
};

/**
 * A handler for the "choosing" state of an in-flight intent node.
 * @method handleChoosing
 * @param node
 * @returns {Promise} Resolves when either a preference is gathered or the intent chooser is opened.
 */
ozpIwc.IntentsApi.prototype.handleChoosing = function(node){
    var showChooser=function(err) {
        console.log("Picking chooser because",err);
        ozpIwc.util.openWindow(ozpIwc.intentsChooserUri, {
            "ozpIwc.peer": ozpIwc.BUS_ROOT,
            "ozpIwc.intentSelection": "intents.api" + node.resource
        },ozpIwc.INTENT_CHOOSER_FEATURES);
    };
    var self = this;
    return this.getPreference(node.entity.intent.type+"/"+node.entity.intent.action).then(function(handlerResource) {
        if(handlerResource in self.data) {
            node = ozpIwc.InFlightIntentFSM.transition(node,{
                entity: {
                    state: "delivering",
                    'handler': {
                        'resource': handlerResource,
                        'reason': "remembered"
                    }
                }
            });
            self.handleInflightIntentState(node);
        } else {
            showChooser();
        }
    }).catch(showChooser);
};

/**
 *  A handler for the "delivering" state of an in-flight intent node.
 *  Sends a packet to the chosen handler.
 *
 *  @TODO should resolve on response from the handler that transitions the node to "running".
 *
 * @method handleDelivering
 * @param {ozpIwc.ApiNode} node
 */
ozpIwc.IntentsApi.prototype.handleDelivering = function(node){
    var handlerNode=this.data[node.entity.handler.resource];

    var packet = ozpIwc.util.clone(handlerNode.entity.invokeIntent);
    packet.entity = packet.entity || {};
    packet.replyTo = handlerNode.entity.replyTo;
    packet.entity.inFlightIntent = node.toPacket();
    console.log(this.logPrefix+"delivering intent:",packet);
    // TODO: packet permissions
    return this.send(packet);
};

/**
 * A handler for the "complete" state of an in-flight intent node.
 * Sends notification to the invoker that the intent was handled & deletes the in-flight intent node as it is no longer
 * needed.
 *
 * @method handleComplete
 * @param {ozpIwc.ApiNode} node
 */
ozpIwc.IntentsApi.prototype.handleComplete = function(node){
    if(node.entity.invokePacket && node.entity.invokePacket.src && node.entity.reply) {
        this.send({
            dst: node.entity.invokePacket.src,
            replyTo: node.entity.invokePacket.msgId,
            contentType: node.entity.reply.contentType,
            response: "complete",
            entity: node.entity.reply.entity
        });
    }
    node.markAsDeleted();
};

ozpIwc.IntentsApi.declareRoute({
    action: "set",
    resource: "/inFlightIntent/{id}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.IntentsInFlightNode)
}, function(packet, context, pathParams) {
    context.node = ozpIwc.InFlightIntentFSM.transition(context.node,packet);
    return this.handleInflightIntentState(context.node).then(function() {
        return {response: "ok"};
    });
});

//====================================================================
// Handler endpoints
//====================================================================
ozpIwc.IntentsApi.useDefaultRoute(["get","delete", "watch", "unwatch"], "/{major}/{minor}/{action}/{handlerId}");

/**
 * A route for intent handler invocations.
 * Invokes a specific handler directly
 */
ozpIwc.IntentsApi.declareRoute({
    action: "invoke",
    resource: "/{major}/{minor}/{action}/{handlerId}",
    filters: []
}, function(packet, context, pathParams) {
    return this.invokeIntentHandler(
        packet, 
        pathParams.major+"/"+pathParams.minor,
        pathParams.action,
        [context.node]
    );
});
ozpIwc.IntentsApi.declareRoute({
    action: "set",
    resource: "/{major}/{minor}/{action}/{handlerId}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.IntentHandlerNode, "application/vnd.ozp-iwc-intent-handler-v1+json")
}, function(packet, context, pathParams) {
    context.node.set(packet);
    return {"response": "ok"};
});

//====================================================================
// Action endpoints
//====================================================================
/**
 * A route filter for creating an intent definition (/{major}/{minor}/{action}) if it does not exist.
 * @method registerDefinitionFilter
 * @param {String} nodeType
 * @param {String} contentType
 * @returns {*}
 */
ozpIwc.IntentsApi.registerDefinitionFilter = function(nodeType,contentType){
    var setDefinition = function(packet,context,pathParams,next){
        // Only set to the definition if not already set.
        if(!context.node.entity){
            context.node.set({
                entity: {
                    "type": pathParams.major + "/" + pathParams.minor,
                    "action": pathParams.action
                }
            });
        }

        this.addCollector(context.node.resource);

        return next();
    };

    var filters = ozpIwc.standardApiFilters.setFilters(nodeType,contentType);
    filters.unshift(ozpIwc.apiFilter.fixPattern());
    filters.push(setDefinition);

    return filters;
};

/**
 * A route filter for creating an intent definition node (/{major}/{minor}/{action}) if it does not exist, then creates
 * an intent handler node with the specified handlerId ({major}/{minor}/{action}/{handlerId})
 * @method registerHandlerFilter
 * @param {String} nodeType
 * @param {String} contentType
 * @returns {*}
 */
ozpIwc.IntentsApi.registerHandlerFilter = function(nodeType,contentType){
    var generateDefinitionResource = function(packet,context,pathParams,next){
        packet.resource = "/"+pathParams.major + "/" + pathParams.minor + "/" + pathParams.action;
        context.node = this.data[packet.resource];
        return next();
    };

    var generateHandlerResource = function(packet,context,pathParams,next){
        packet.resource = "/"+pathParams.major + "/" + pathParams.minor + "/" + pathParams.action + "/" +
            pathParams.handlerId;
        context.node = this.data[packet.resource];
        return next();
    };

    var definitionFilter = ozpIwc.IntentsApi.registerDefinitionFilter(null, "application/vnd.ozp-iwc-intent-handler-v1+json");
    definitionFilter.unshift(generateDefinitionResource);

    var handlerFilter = ozpIwc.standardApiFilters.setFilters(nodeType,contentType);
    handlerFilter.unshift(generateHandlerResource);

    // Concat the two filters together, run through the definition then the handler.
    definitionFilter.push.apply(definitionFilter,handlerFilter);

    return definitionFilter;
};

/**
 * Registration handler when a handlerId is not specified
 */
ozpIwc.IntentsApi.declareRoute({
    action: "register",
    resource: "/{major}/{minor}/{action}",
    filters: ozpIwc.IntentsApi.registerDefinitionFilter(null, "application/vnd.ozp-iwc-intent-handler-v1+json")
}, function(packet, context, pathParams) {

    var childNode = this.createNode({
        'resource': this.createKey(context.node.resource + "/"),
        'src': packet.src
    }, ozpIwc.IntentHandlerNode);
    childNode.set(packet);

    ozpIwc.log.debug(this.logPrefix+" registered ",context.node);
    return {
        'response': 'ok',
        'entity': {
            'resource': childNode.resource
        }
    };
});

/**
 * Registration handler when a handlerId is specified
 */
ozpIwc.IntentsApi.declareRoute({
    action: "register",
    resource: "/{major}/{minor}/{action}/{handlerId}",
    filters: ozpIwc.IntentsApi.registerHandlerFilter(null, "application/vnd.ozp-iwc-intent-handler-v1+json")
}, function(packet, context, pathParams) {
    context.node.set(packet);

    ozpIwc.log.debug(this.logPrefix+" registered ",context.node);
    return {
        'response': 'ok',
        'entity': {
            'resource': context.node.resource
        }
    };
});

/**
 * A route for intent action invocations.
 * Will launch direct for user input if multiple options.
 */
ozpIwc.IntentsApi.declareRoute({
    action: "invoke",
    resource: "/{major}/{minor}/{action}",
    filters: ozpIwc.standardApiFilters.getFilters()
}, function(packet, context, pathParams) {
    return this.invokeIntentHandler(
        packet, 
        pathParams.major+"/"+pathParams.minor,
        pathParams.action,
        this.matchingNodes(context.node.pattern),
        context.node.pattern
    );
});

/**
 * A route for the following actions not handled by other routes: bulkGet, list, delete, watch, and unwatch.
 * Default route used.
 */
ozpIwc.IntentsApi.useDefaultRoute(["delete", "watch", "unwatch", "get"],"/{major}/{minor}/{action}");

//====================================================================
// Content Type endpoints
//====================================================================
ozpIwc.IntentsApi.declareRoute({
    action: ["set", "delete"],
    resource: "/{major}/{minor}",
    filters: []
}, function(packet, context, pathParams) {
    throw new ozpIwc.NoPermissionError(packet);
});

ozpIwc.IntentsApi.declareRoute({
    action: "get",
    resource: "/{major}/{minor}",
    filters: []
}, function(packet, context, pathParams) {
    if (context.node) {
        // the following needs to be included, possibly via override of toPacket();
        //'invokeIntent': childNode
        return context.node.toPacket();
    } else {
        return {
            response: "ok",
            entity: {
                "type": pathParams.major + "/" + pathParams.minor,
                "actions": this.matchingNodes(packet.resource).map(function(n) {
                    return n.entity.action;
                })
            }
        };
    }
});


ozpIwc.IntentsApi.declareRoute({
    action: "broadcast",
    resource: "/{major}/{minor}/{action}",
    filters: ozpIwc.standardApiFilters.getFilters()
}, function(packet, context, pathParams) {
    for(var i  in context.node.collection) {
        this.invokeIntentHandler(
            packet,
            pathParams.major + "/" + pathParams.minor,
            pathParams.action,
            this.matchingNodes(context.node.collection[i]),
            context.node.collection[i]
        );
    }

    return {
        response: "ok",
        entity: {
            handlers: context.node.collection
        }
    };
});

