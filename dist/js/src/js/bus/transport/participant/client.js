var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */

ozpIwc.transport.participant.Client = (function (transport, util) {

    /**
     * A participant for the client's communication needs.
     * @class Client
     * @namespace ozpIwc.transport.participant
     *
     * @constructor
     * @extends ozpIwc.transport.participant.Base
     * @uses ozpIwc.util.ApiPromiseMixin
     * @param {Object} config
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {String} config.name The name of the participant.
     * @param {Boolean} [config.internal=false] Is this participant internal to the bus or used in a client.
     */
    var Client = util.extend(transport.participant.Base, function (config) {
        config = config || {};
        if (!config.router) {
            throw "Client Participant requires a router.";
        }

        transport.participant.Base.apply(this, arguments);
        /**
         * The type of the participant.
         * @property participantType
         * @type {String}
         * @default "internal"
         */
        this.participantType = "internalClient";

        /**
         * Notes if this is a client participant internal to the bus.
         * @property internal
         * @type {Boolean}
         * @default false
         */
        this.internal = config.internal || false;
        /**
         * The name of the participant.
         * @property name
         * @type {String}
         * @default ""
         */
        this.name = config.name;

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * The router to connect to.
         * @property router
         * @type {ozpIwc.transport.Router}
         */
        this.router = config.router;
        var self = this;
        this.on("connectedToRouter", function () {
            self.permissions.pushIfNotExist('ozp:iwc:address', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:sendAs', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:receiveAs', self.address);

            if (this.metrics) {
                this.metrics.gauge(self.metricRoot, "registeredCallbacks").set(function () {
                    if (!self.replyCallbacks || !Object.keys(self.replyCallbacks)) {
                        return 0;
                    }
                    return Object.keys(self.replyCallbacks).length;
                });
            }
        });

        util.ApiPromiseMixin(this, config.autoConnect);
    });


    /**
     * Connects the client from the IWC bus.
     * Fires:
     *     - {{#crossLink "ozpIwc.Client/#connected"}}{{/crossLink}}
     *
     * @method connect
     */
    Client.prototype.connect = function () {

        if (!this.connectPromise) {
            var self = this;
            /**
             * Promise to chain off of for client connection asynchronous actions.
             * @property connectPromise
             *
             * @type Promise
             */
            this.connectPromise = new Promise(function (resolve, reject) {
                resolve(self.router.registerParticipant(self));
            }).then(function (addr) {
                    return self.afterConnected(addr);
                });
        }

        return this.connectPromise;
    };
    /**
     * Send functionality for the Client type Participant.
     *
     * @method sendImpl
     * @param {ozpIwc.packet.Transport} packet
     */
    Client.prototype.sendImpl = transport.participant.Base.prototype.send;

    return Client;
}(ozpIwc.transport, ozpIwc.util));