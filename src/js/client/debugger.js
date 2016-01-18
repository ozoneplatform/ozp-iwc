var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

ozpIwc.Debugger = (function (Client, util) {
    /**
     * A modified ozpIwc client for debugging purposes
     * @class Debugger
     * @namespace ozpIwc
     * @constructor
     * @extends ozpIwc.Client
     */
    var Debugger = util.extend(Client, function (config) {
        config.type = "debugger";
        Client.apply(this, arguments);
        var self = this;
        this.events.on('receive', function (packet) {
            switch (packet.resource) {
                case "traffic":
                    self.events.trigger('traffic', packet);
                    break;
                default:
                    break;
            }
        });
    });

    //----------------------------------------------------------------------
    // Private Properties
    //----------------------------------------------------------------------

    var sendSelf = function (dbg, packet, cb) {
        return dbg.connect().then(function () {
            packet.dst = dbg.address;
            return dbg.send(packet, cb);
        });
    };

    //----------------------------------------------------------------------
    // Public Properties
    //----------------------------------------------------------------------

    /**
     * Enables logging of packets on the IWC bus. Calls the callback with the packet that passed through the IWC.
     *
     * Promise resolves with the ID needed to stop logging with cancelLogTraffic
     * @method logTraffic
     * @param {Function} cb
     * @returns {Promise} a promise that will resolve with the log's unique ID string.
     */
    Debugger.prototype.logTraffic = function (cb) {
        if (!cb) {
            return Promise.reject();
        }

        var unwrap = function (reply) {
            if (reply.entity && reply.entity.packet) {
                cb(reply.entity.packet);
            }
        };

        return sendSelf(this, {
            resource: "traffic",
            action: "start"
        }, unwrap).then(function (response) {
            return response.replyTo;
        });
    };

    /**
     * Disables a registration for packet logging from the IWC Bus.
     * @method cancelLogTraffic
     * @param {String} msgId the ID resolved from the logTraffic request
     * @returns {Promise}
     */
    Debugger.prototype.cancelLogTraffic = function (msgId) {
        if (!msgId) {
            return Promise.reject();
        }

        return sendSelf(this, {
            resource: "traffic",
            action: "stop",
            entity: {
                msgId: msgId
            }
        });
    };

    /**
     * Gathers the API Endpoint map from the IWC Bus
     * @method getApiEndpoints
     * @returns {Promise} a promise that will resolve with array of api endpoint data.
     */
    Debugger.prototype.getApiEndpoints = function () {
        return sendSelf(this, {resource: "apis", action: "getEndpoints"}).then(function (response) {
            return response.entity;
        });
    };

    /**
     * Gathers a snapshot of the metrics registry on the IWC Bus
     * @method getMetrics
     * @returns {Promise} a promise that will resolve with an array of metrics
     */
    Debugger.prototype.getMetrics = function () {
        return sendSelf(this, {resource: "metrics", action: "getAll"}).then(function (response) {
            return response.entity;
        });
    };

    /**
     * Gathers a snapshot of the IWC Bus config settings
     * @method getConfig
     * @returns {Promise} a promise that will resolve with an object of configurations
     */
    Debugger.prototype.getConfig = function () {
        return sendSelf(this, {resource: "config", action: "getAll"}).then(function (response) {
            return response.entity;
        });
    };

    return Debugger;
}(ozpIwc.Client, ozpIwc.util));
