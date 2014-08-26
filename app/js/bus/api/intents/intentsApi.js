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
    switch (path.length) {
        case 2:
            var node=new ozpIwc.IntentsApiTypeValue({
                resource:packet.resource,
                intentType: path[0] + "/" + path[1]                
            });
            this.addDynamicNode(node);
            return node;
        case 3:
            var node=new ozpIwc.IntentsApiDefinitionValue({
                resource:packet.resource,
                intentType: path[0] + "/" + path[1],
                intentAction: path[2]
            });
            this.addDynamicNode(node);
            return node;
        case 4:
            return new ozpIwc.IntentsApiHandlerValue({
                resource:packet.resource,
                intentType: path[0] + "/" + path[1],
                intentAction: path[2]
            });
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
	var key=this.createKey(node.resource+"/");

	// save the new child
	var childNode=this.makeValue({'resource':key});
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

};

