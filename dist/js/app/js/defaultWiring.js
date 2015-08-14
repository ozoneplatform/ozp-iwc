var ozpIwc=ozpIwc || {};
ozpIwc.version = "1.0.3";
ozpIwc.log.threshold = 3;
ozpIwc.ELECTION_TIMEOUT = 3000;
ozpIwc.heartBeatFrequency = 1000; // 3 seconds
ozpIwc.apiRootUrl = ozpIwc.apiRootUrl || "/";
ozpIwc.policyRootUrl = ozpIwc.policyRootUrl || "/policy";
ozpIwc.basicAuthUsername= ozpIwc.basicAuthUsername || '';
ozpIwc.basicAuthPassword= ozpIwc.basicAuthPassword || '';
ozpIwc.linkRelPrefix = ozpIwc.linkRelPrefix || "ozp";

ozpIwc.intentsChooserUri = "intentsChooser.html";

(function() {
	var params=ozpIwc.util.parseQueryParams();
	if(params.log) {
		try{
			console.log("Setting log level to ",params.log);
			ozpIwc.log.setThreshold(ozpIwc.log[params.log.toUpperCase()]);
		}catch(e) {
			// just ignore it and leave the default level
		}
	}
})();

ozpIwc._busInit = function(){};
ozpIwc.authorization = new ozpIwc.policyAuth.PDP({
    'pip': new ozpIwc.policyAuth.PIP(),
    'prp': new ozpIwc.policyAuth.PRP(),
    'setsEndpoint': ozpIwc.policyRootUrl
});
var enablePostMessageParticipants = function(){};

if (typeof ozpIwc.enableDefault === "undefined" || ozpIwc.enableDefault) {
    ozpIwc.initEndpoints(ozpIwc.apiRootUrl || "api");
    ozpIwc.defaultPeer = new ozpIwc.Peer();
    ozpIwc.defaultLocalStorageLink = new ozpIwc.KeyBroadcastLocalStorageLink({
        peer: ozpIwc.defaultPeer
    });

    ozpIwc.defaultRouter = new ozpIwc.Router({
        peer: ozpIwc.defaultPeer,
        heartbeatFrequency: ozpIwc.heartBeatFrequency
    });

    if (typeof ozpIwc.acceptPostMessageParticipants === "undefined" ||ozpIwc.acceptPostMessageParticipants) {
        ozpIwc.defaultPostMessageParticipantListener = new ozpIwc.PostMessageParticipantListener({
            router: ozpIwc.defaultRouter,
            ready: new Promise(function(resolve){
                enablePostMessageParticipants = resolve;
            })
        });
    }

    ozpIwc._busInit = function() {
        if (typeof ozpIwc.runApis === "undefined" || ozpIwc.runApis) {
            ozpIwc.locksApi = new ozpIwc.LocksApi({'name': "locks.api"});
            ozpIwc.namesApi = new ozpIwc.NamesApi({'name': "names.api"});
            ozpIwc.dataApi = new ozpIwc.DataApi({'name': "data.api"});
            ozpIwc.intentsApi = new ozpIwc.IntentsApi({'name': "intents.api"});
            ozpIwc.systemApi = new ozpIwc.SystemApi({'name': "system.api"});
        }
        enablePostMessageParticipants();
    };
}


ozpIwc.util.prerender().then(ozpIwc._busInit);
