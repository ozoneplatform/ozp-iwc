var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.PostMessageListener = (function (log, transport, util) {
    /**
     * @TODO (DOC)
     * Listens for PostMessage messages and forwards them to the respected Participant.
     *
     * @class PostMessageListener
     * @namespace ozpIwc.transport.participant
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     * @param {Promise} [config.ready]
     */
    var PostMessageListener = function (config) {
        config = config || {};
        if(!config.router){
            throw "PostMessage Listener requires a router.";
        }
        /**
         * @property Participants
         * @type ozpIwc.transport.participant.PostMessage[]
         */
        this.participants = [];

        /**
         * @property router
         * @type ozpIwc.transport.Router
         */
        this.router = config.router;

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();

        var self = this;

        util.addEventListener("message", function (event) {
            self.receiveFromPostMessage(event);
        });

        if(this.metrics){
            this.metrics.gauge('transport.postMessageListener.participants').set(function () {
                return self.getParticipantCount();
            });
        }
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
            if (util.isIWCPacket(packet)) {
                participant.forwardFromPostMessage(packet, event);
            } else {
                log.debug("Packet does not meet IWC Packet criteria, dropping.", packet);
            }
        };

        // if this is a window who hasn't talked to us before, sign them up
        if (!participant) {

            var self = this;
            var request = {
                'subject': {'ozp:iwc:origin': event.origin},
                'action': {'ozp:iwc:action': 'connect'},
                'policies': this.authorization.policySets.connectSet
            };
            this.authorization.isPermitted(request)
                .success(function () {
                    participant = new transport.participant.PostMessage({
                        'authorization': self.authorization,
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
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));