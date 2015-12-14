var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */



ozpIwc.transport.participant.PostMessage = (function (log, transport, util) {
    /**
     * @class PostMessage
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     *
     * @param {Object} config
     * @param {String} config.origin
     * @param {Object} config.source
     * @param {Object} config.credentials
     * @param {Promise} [config.ready]
     */
    var PostMessage = util.extend(transport.participant.Base, function (config) {
        transport.participant.Base.apply(this, arguments);

        /**
         * The origin of the Participant.
         * @property origin
         */
        /**
         * The name of the Participant.
         * @property name
         */
        this.origin = this.name = config.origin;

        /**
         * The window of the Participant.
         * @property source
         * @type Window
         */
        this.source = config.source;

        /**
         * @property credentials
         * @type {Object}
         */
        this.credentials = config.credentials;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();
        /**
         * The type of the participant.
         * @property participantType
         * @type  String
         * @default "postMessageProxy"
         */
        this.participantType = "postMessageProxy";

        this.permissions.pushIfNotExist("ozp:iwc:origin", this.origin);

        this.on("connectedToRouter", function () {
            this.permissions.pushIfNotExist('ozp:iwc:address', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:sendAs', this.address);
            this.permissions.pushIfNotExist('ozp:iwc:receiveAs', this.address);
        }, this);
        /**
         * @property heartBeatStatus.origin
         * @type String
         */
        this.heartBeatStatus.origin = this.origin;

        util.safePostMessage(this.source, {iwcInit: true});
    });

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------


//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * The participant hijacks anything addressed to "$transport" and serves it
     * directly.  This isolates basic connection checking from the router, itself.
     *
     * @method handleTransportpacket
     * @param {ozpIwc.transport.packet.PostMessage} participant
     * @param {Object} packet
     */
    PostMessage.prototype.handleTransportPacket = function (packet) {
        var reply = {
            'ver': 1,
            'dst': this.address,
            'src': '$transport',
            'replyTo': packet.msgId,
            'msgId': this.generateMsgId(),
            'entity': {
                "address": this.address
            }
        };

        var self = this;
        this.readyPromise.then(function () {
            self.sendToRecipient(reply);
        });
    };
    /**
     * Receives a packet on behalf of this participant and forwards it via PostMessage.
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.transport.PacketContext} packetContext
     */
    PostMessage.prototype.receiveFromRouterImpl = function (packetContext) {
        this.sendToRecipient(packetContext.packet);
    };

    /**
     * Sends a message to the other end of our connection.  Wraps any string mangling
     * necessary by the postMessage implementation of the browser.
     *
     * @method sendToParticipant
     * @param {ozpIwc.packet.Transport} packet
     * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
     */
    PostMessage.prototype.sendToRecipient = function (packet) {
        util.safePostMessage(this.source, packet, this.origin);
    };


    /**
     * Sends a packet received via PostMessage to the Participant's router.
     *
     * @method forwardFromPostMessage
     * @todo track the last used timestamp and make sure we don't send a duplicate messageId
     * @param {ozpIwc.packet.Transport} packet
     * @param {Event} event
     */
    PostMessage.prototype.forwardFromPostMessage = function (packet, event) {
        if (typeof(packet) !== "object") {
            log.error("Unknown packet received: " + JSON.stringify(packet));
            return;
        }
        if (event.origin !== this.origin) {
            /** @todo participant changing origins should set off more alarms, probably */
            if (this.metrics) {
                this.metrics.counter("transport." + this.address + ".invalidSenderOrigin").inc();
            }
            return;
        }

        packet = this.fixPacket(packet);

        // if it's addressed to $transport, hijack it
        if (packet.dst === "$transport") {
            this.handleTransportPacket(packet);
        } else {
            this.router.send(packet, this);
        }
    };

    return PostMessage;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));

