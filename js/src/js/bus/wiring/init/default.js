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

        wiring.endpointInitPromise = api.initEndpoints({
            apiRoot: config.apiRootUrl,
            ajaxQueue: wiring.ajaxQueue,
            templates: config.templates
        });
        wiring.peer = new network.Peer({
            metrics: wiring.metrics
        });

        //Dont use localStorage if using a Shared Web Worker
        if (!util.runningInWorker) {
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
            wiring.listeners = wiring.listeners || {};
            if (!util.runningInWorker) {
                wiring.listeners.postMessage = new transport.listener.PostMessage({
                    authorization: wiring.authorization,
                    router: wiring.router,
                    ready: new Promise(function (resolve) {
                        markReady = resolve;
                    })
                });
            } else {
                wiring.listeners.sharedWorker = new transport.listener.SharedWorker({
                    authorization: wiring.authorization,
                    router: wiring.router,
                    ready: new Promise(function (resolve) {
                        markReady = resolve;
                    })
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
                    'router': wiring.router,
                    'ajaxQueue': wiring.ajaxQueue
                });
                wiring.apis.intents = new api.intents.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.intentsApi,
                    'router': wiring.router,
                    'ajaxQueue': wiring.ajaxQueue
                });
                wiring.apis.system = new api.system.Api({
                    'authorization': wiring.authorization,
                    'endpoints': ozpIwc.endpointConfig.systemApi,
                    'router': wiring.router,
                    'ajaxQueue': wiring.ajaxQueue
                });

                markReady();
            };
        }

        ozpIwc.util.prerender().then(busInit);
    }

    return wiring;
})(ozpIwc.wiring, ozpIwc.api, ozpIwc.transport, ozpIwc.network, ozpIwc.config, ozpIwc.util);
