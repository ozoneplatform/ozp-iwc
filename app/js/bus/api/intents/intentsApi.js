/**
 * @submodule bus.api.Type
 */

/**
 * The Intents Api. Provides Android-like intents through the IWC. Subclasses the
 * {{#crossLink "CommonApiBase"}}{{/crossLink}} Utilizes the following value classes which subclass the
 * {{#crossLink "CommonApiValue"}}{{/crossLink}}:
 *  - {{#crossLink "intentsApiDefinitionValue"}}{{/crossLink}}
 *  - {{#crossLink "intentsApiHandlerValue"}}{{/crossLink}}
 *  - {{#crossLink "intentsApiTypeValue"}}{{/crossLink}}
 *
 * @class IntentsApi
 * @namespace ozpIwc
 * @extends CommonApiBase
 * @constructor
 *
 * @params config {Object}
 * @params config.href {String} URI of the server side Data storage to load the Intents Api with
 * @params config.loadServerData {Boolean} Flag to load server side data.
 * @params config.loadServerDataEmbedded {Boolean} Flag to load embedded version of server side data.
 *                                                  Takes precedence over config.loadServerData
 */
ozpIwc.IntentsApi = ozpIwc.util.extend(ozpIwc.CommonApiBase, function (config) {
    ozpIwc.CommonApiBase.apply(this, arguments);

    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/ozpIntents/invocations",
        pattern: /^\/ozpIntents\/invocations\/.*$/,
        contentType: "application/ozpIwc-application-list-v1+json"
    }));
});

/**
 * Loads data from the server.
 *
 * @method loadFromServer
 */
ozpIwc.IntentsApi.prototype.loadFromServer=function() {
    return this.loadFromEndpoint(ozpIwc.linkRelPrefix + ":intent");
};
/**
 * Takes the resource of the given packet and creates an empty value in the IntentsApi. Chaining of creation is
 * accounted for (A handler requires a definition, which requires a capability).
 *
 * @param {Object} packet
 *
 * @returns {IntentsApiHandlerValue|IntentsAPiDefinitionValue|IntentsApiCapabilityValue}
 */
ozpIwc.IntentsApi.prototype.makeValue = function (packet) {
    // resource of form /majorType/minorType/action?/handler?
    var path=packet.resource.split(/\//);
    path.shift(); // shift off the empty element before the first slash
    var self=this;
    var createType=function(resource) {
        var node=new ozpIwc.IntentsApiTypeValue({
            resource: resource,
            intentType: path[0] + "/" + path[1]                
        });
        self.addDynamicNode(node);
        return node;
    };
    var createDefinition=function(resource) {
        var type="/" +path[0]+"/" + path[1];
        if(!self.data[type]) {
            self.data[type]=createType(type);
        }
        var node=new ozpIwc.IntentsApiDefinitionValue({
            resource: resource,
            intentType: path[0]+"/" + path[1] + "/" + path[2],
            intentAction: path[2]
        });
        self.addDynamicNode(node);
        return node;
    };
    var createHandler=function(resource) {
        var definition="/" +path[0]+"/" + path[1] + "/" + path[2];
        if(!self.data[definition]) {
            self.data[definition]=createDefinition(definition);
        }
        
        return new ozpIwc.IntentsApiHandlerValue({
            resource: resource,
            intentType: path[0] + "/" + path[1],
            intentAction: path[2]
        });
    };
    
    switch (path.length) {
        case 2:
            return createType(packet.resource);
        case 3:

            return createDefinition(packet.resource);
        case 4:
            return createHandler(packet.resource);
        default:
            throw new ozpIwc.ApiError("badResource","Invalid resource: " + packet.resource);
    }
};

ozpIwc.IntentsApi.prototype.makeIntentInvocation = function (node,packetContext){
    var resource = this.createKey("/ozpIntents/invocations/");

    var inflightPacket = new ozpIwc.IntentsApiInFlightIntent({
        resource: resource,
        invokePacket:packetContext.packet,
        contentType: node.contentType,
        type: node.entity.type,
        action: node.entity.action,
        entity: packetContext.packet.entity,
        handlerChoices: node.getHandlers(packetContext)
    });

    this.data[inflightPacket.resource] = inflightPacket;

    return inflightPacket;
};

/**
 * Creates and registers a handler to the given definition resource path.
 *
 * @method handleRegister
 * @param {Object} node the handler value to register, or the definition value the handler will register to
 * (handler will receive a generated key if definition value is provided).
 * @param {ozpIwc.TransportPacketContext} packetContext the packet received by the router.
 */
ozpIwc.IntentsApi.prototype.handleRegister = function (node, packetContext) {
    var key=this.createKey(node.resource+"/"); //+packetContext.packet.src;

    // save the new child
    var childNode=this.findOrMakeValue({'resource':key});
    var clone = ozpIwc.util.clone(childNode);

    packetContext.packet.entity.invokeIntent = packetContext.packet.entity.invokeIntent || {};
    packetContext.packet.entity.invokeIntent.dst = packetContext.packet.src;
    packetContext.packet.entity.invokeIntent.replyTo = packetContext.packet.msgId;

    for(var i in packetContext.packet.entity){
        clone.entity[i] = packetContext.packet.entity[i];
    }
    childNode.set(clone);

    packetContext.replyTo({
        'response':'ok',
        'entity' : {
            'resource': childNode.resource
        }
    });
};


/**
 * Invokes the appropriate handler for the intent from one of the following methods:
 *  <li> user preference specifies which handler to use. </li>
 *  <li> by prompting the user to select which handler to use. </li>
 *  <li> by receiving a handler resource instead of a definition resource </li>
 *  @todo <li> user preference specifies which handler to use. </li>
 *  @todo <li> by prompting the user to select which handler to use. </li>
 *
 * @method handleInvoke
 * @param {Object} node the definition or handler value used to invoke the intent.
 * @param {ozpIwc.TransportPacketContext} packetContext the packet received by the router.
 */
ozpIwc.IntentsApi.prototype.handleInvoke = function (node, packetContext) {
    if(typeof(node.getHandlers) !== "function") {
        throw new ozpIwc.ApiError("badResource","Resource is not an invokable intent");
    }
    
    var handlerNodes=node.getHandlers(packetContext);

    var inflightPacket = this.makeIntentInvocation(node,packetContext);

    if(handlerNodes.length === 1) {
        var updateInFlightEntity = ozpIwc.util.clone(inflightPacket);
        updateInFlightEntity.entity.handlerChosen = {
            'resource' : handlerNodes[0].resource,
            'reason' : "onlyOne"
        };

        updateInFlightEntity.entity.state = "delivering";
        inflightPacket.set(updateInFlightEntity);

        this.invokeIntentHandler(handlerNodes[0],packetContext,inflightPacket);
    } else {
        this.chooseIntentHandler(node,packetContext,inflightPacket);
    }
};

/**
 * Invokes the appropriate handler for set actions. If the action pertains to an In-Flight Intent, the state of the
 * entity is used to determine how the action is handled.
 *
 * @method handleSet
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleSet = function (node, packetContext) {
    if(packetContext.packet.contentType === "application/vnd.ozp-iwc-intent-in-flight-v1+json"){
        switch (packetContext.packet.entity.state){
            case "new":
                // shouldn't be set externally
                packetContext.replyTo({'response':'bad'});
                break;
            case "choosing":
                this.handleInFlightChoose(node,packetContext);
                break;
            case "delivering":
                // shouldn't be set externally
                packetContext.replyTo({'response':'bad'});
                break;
            case "running":
                this.handleInFlightRunning(node,packetContext);
                break;
            case "fail":
                this.handleInFlightFail(node,packetContext);
                break;
            case "complete":
                this.handleInFlightComplete(node,packetContext);
                break;
        }
    } else {
        ozpIwc.CommonApiBase.prototype.handleSet.apply(this, arguments);
    }
};


/**
 *
 * @TODO (DOC)
 * @method handleDelete
 * @param {ozpIwc.CommonApiValue} node @TODO (DOC)
 * @param {ozpIwc.TransportPacketContext} packetContext @TODO (DOC)
 */
ozpIwc.IntentsApi.prototype.handleDelete=function(node,packetContext) {
    delete this.data[node.resource];
    packetContext.replyTo({'response':'ok'});
};

/**
 * Invokes an Intent Api Intent handler based on the given packetContext.
 *
 * @method invokeIntentHandler
 * @param {ozpIwc.intentsApiHandlerValue} node
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.IntentsApi.prototype.invokeIntentHandler = function (handlerNode, packetContext,inFlightIntent) {
    inFlightIntent = inFlightIntent || {};

    var packet = {
        dst: handlerNode.entity.invokeIntent.dst,
        replyTo: handlerNode.entity.invokeIntent.replyTo,
        entity: {
            inFlightIntent: inFlightIntent.resource
        }
    };

    var self = this;
    this.participant.send(packet,function(response) {
        var blacklist=['src','dst','msgId','replyTo'];
        var packet={};
        for(var k in response) {
            if(blacklist.indexOf(k) === -1) {
                packet[k]=response[k];
            }
        }
        self.participant.send({
            replyTo: packet.msgId,
            dst: packet.src,
            response: 'ok',
            entity: packet
        });
        packetContext.replyTo(packet);
    });
};

/**
 * Produces a modal for the user to select a handler from the given list of intent handlrs.
 * @TODO not implemented.
 *
 * @method chooseIntentHandler
 * @param {ozpIwc.intentsApiHandlerValue[]} nodeList
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.IntentsApi.prototype.chooseIntentHandler = function (node, packetContext,inflightPacket) {


    inflightPacket.entity.state = "choosing";
    ozpIwc.util.openWindow("intentsChooser.html",{
       "ozpIwc.peer":ozpIwc.BUS_ROOT,
       "ozpIwc.intentSelection": "intents.api"+inflightPacket.resource
    });
};

/**
 * Handles removing participant registrations from intent handlers when said participant disconnects.
 *
 * @method handleEventChannelDisconnectImpl
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleEventChannelDisconnectImpl = function (packetContext) {
    for(var node in this.data){
        if(this.data[node] instanceof ozpIwc.IntentsApiHandlerValue) {
            if(this.data[node].entity.invokeIntent.dst === packetContext.packet.entity.address) {
                delete this.data[node];
            }
        }
    }

    for(var dynNode in this.dynamicNodes) {
        var resource = this.dynamicNodes[dynNode];
        this.updateDynamicNode(this.data[resource]);
    }
};


/**
 * Handles in flight intent set actions with a state of "choosing"
 * @private
 * @method handleInFlightChoose
 * @param node
 * @param packetContext
 * @returns {null}
 */
ozpIwc.IntentsApi.prototype.handleInFlightChoose = function (node, packetContext) {

    if(node.entity.state !== "choosing"){
        return null;
    }

    var handlerNode = this.data[packetContext.packet.entity.resource];
    if(!handlerNode){
        return null;
    }

    if(node.acceptedReasons.indexOf(packetContext.packet.entity.reason) < 0){
        return null;
    }

    var updateNodeEntity = ozpIwc.util.clone(node);

    updateNodeEntity.entity.handlerChosen = {
        'resource' : packetContext.packet.entity.resource,
        'reason' : packetContext.packet.entity.reason
    };
    updateNodeEntity.entity.state = "delivering";
    node.set(updateNodeEntity);

    this.invokeIntentHandler(handlerNode,packetContext,node);

    packetContext.replyTo({
        'response':'ok'
    });
};

/**
 * Handles in flight intent set actions with a state of "running"
 *
 * @private
 * @method handleInFlightRunning
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleInFlightRunning = function (node, packetContext) {
    var updateNodeEntity = ozpIwc.util.clone(node);
    updateNodeEntity.entity.state = "running";
    updateNodeEntity.entity.handler.address = packetContext.packet.entity.address;
    updateNodeEntity.entity.handler.resource = packetContext.packet.entity.resource;
    node.set(updateNodeEntity);
    packetContext.replyTo({
        'response':'ok'
    });


};

/**
 * Handles in flight intent set actions with a state of "fail"
 *
 * @private
 * @method handleInFlightFail
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleInFlightFail = function (node, packetContext) {
    var invokePacket = node.invokePacket;
    var updateNodeEntity = ozpIwc.util.clone(node);

    updateNodeEntity.entity.state = packetContext.packet.entity.state;
    updateNodeEntity.entity.reply.contentType = packetContext.packet.entity.reply.contentType;
    updateNodeEntity.entity.reply.entity = packetContext.packet.entity.reply.entity;

    node.set(updateNodeEntity);

    var snapshot = node.snapshot();

    this.handleDelete(node,packetContext);

    this.notifyWatchers(node, node.changesSince(snapshot));

    packetContext.replyTo({
        'response':'ok'
    });

    this.participant.send({
        replyTo: invokePacket.msgId,
        dst: invokePacket.src,
        response: 'ok',
        entity: {
            response: node.entity.reply,
            invoked: false
        }
    });
};

/**
 * Handles in flight intent set actions with a state of "complete"
 *
 * @private
 * @method handleInFlightComplete
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleInFlightComplete = function (node, packetContext) {
    var invokePacket = node.invokePacket;
    var updateNodeEntity = ozpIwc.util.clone(node);

    updateNodeEntity.entity.state = packetContext.packet.entity.state;
    updateNodeEntity.entity.reply.contentType = packetContext.packet.entity.reply.contentType;
    updateNodeEntity.entity.reply.entity = packetContext.packet.entity.reply.entity;

    node.set(updateNodeEntity);

    var snapshot = node.snapshot();

    this.handleDelete(node,packetContext);

    this.notifyWatchers(node, node.changesSince(snapshot));

    packetContext.replyTo({
        'response':'ok'
    });

    this.participant.send({
        replyTo: invokePacket.msgId,
        dst: invokePacket.src,
        response: 'ok',
        entity: {
            response: node.entity.reply,
            invoked: true
        }
    });
};