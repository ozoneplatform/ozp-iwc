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
     * Checkes if the postMessage received packet is a valid packet and
     * forwards it to the local participant.
     * @private
     * @static
     * @method forwardPacket
     * @param  {ozpIwc.transport.Participant} participant [description]
     * @param  {ozpIwc.transport.PacketContext.packet} packet      [description]
     */
    var forwardPacket = function (participant, packet, event) {
        if (util.isIWCPacket(packet)) {
            participant.forwardFromPostMessage(packet, event);
        } else {
            log.debug("Packet does not meet IWC Packet criteria, dropping.", packet);
        }
    };

    /**
     * Creates an IWC participant given the receiving of a message from an
     * unknown sender (new participant).
     * Leverages the message event to gain information about the new participant.
     * @static
     * @private
     * @method genParticipant
     * @param  {ozpIwc.transport.listener.PostMessage} listener
     * @param  {Event} event    "message" event
     * @param  {ozpIwc.transport.PacketContext.packet} packet
     */
    var genParticipant = function(listener, event, packet) {
        var type = packet.type || "default";
        var participant;
        var config = {
            'authorization': listener.authorization,
            'origin': event.origin,
            'source': event.source,
            'router': listener.router,
            'credentials': packet.entity,
            'ready': listener.readyPromise
        };
        switch (type.trim().toLowerCase()) {
            case "debugger":
                participant = new transport.participant.PMDebugger(config);
                break;
            case "default":
                participant = new transport.participant.PostMessage(config);
                break;
        }

        if (participant && !participant.invalid) {
            listener.router.registerParticipant(participant, packet);
            listener.participants.push(participant);
            return participant;
        }
    };

    /**
     * When receiving a "message" event from an unknown source, check against
     * the permissions to see if a participant can be made for the sender.
     * Returns an asyncAction that will succeed if the permissions allow.
     * @static
     * @private
     * @method verifyParticipant
     * @param  {ozpIwc.transport.listener.PostMessage} listener
     * @param  {Event} event    [description]
     * @return {ozpIwc.util.AsyncAction} will call success if participant is
     * allowed to be created.
     */
    var verifyParticipant = function(listener, event){
        var request = {
            'subject': {'ozp:iwc:origin': event.origin},
            'action': {'ozp:iwc:action': 'connect'},
            'policies': listener.authorization.policySets.connectSet
        };
        return listener.authorization.isPermitted(request);
    };
    /**
     * @method registration
     * @override
     */
    PostMessage.prototype.registration = function () {
        var listener = this;
        util.addEventListener("message", function (event) {
            var participant = listener.findParticipant(event.source);
            var packet = event.data;
            if (event.source === util.globalScope) {
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
            // if this is a window who hasn't talked to us before, sign them up
            if (!participant) {
                verifyParticipant(listener, event).success(function() {
                    participant = genParticipant(listener, event, packet);
                    if(participant){
                        forwardPacket(participant, packet, event);
                    }
                }).failure(function (err) {
                    log.error("Failed to connect. Could not authorize:", err);
                });
            } else {
                forwardPacket(participant, packet, event);
            }

        });
    };

    return PostMessage;

}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));
