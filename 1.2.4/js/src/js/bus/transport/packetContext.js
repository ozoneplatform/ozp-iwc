var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.transport
 */



ozpIwc.transport.PacketContext = (function (util) {
    /**
     * @class PacketContext
     * @namespace ozpIwc.transport
     * @param {Object} config
     * @param {ozpIwc.packet.Transport} config.packet
     * @param {ozpIwc.transport.Router} config.router
     * @param {ozpIwc.transport.participant.Base} [config.srcParticpant]
     * @param {ozpIwc.transport.participant.Base} [config.dstParticpant]
     */
    var PacketContext = function (config) {
        /**
         * @property packet
         * @type ozpIwc.packet.Transport
         */

        /**
         * @property router
         * @type ozpIwc.transport.Router
         */

        /**
         * @property [srcParticipant]
         * @type ozpIwc.transport.participant.Base
         */

        /**
         * @property [dstParticipant]
         * @type ozpIwc.transport.participant.Base
         */
        for (var i in config) {
            this[i] = config[i];
        }
    };

    /**
     * Formats a response packet,
     *
     * @method makeReplyTo
     * @param {Object} response
     * @param {Number} [response.ver]
     * @param {Number} [response.time]
     * @param {String} [response.replyTo]
     * @param {String} [response.src]
     * @param {String} [response.dst]
     * @return {Object}
     */
    PacketContext.prototype.makeReplyTo = function (response) {
        var now = new Date().getTime();
        response.ver = response.ver || 1;
        response.time = response.time || now;
        response.replyTo = response.replyTo || this.packet.msgId;
        response.src = response.src || this.packet.dst;
        response.dst = response.dst || this.packet.src;
        response.respondOn = response.respondOn || "none";
        return response;
    };

    /**
     * Sends the given response to the sender of this context if the packet respondOn criteria is met.
     *
     * @method replyTo
     * @param {ozpIwc.packet.Transport} response
     * @return {ozpIwc.packet.Transport} the packet that was sent
     */
    PacketContext.prototype.replyTo = function (response) {

        if (shouldReply(this, response)) {
            response = this.makeReplyTo(response);

            if (this.dstParticipant) {
                this.dstParticipant.send(response);
            } else {
                response.msgId = response.msgId || util.now();
                this.router.send(response);
            }
            return response;
        }
    };

    /**
     * Returns true if this packet be replied to based on its respondOn.
     *
     * @method shouldReply
     * @private
     * @static
     * @param {ozpIwc.transport.PacketContext} context
     * @param {Object} response
     * @return {Boolean}
     */
    var shouldReply = function (context, response) {
        context.packet = context.packet || {};
        context.packet.respondOn = context.packet.respondOn || "all";

        switch (context.packet.respondOn) {
            case "none":
                return false;
            case "error":
                return /(bad|no).*/.test(response.response);
            default: // "all"
                return true;
        }
    };

    return PacketContext;
}(ozpIwc.util));
