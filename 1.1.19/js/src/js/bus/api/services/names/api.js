var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 */

ozpIwc.api.names.Api = (function (api, apiMap, log, ozpConfig, util) {
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
    });

//--------------------------------------------------
// Distributed Computing: Mutex lock on handling API requests/holding active state
//--------------------------------------------------

    /**
     * Called when the API begins operation as leader. Registers interval checks on nodes for non-responsiveness.
     * @method onStart
     */
    Api.prototype.onStart = function () {
        var self = this;
        setInterval(function () {self.checkForNonresponsives();}, ozpConfig.heartBeatFrequency);
    };

//--------------------------------------------------
// Bus event handlers
//--------------------------------------------------
    /**
     * A handler for the names Api receiving notification of a disconnection from the bus. Calls the base Api
     * handler then the names API will check all nodes based on the router ID (portion of address after ".") and remove
     * all records pertaining to that router (all connections closed).
     *
     * @method onClientDisconnect
     * @param {String} address
     */
    Api.prototype.onClientDisconnect = function (address) {
        api.base.Api.prototype.onClientDisconnect.apply(this, arguments);
        var len = address.length;
        var self = this;
        util.object.eachEntry(this.data, function (k, v) {
            if (k.substr(-len) === address) {
                self.markForChange(v);
                v.markAsDeleted();
            }
        });
    };

//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------

    /**
     * Names API resources are not loaded from server, thus use the default IWC Node structure by default.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
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
                log.log("[" + node.resource + "] [Removing] Time since update:", util.now() - node.entity.time);
                self.participant.send({
                    "dst": "$bus.multicast",
                    "action": "disconnect",
                    "entity": node.entity
                });
                node.markAsDeleted();
            }
        });
    };

    return Api;
}(ozpIwc.api, ozpIwc.apiMap, ozpIwc.log, ozpIwc.config, ozpIwc.util));
