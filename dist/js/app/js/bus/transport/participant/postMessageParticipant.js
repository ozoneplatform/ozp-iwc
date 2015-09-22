var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */



ozpIwc.transport.participant.PostMessage = (function (ozpIwc) {
    /**
     * @class PostMessage
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     *
     * @param {Object} config
     * @param {String} config.origin
     * @param {Object} config.sourceWindow
     * @param {Object} config.credentials
     * @param {Promise} [config.ready]
     */
    var PostMessage = ozpIwc.util.extend(ozpIwc.transport.participant.Base, function (config) {
        ozpIwc.transport.participant.Base.apply(this, arguments);

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
         * @property sourceWindow
         * @type Window
         */
        this.sourceWindow = config.sourceWindow;

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
    });

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * The participant hijacks anything addressed to "$transport" and serves it
     * directly.  This isolates basic connection checking from the router, itself.
     *
     * @method handleTransportpacket
     * @private
     * @static
     * @param {ozpIwc.transport.packet.PostMessage} participant
     * @param {Object} packet
     */
    var handleTransportPacket = function (participant, packet) {
        var reply = {
            'ver': 1,
            'dst': participant.address,
            'src': '$transport',
            'replyTo': packet.msgId,
            'msgId': participant.generateMsgId(),
            'entity': {
                "address": participant.address
            }
        };

        participant.readyPromise.then(function () {
            participant.sendToRecipient(reply);
        });
    };


//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * Receives a packet on behalf of this participant and forwards it via PostMessage.
     *
     * @method receiveFromRouterImpl
     * @param {ozpIwc.TransportPacketContext} packetContext
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
        ozpIwc.util.safePostMessage(this.sourceWindow, packet, this.origin);
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
            ozpIwc.log.error("Unknown packet received: " + JSON.stringify(packet));
            return;
        }
        if (event.origin !== this.origin) {
            /** @todo participant changing origins should set off more alarms, probably */
            ozpIwc.metrics.counter("transport." + this.address + ".invalidSenderOrigin").inc();
            return;
        }

        packet = this.fixPacket(packet);

        // if it's addressed to $transport, hijack it
        if (packet.dst === "$transport") {
            handleTransportPacket(this, packet);
        } else {
            this.router.send(packet, this);
        }
    };

    return PostMessage;
}(ozpIwc));


ozpIwc.transport.participant.PostMessageListener = (function (ozpIwc) {
    /**
     * @TODO (DOC)
     * Listens for PostMessage messages and forwards them to the respected Participant.
     *
     * @class PostMessageListener
     * @namespace ozpIwc.transport.participant
     * @param {Object} [config]
     * @param {ozpIwc.Router} [config.router]
     * @param {Promise} [config.ready]
     */
    var PostMessageListener = function (config) {
        config = config || {};

        /**
         * @property Participants
         * @type ozpIwc.transport.participant.PostMessage[]
         */
        this.participants = [];

        /**
         * @property router
         * @type ozpIwc.Router
         */
        this.router = config.router || ozpIwc.defaultRouter;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();

        var self = this;

        ozpIwc.util.addEventListener("message", function (event) {
            self.receiveFromPostMessage(event);
        });

        ozpIwc.metrics.gauge('transport.postMessageListener.participants').set(function () {
            return self.getParticipantCount();
        });
    };

    /**
     * Gets the count of known participants
     *
     * @method getParticipantCount
     *
     * @return {Number} the number of known participants
     */
    PostMessageListener.prototype.getParticipantCount = function () {
        if (!this.participants) {
            return 0;
        }
        return this.participants.length;
    };

    /**
     * Finds the participant associated with the given window.  Unfortunately, this is an
     * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
     * compare windows other than equality.
     *
     * @method findParticipant
     * @param {Object} sourceWindow - the participant window handle from message's event.source
     */
    PostMessageListener.prototype.findParticipant = function (sourceWindow) {
        for (var i = 0; i < this.participants.length; ++i) {
            if (this.participants[i].sourceWindow === sourceWindow) {
                return this.participants[i];
            }
        }
    };

    /**
     * Process a post message that is received from a peer
     *
     * @method receiveFromPostMessage
     * @param {Object} event - The event received from the "message" event handler
     * @param {String} event.origin
     * @param {Object} event.source
     * @param {ozpIwc.packet.Transport} event.data
     */
    PostMessageListener.prototype.receiveFromPostMessage = function (event) {
        var participant = this.findParticipant(event.source);
        var packet = event.data;
        if (event.source === window) {
            // the IE profiler seems to make the window receive it's own postMessages
            // ... don't ask.  I don't know why
            return;
        }
        if (typeof(event.data) === "string") {
            try {
                packet = JSON.parse(event.data);
            } catch (e) {
                // assume that it's some other library using the bus and let it go
                return;
            }
        }

        var isPacket = function (packet) {
            if (ozpIwc.util.isIWCPacket(packet)) {
                participant.forwardFromPostMessage(packet, event);
            } else {
                ozpIwc.log.debug("Packet does not meet IWC Packet criteria, dropping.", packet);
            }
        };

        // if this is a window who hasn't talked to us before, sign them up
        if (!participant) {

            var self = this;
            var request = {
                'subject': {'ozp:iwc:origin': event.origin},
                'action': {'ozp:iwc:action': 'connect'},
                'policies': ozpIwc.authorization.policySets.connectSet
            };
            ozpIwc.authorization.isPermitted(request)
                .success(function () {
                    participant = new ozpIwc.transport.participant.PostMessage({
                        'origin': event.origin,
                        'sourceWindow': event.source,
                        'credentials': packet.entity,
                        'ready': self.readyPromise
                    });
                    self.router.registerParticipant(participant, packet);
                    self.participants.push(participant);
                    isPacket(packet);

                }).failure(function (err) {
                    console.error("Failed to connect. Could not authorize:", err);
                });
        } else {
            isPacket(packet);
        }

    };

    return PostMessageListener;
}(ozpIwc));