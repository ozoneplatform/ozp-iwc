/**
 * @submodule bus.api.Type
 */

/**
 * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the IWC.
 * Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the
 * {{#crossLink "ozpIwc.LocksApiValue"}}{{/crossLink}} which subclasses the
 * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
 *
 * @class LocksApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.LocksApi = ozpIwc.util.extend(ozpIwc.CommonApiBase, function(config) {
    ozpIwc.CommonApiBase.apply(this, arguments);
});

/**
 * Checks that the given packet context's resource meets the requirements of the api. Throws exception if fails
 * validation
 *
 * @method validateResource
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the resource to be validated.
 */
ozpIwc.LocksApi.prototype.validateResource=function(node,packetContext) {
    if(packetContext.packet.resource && !packetContext.packet.resource.match(/^\/mutex/)){
        throw new ozpIwc.ApiError('badResource',"Invalid resource for locks.api: " + packetContext.packet.resource);
    }
};

/**
 * Makes a {{#crossLink "ozpIwc.LocksApiValue"}}{{/crossLink}} from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.LocksApiValue}
 */
ozpIwc.LocksApi.prototype.makeValue = function(packet) {
    return new ozpIwc.LocksApiValue({
        resource: packet.resource
    });
};

ozpIwc.LocksApi.prototype.updateLock=function(node,newOwner) {
    console.log("New lock owner: ",newOwner);
    if(!newOwner) {
        return;
    }
    var pkt={
        'dst'   : newOwner.src,
        'src'   : this.participant.name,
        'replyTo' : newOwner.msgId,
        'response': 'ok',
        'resource': node.resource
    };
    console.log("Sending ",pkt);
    
    this.participant.send(pkt);
};

ozpIwc.LocksApi.prototype.handleLock=function(node,packetContext) {
    this.updateLock(node,node.lock({
        src: packetContext.packet.src,
        msgId: packetContext.packet.msgId
    }));
};

ozpIwc.LocksApi.prototype.handleUnlock=function(node,packetContext) {
    this.updateLock(node,node.unlock({
        src: packetContext.packet.src,
        msgId: packetContext.packet.msgId
    }));
};
/**
 * Handles removing participant addresses from the names api.
 *
 * @method handleEventChannelDisconnectImpl
 * @param packetContext
 */
ozpIwc.LocksApi.prototype.handleEventChannelDisconnectImpl = function (packetContext) {

    for(var key in this.data) {
        var node=this.data[key];
        this.updateLock(node,node.unlock({
            src: packetContext.packet.entity.address
        }));
    }
};

ozpIwc.LocksApi.prototype.handleSet = function(node,packetContext) {
    packetContext.replyTo({
        'response': 'badAction',
        'entity': {
            'action': packetContext.packet.action,
            'originalRequest' : packetContext.packet
        }
    });
};

ozpIwc.LocksApi.prototype.handleDelete = function(node,packetContext) {
    packetContext.replyTo({
        'response': 'badAction',
        'entity': {
            'action': packetContext.packet.action,
            'originalRequest' : packetContext.packet
        }
    });
};