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
	childNode.set(packetContext.packet);
	
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
    
    if(handlerNodes.length === 1) {
        this.invokeIntentHandler(handlerNodes[0],packetContext);
    } else {
        this.chooseIntentHandler(handlerNodes,packetContext);
    }
};


/**
 * Invokes an Intent Api Intent handler based on the given packetContext.
 *
 * @method invokeIntentHandler
 * @param {ozpIwc.intentsApiHandlerValue} node
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.IntentsApi.prototype.invokeIntentHandler = function (node, packetContext) {
    // check to see if there's an invokeIntent package
    var packet=ozpIwc.util.clone(node.entity.invokeIntent);
    
    // assign the entity and contentType from the packet Context
    packet.entity=ozpIwc.util.clone(packetContext.packet.entity);
    packet.contentType=packetContext.packet.contentType;
    packet.permissions=packetContext.packet.permissions;
    

    this.participant.send(packet,function(response) {
        var blacklist=['src','dst','msgId','replyTo'];
        var packet={};
        for(var k in response) {
            if(blacklist.indexOf(k) === -1) {
                packet[k]=response[k];
            }
        }
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
ozpIwc.IntentsApi.prototype.chooseIntentHandler = function (nodeList, packetContext) {
    throw new ozpIwc.ApiError("noImplementation","Selecting an intent is not yet implemented");
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