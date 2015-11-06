var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.listener = ozpIwc.transport.listener || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.listener
 */


ozpIwc.transport.listener.PostMessage = (function (log, transport, util) {
    /**
     * Listens for PostMessage messages and forwards them to the respected Participant.
     *
     * @class PostMessage
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     * @param {Promise} [config.ready]
     */
    var PostMessage = util.extend(transport.listener.Base, function (config) {
        transport.listener.Base.apply(this, arguments);
    });


    /**
     * @property name
     * @type {String}
     */
    PostMessage.prototype.name = "PostMessage";

    /**
     * @method registration
     * @override
     */
    PostMessage.prototype.registration = function () {
        var listener = this;
        util.addEventListener("message", function (event) {
            var participant = listener.findParticipant(event.source);
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
                var type = packet.type || "default";

                var request = {
                    'subject': {'ozp:iwc:origin': event.origin},
                    'action': {'ozp:iwc:action': 'connect'},
                    'policies': listener.authorization.policySets.connectSet
                };

                var config = {
                    'authorization': listener.authorization,
                    'origin': event.origin,
                    'source': event.source,
                    'router': listener.router,
                    'credentials': packet.entity,
                    'ready': listener.readyPromise
                };

                listener.authorization.isPermitted(request)
                    .success(function () {
                        switch (type.trim().toLowerCase()) {
                            case "debugger":
                                participant = new transport.participant.PMDebugger(config);
                                break;
                            case "default":
                                participant = new transport.participant.PostMessage(config);
                                break;
                        }

                        listener.router.registerParticipant(participant, packet);
                        listener.participants.push(participant);
                        isPacket(packet);

                    }).failure(function (err) {
                        console.error("Failed to connect. Could not authorize:", err);
                    });
            } else {
                isPacket(packet);
            }

        });
    };

    return PostMessage;

}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));