/**
 * The Intents API. Subclasses The Common Api Base.
 * @class
 * @params config {Object}
 * @params config.href {String} - URI of the server side Data storage to load the Intents Api with
 * @params config.loadServerData {Boolean} - Flag to load server side data.
 * @params config.loadServerDataEmbedded {Boolean} - Flag to load embedded version of server side data.
 *                                                  Takes precedence over config.loadServerData
 */
ozpIwc.IntentsApi = ozpIwc.util.extend(ozpIwc.CommonApiBase, function (config) {
    ozpIwc.CommonApiBase.apply(this, arguments);
    this.loadFromServer("intents");
});

/**
 * Takes the resource of the given packet and creates an empty value in the IntentsApi. Chaining of creation is
 * accounted for (A handler requires a definition, which requires a capability).
 * @param {object} packet
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
            throw new ozpIwc.ApiError("badResource","Invalid resource: " + packet.resource)
    }
};

/**
 * Creates and registers a handler to the given definition resource path.
 * @param {object} node - the handler value to register, or the definition value the handler will register to
 * (handler will receive a generated key if definition value is provided).
 * @param {ozpIwc.TransportPacketContext} packetContext - the packet received by the router.
 */
ozpIwc.IntentsApi.prototype.handleRegister = function (node, packetContext) {
	var key=node.resource+"/"+packetContext.packet.src;

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
 * @param {object} node - the definition or handler value used to invoke the intent.
 * @param {ozpIwc.TransportPacketContext} packetContext - the packet received by the router.
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

ozpIwc.IntentsApi.prototype.chooseIntentHandler = function (nodeList, packetContext) {
    throw new ozpIwc.ApiError("noImplementation","Selecting an intent is not yet implemented");
};

