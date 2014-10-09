/**
 * @submodule bus.api.Type
 */

/**
 * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the IWC.
 * Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the
 * {{#crossLink "ozpIwc.NamesApiValue"}}{{/crossLink}} which subclasses the
 * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
 *
 * @class NamesApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.CommonApiBase, function() {
    ozpIwc.CommonApiBase.apply(this, arguments);

    // map the alias "/me" to "/address/{packet.src}" upon receiving the packet
    this.on("receive", function (packetContext) {
        var packet = packetContext.packet;
        if (packet.resource) {
            packet.resource = packet.resource.replace(/$\/me^/, packetContext.packet.src);
        }
    });

    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/address",
        pattern: /^\/address\/.*$/,
        contentType: "application/ozpIwc-address-v1+json"
    }));
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/multicast",
        pattern: /^\/multicast\/.*$/,
        contentType: "application/ozpIwc-multicast-address-v1+json"
    }));
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/router",
        pattern: /^\/router\/.*$/,
        contentType: "application/ozpIwc-router-v1+json"
    }));
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/api",
        pattern: /^\/api\/.*$/,
        contentType: "application/ozpIwc-api-descriptor-v1+json"
    }));
    //temporary injector code. Remove when api loader is implemented
    var packet = {
        resource: '/api/data.api',
        entity: {'actions': ['get', 'set', 'delete', 'watch', 'unwatch', 'addChild', 'removeChild']},
        contentType: 'application/ozpIwc-api-descriptor-v1+json'
    };
    var node=this.findOrMakeValue(packet);
    node.set(packet);
    packet = {
        resource: '/api/intents.api',
        entity: {'actions': ['get','set','delete','watch','unwatch','register','unregister','invoke']},
        contentType: 'application/ozpIwc-api-descriptor-v1+json'
    };
    node=this.findOrMakeValue(packet);
    node.set(packet);
    packet = {
        resource: '/api/names.api',
        entity: {'actions': ['get','set','delete','watch','unwatch']},
        contentType: 'application/ozpIwc-api-descriptor-v1+json'
    };
    node=this.findOrMakeValue(packet);
    node.set(packet);
    packet = {
        resource: '/api/system.api',
        entity: { 'actions': ['get','set','delete','watch','unwatch']},
        contentType: 'application/ozpIwc-api-descriptor-v1+json'
    };
    node=this.findOrMakeValue(packet);
    node.set(packet);
});

/**
 * Checks that the given packet context's resource meets the requirements of the api. Throws exception if fails
 * validation
 *
 * @method validateResource
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the resource to be validated.
 */
ozpIwc.NamesApi.prototype.validateResource=function(node,packetContext) {
    if(packetContext.packet.resource && !packetContext.packet.resource.match(/^\/(api|address|multicast|router|me)/)){
        throw new ozpIwc.ApiError('badResource',"Invalide resource for name.api: " + packetContext.packet.resource);
    }
};

/**
 * Makes a {{#crossLink "ozpIwc.NamesApiValue"}}{{/crossLink}} from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.NamesApiValue}
 */
ozpIwc.NamesApi.prototype.makeValue = function(packet) {
    
    var path=packet.resource.split("/");
    var config={
        resource: packet.resource,
        contentType: packet.contentType
    };
    
    // only handle the root elements for now...
    switch(path[1]) {
        case "api": config.allowedContentTypes=["application/ozpIwc-api-descriptor-v1+json"]; break;
        case "address": config.allowedContentTypes=["application/ozpIwc-address-v1+json"]; break;
        case "multicast": config.allowedContentTypes=["application/ozpIwc-multicast-address-v1+json"]; break;
        case "router": config.allowedContentTypes=["application/ozpIwc-router-v1+json"]; break;

        default:
            throw new ozpIwc.ApiError("badResource","Not a valid path of names.api: " + path[1] + " in " + packet.resource);
    }
    return new ozpIwc.NamesApiValue(config);            
};

/**
 * Handles removing participant addresses from the names api.
 *
 * @method handleEventChannelDisconnectImpl
 * @param packetContext
 */
ozpIwc.NamesApi.prototype.handleEventChannelDisconnectImpl = function (packetContext) {

    delete this.data[packetContext.packet.entity.namesResource];

    for(var node in this.dynamicNodes) {
        var resource = this.dynamicNodes[node];
        this.updateDynamicNode(this.data[resource]);
    }
};
