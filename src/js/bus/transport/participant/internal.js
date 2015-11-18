var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */

ozpIwc.transport.participant.Internal = (function (transport, util) {

    /**
     * @class Internal
     * @namespace ozpIwc.transport.participant
     * @constructor
     * @extends ozpIwc.transport.participant.Base
     * @param {Object} config
     * @param {String} config.name The name of the participant.
     */
    var Internal = util.extend(transport.participant.Base, function (config) {
        config = config || {};
        transport.participant.Base.apply(this, arguments);
        /**
         * @property replyCallbacks
         * @type {Object}
         */
        this.replyCallbacks = {};

        /**
         * The type of the participant.
         * @property participantType
         * @type {String}
         * @default "internal"
         */
        this.participantType = "internal";

        /**
         * The name of the participant.
         * @property name
         * @type {String}
         * @default ""
         */
        this.name = config.name;

        var self = this;
        this.on("connectedToRouter", function () {
            self.permissions.pushIfNotExist('ozp:iwc:address', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:sendAs', self.address);
            self.permissions.pushIfNotExist('ozp:iwc:receiveAs', self.address);
            if (self.metrics) {
                self.metrics.gauge(self.metricRoot, "registeredCallbacks").set(function () {
                    return getCallbackCount(self);
                });
            }
        });
    });

    /**
     * Gets the count of the registered reply callbacks.
     *
     * @method getCallbackCount
     * @private
     * @static
     * @param {ozpIwc.transport.participant.Internal} participant
     * @return {Number} The number of registered callbacks.
     */
    var getCallbackCount = function (participant) {
        if (!participant.replyCallbacks || !Object.keys(participant.replyCallbacks)) {
            return 0;
        }
        return Object.keys(participant.replyCallbacks).length;
    };

    /**
     * Cancels the callback corresponding to the given msgId.
     *
     * @method cancelCallback
     * @private
     * @static
     * @param {ozpIwc.transport.participant.Internal} participant
     * @param {Number} msgId
     *
     * @return {Boolean} returns true if successful.
     */
    var cancelCallback = function (participant, msgId) {
        var success = false;
        if (msgId) {
            delete participant.replyCallbacks[msgId];
            success = true;
        }
        return success;
    };


    /**
     * Handles packets received from the {{#crossLink "ozpIwc.transport.Router"}}{{/crossLink}} the participant is
     * registered to.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.transport.participant.Base/#receive:event"}}{{/crossLink}}
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.transport.PacketContext} packetContext
     */
    Internal.prototype.receiveFromRouterImpl = function (packetContext) {
        var packet = packetContext.packet;
        if (packet.replyTo && this.replyCallbacks[packet.replyTo]) {
            var cancel = false;
            var done = function () {
                cancel = true;
            };
            this.replyCallbacks[packet.replyTo](packet, done);
            if (cancel) {
                cancelCallback(this, packet.replyTo);
            }
        } else {
            this.events.trigger("receive", packetContext);
        }
    };

    /**
     * Sends a packet to this participants router. Uses setImmediate to force messages out in queue order.
     *
     * @method send
     * @param {Object} originalPacket
     * @param {Function}callback
     * @return {ozpIwc.packet.Transport}
     */
    Internal.prototype.send = function (originalPacket, callback) {
        var packet = this.fixPacket(originalPacket);
        if (callback) {
            this.replyCallbacks[packet.msgId] = callback;
        }
        var self = this;
        var send = transport.participant.Base.prototype.send;
        //util.setImmediate(function () {
        send.call(self, packet);
        //});

        return packet;
    };


    return Internal;
}(ozpIwc.transport, ozpIwc.util));