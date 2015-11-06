var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 */

ozpIwc.api.names.Api = (function (api, apiMap, ozpConfig, util) {
    /**
     * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the
     * IWC. Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.names
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="names.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("names.api", function (config) {
        this.contentTypeMappings = util.genContentTypeMappings(api.names.node);
        for (var key in apiMap) {
            var apiObj = apiMap[key];
            var resourceName = '/api/' + apiObj.address;
            this.data[resourceName] = new api.base.Node({
                resource: resourceName,
                entity: {'actions': apiObj.actions},
                contentType: 'application/vnd.ozp-iwc-api-v1+json'
            });
        }
        var self = this;
        this.on("addressDisconnects", function (address) {
            var len = address.length;
            util.object.eachEntry(self.data, function (k, v) {
                if (k.substr(-len) === address) {
                    self.markForChange(v);
                    v.markAsDeleted();
                }
            });
        });
        this.leaderPromise.then(function () {
            window.setInterval(function () {self.checkForNonresponsives();}, ozpConfig.heartBeatFrequency);
        });
    });

    /**
     * Names API resources are not loaded from server, thus use the default IWC Node structure by default.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if(NodeType){
            return new NodeType(config);
        } else {
            return new api.base.Node(config);
        }
    };
    /**
     * Cycles through all /address/{address} resources and disconnects them from the bus if they have not responded in
     * the last 2 heartbeats.
     *
     * @method checkForNonresponsives
     */
    Api.prototype.checkForNonresponsives = function () {
        var self = this;
        this.matchingNodes("/address").forEach(function (node) {
            var delta = util.now() - node.entity.time;

            if (delta > 3 * ozpConfig.heartBeatFrequency) {
                console.log("[" + node.resource + "] [Removing] Time since update:", util.now() - node.entity.time);
                self.participant.send({
                    "dst": "$bus.multicast",
                    "action": "disconnect",
                    "entity": node.entity
                });
                node.markAsDeleted();
            }
        });
    };

// Default handlers are fine for list, bulkGet, watch, and unwatch with any properly formed resource
    Api.useDefaultRoute(["list", "bulkGet"], "{c:/}");
    Api.useDefaultRoute(["list", "bulkGet"], "{c:/(?:api|address|multicast|router).*}");

//====================================================================
// Address, Multicast, and Router endpoints
//====================================================================
    Api.declareRoute({
        action: ["set", "delete"],
        resource: "/{collection:api|address|multicast|router}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.NoPermissionError(packet);
    });
    Api.declareRoute({
        action: "get",
        resource: "/{collection:api|address|multicast|router}",
        filters: []
    }, function (packet, context, pathParams) {
        return {
            "contentType": "application/json",
            "entity": this.matchingNodes(packet.resource).map(function (node) {
                return node.resource;
            })
        };
    });

//====================================================================
// API endpoints
//====================================================================
    Api.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/api/{addr}");

    Api.declareRoute({
        action: "set",
        resource: "/api/{addr}",
        filters: api.filter.standard.setFilters(api.base.Node, "application/vnd.ozp-iwc-api-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

//====================================================================
// Address endpoints
//====================================================================
    Api.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/address/{addr}");

    Api.declareRoute({
        action: "set",
        resource: "/address/{addr}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address

        context.node.set(packet);
        return {response: "ok"};
    });

//====================================================================
// Multicast endpoints
//====================================================================
    Api.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/multicast/{group}");
    Api.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/multicast/{group}/{memberAddr}");

    Api.declareRoute({
        action: "set",
        resource: "/multicast/{addr}",
        filters: api.filter.standard.setFilters(api.base.Node, "application/vnd.ozp-iwc-multicast-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address

        //
        context.node.set(packet);
        return {response: "ok"};
    });
    Api.declareRoute({
        action: "set",
        resource: "/multicast/{group}/{member}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-multicast-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address

        //
        context.node.set(packet);
        return {response: "ok"};
    });

//====================================================================
// Router endpoints
//====================================================================
    Api.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/router/{addr}");

    Api.declareRoute({
        action: "set",
        resource: "/router/{addr}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-router-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address

        //
        context.node.set(packet);
        return {response: "ok"};
    });

    return Api;
}(ozpIwc.api, ozpIwc.apiMap, ozpIwc.config, ozpIwc.util));