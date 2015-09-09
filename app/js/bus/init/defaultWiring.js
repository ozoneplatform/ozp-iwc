var ozpIwc=ozpIwc || {};

(function () {
    var busInit = function () {};
    var enablePostMessageParticipants = function () {};

    if (typeof ozpIwc.config.defaultWiring) {
        ozpIwc.initEndpoints(ozpIwc.config.apiRootUrl);
        ozpIwc.defaultPeer = new ozpIwc.Peer();
        ozpIwc.defaultLocalStorageLink = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: ozpIwc.defaultPeer
        });

        ozpIwc.defaultRouter = new ozpIwc.Router({
            peer: ozpIwc.defaultPeer,
            heartbeatFrequency: ozpIwc.config.heartBeatFrequency
        });

        if (ozpIwc.config.allowLocalClients) {
            ozpIwc.defaultPostMessageParticipantListener = new ozpIwc.PostMessageParticipantListener({
                router: ozpIwc.defaultRouter,
                ready: new Promise(function (resolve) {
                    enablePostMessageParticipants = resolve;
                })
            });
        }

        busInit = function () {
            if (ozpIwc.config.runApis) {
                ozpIwc.endpointConfig = ozpIwc.endpointConfig || {};
                ozpIwc.locksApi = new ozpIwc.LocksApi({'name': "locks.api"});
                ozpIwc.namesApi = new ozpIwc.NamesApi({'name': "names.api"});
                ozpIwc.dataApi = new ozpIwc.DataApi({
                    'name': "data.api",
                    'endpoints': ozpIwc.endpointConfig.dataApi
                });
                ozpIwc.intentsApi = new ozpIwc.IntentsApi({
                    'name': "intents.api",
                    'endpoints': ozpIwc.endpointConfig.intentsApi
                });
                ozpIwc.systemApi = new ozpIwc.SystemApi({
                    'name': "system.api",
                    'endpoints': ozpIwc.endpointConfig.systemApi
                });
            }
            enablePostMessageParticipants();
        };
    }

    ozpIwc.util.prerender().then(busInit);
})();
