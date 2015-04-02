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
ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.ApiBase, function(config) {
    ozpIwc.CommonApiBase.apply(this, arguments);

    /**
     * How often a heartbeat message should occur.
     * @property heartbeatFrequency
     * @type {Number}
     * @default 10000
     */
    this.heartbeatFrequency = config.heartbeatFrequency || 10000;

    /**
     * The amount of heartbeats to drop an unresponsive participant after
     * @property heartbeatDropCount
     * @type {number|*}
     * @default 3
     */
    this.heartbeatDropCount = config.heartbeatDropCount || 3;


    this.apiMap = config.apiMap || ozpIwc.apiMap || {};

    // map the alias "/me" to "/address/{packet.src}" upon receiving the packet
    this.on("receive", function (packetContext) {
        var packet = packetContext.packet;
        if (packet.resource) {
            packet.resource = packet.resource.replace(/$\/me^/, packetContext.packet.src);
        }
    });

    this.addresses={
        "router": {
            contentType: "application/vnd.ozp-iwc-router-v1+json",
            listContentType: "application/vnd.ozp-iwc-router-list-v1+json",
            entries: {}
        },
        "address": {
            contentType: "application/vnd.ozp-iwc-address-v1+json",
            listContentType: "application/vnd.ozp-iwc-address-list-v1+json",
            entries: {}

        },
        "multicast": {
            contentType: "application/vnd.ozp-iwc-multicast-v1+json",
            listContentType: "application/vnd.ozp-iwc-multicast-list-v1+json",
            entries: {}
        }
    };

});
ozpIwc.PacketRouter.mixin(ozpIwc.NamesApi);
//====================================================================
// Address, Multicast, and Router endpoints
//====================================================================

// list and bulkGet use the same implementations

ozpIwc.NamesApi.declareRoute({
    action: "get",
    resource: "/{collection:address|multicast|router}",
    filters: [
    ]
}, function(packet,context,pathParams) {
    return {
        "contentType": "application/json",
        "entity": this.matchingNodes(packet.resource).map(function(node) {
            return node.resource;
         })
    };
});

// Disable set, delete
ozpIwc.NamesApi.declareRoute({
    action: ["set","delete"],
    resource: "/{collection:address|multicast|router}"
}, function(packet,context,pathParams) {
    throw new ozpIwc.BadActionError();
});

// Disable watch, unwatch.  Might be able to re-enable them in the future
ozpIwc.NamesApi.declareRoute({
    action: ["watch","unwatch"],
    resource: "/{collection:address|multicast|router}"
}, function(packet,context,pathParams) {
    throw new ozpIwc.BadActionError();
});
