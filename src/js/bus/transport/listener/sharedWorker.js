var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.listener = ozpIwc.transport.listener || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.listener.SharedWorker = (function (log, transport, util) {
    /**
     * Listens for Message Port PostMessage messages from outside the Shared Web Worker and forwards them to the
     *     respected Participant.
     *
     * @class SharedWorker
     * @namespace ozpIwc.transport.listener
     * @extends ozpIwc.transport.participant.Base
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     */
    var SharedWorker = util.extend(transport.listener.Base, function (config) {
        transport.listener.Base.apply(this, arguments);
    });


    /**
     * @property name
     */
    SharedWorker.prototype.name = "SharedWorker";

    /**
     * @method registration
     * @override
     */
    SharedWorker.prototype.registration = function () {
        util.addEventListener("connect", connectHandlerGen(this), false);
    };

    /**
     * A handler for participant connect events to the listener.
     * @method connectHandlerGen
     * @private
     * @param {SharedWorker} listener
     */
    var connectHandlerGen = function (listener) {
        return function (event) {
            var port = event.ports[0];

            var config = {
                'authorization': listener.authorization,
                'router': listener.router,
                'port': port,
                'ready': listener.readyPromise
            };

            port.addEventListener('message', messageHandlerGen(listener, port, config));
            port.start();
        };
    };

    /**
     * Generates an init message handler for the sharedWorkerListener's connection of a participant.
     * Handler destroyed after first message (connect message) as the participant opens its own message handler.
     * @method messageHandlerGen
     * @param {SharedWorker} listener
     * @param {Window} port
     * @param {Object} config
     * @returns {Function}
     */
    var messageHandlerGen = function (listener, port, config) {
        return function initMsg(evt) {

            // If the first message received is not noting the type of participant to create, kill the connection
            // The first message notifies (1) the type of participant and (2)
            // the origin that opened the IWC connection.
            if (evt.data && typeof(evt.data.type) === "string") {
                var type = evt.data.type.trim();
                config.origin = evt.data.proxyAs.origin.trim();
                var participant;
                switch (type.toLowerCase()) {
                    case "debugger":
                        participant = new transport.participant.SWDebugger(config);
                        break;
                    default:
                        participant = new transport.participant.SharedWorker(config);
                        break;
                }
                if (participant && !participant.invalid) {
                    listener.router.registerParticipant(participant);
                    listener.participants.push(participant);
                }
            }
            port.removeEventListener('message', initMsg);
        };
    };

    return SharedWorker;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));
