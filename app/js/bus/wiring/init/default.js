var ozpIwc = ozpIwc || {};
ozpIwc.wiring = ozpIwc.wiring || {};
/**
 * @module ozpIwc
 */

/**
 * The instantiated wiring for the IWC bus.
 * @class wiring
 * @static
 * @namespace ozpIwc
 */
ozpIwc.wiring = (function (wiring, api, transport, network, config, util) {
    // Instantiate default wiring if not in integration test mode (default false)
    if (!config._testMode) {
        var markReady = function () {};
        var busInit = function () {markReady();};

        api.initEndpoints(config.apiRootUrl);
        wiring.peer = new network.Peer({
            metrics: wiring.metrics
        });

        //Dont use localStorage if using a Shared Web Worker
        if (!util.runningInWorker()) {
            wiring.link = new network.KeyBroadcastLocalStorageLink({
                metrics: wiring.metrics,
                peer: wiring.peer
            });
        }

        wiring.router = new transport.Router({
            authorization: wiring.authorization,
            metrics: wiring.metrics,
            peer: wiring.peer,
            heartbeatFrequency: config.heartBeatFrequency
        });

        // Enable post message participants (default true)
        if (config.allowLocalClients) {

            if (!util.runningInWorker()) {
                wiring.postMessageListener = new transport.participant.PostMessageListener({
                    authorization: wiring.authorization,
                    router: wiring.router,
                    ready: new Promise(function (resolve) {
                        markReady = resolve;
                    })
                });
            } else {
                wiring.sharedWorkerListener = new transport.participant.SharedWorkerListener({
                    authorization: wiring.authorization,
                    router: wiring.router
                });
            }
        }

        // Configure APIs post prerender (default true)
        if (config.runApis) {
            busInit = function () {
                ozpIwc.endpointConfig = ozpIwc.endpointConfig || {};
                wiring.apis = wiring.apis || {};
                wiring.apis.locks = new api.locks.Api({
                    'authorization': wiring.authorization,
                    'router': wiring.router
                });
                wiring.apis.names = new api.names.Api({
                    'authorization': wiring.authorization,
                    'router': wiring.router
                });
                wiring.apis.data = new api.data.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.dataApi,
                    'router': wiring.router
                });
                wiring.apis.intents = new api.intents.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.intentsApi,
                    'router': wiring.router
                });
                wiring.apis.system = new api.system.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.systemApi,
                    'router': wiring.router
                });

                markReady();
            };
        }

        ozpIwc.util.prerender().then(busInit);
    }

    return wiring;
})(ozpIwc.wiring, ozpIwc.api, ozpIwc.transport, ozpIwc.network, ozpIwc.config, ozpIwc.util);
