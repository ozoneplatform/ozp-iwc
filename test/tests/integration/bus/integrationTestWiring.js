var ozpIwc=ozpIwc || {};

if(ozpIwc.Peer) {
	ozpIwc.defaultPeer=new ozpIwc.Peer();
}

if(ozpIwc.Router) {
	ozpIwc.defaultRouter=new ozpIwc.Router({
			peer:ozpIwc.defaultPeer
		});
}

if(ozpIwc.LocalStorageLink) {
	ozpIwc.defaultLocalStorageLink=new ozpIwc.KeyBroadcastLocalStorageLink({
		peer: ozpIwc.defaultPeer
	});
}

if(ozpIwc.PostMessageParticipantListener) {
	ozpIwc.defaultPostMessageParticipantListener=new ozpIwc.PostMessageParticipantListener({
		router: ozpIwc.defaultRouter
	});
    var postMessageHandler = function(event) {
        if (event.data.type !== "client.test.request") {
           ozpIwc.defaultPostMessageParticipantListener.postMessageHandler(event);
        } else {
            // Craft our object that holds values we will want to check in our test
            var testValues = {
                maxSeqIdPerSource: ozpIwc.Peer.maxSeqIdPerSource,
                peer: ozpIwc.defaultPeer
            };
            parent.postMessage({
                type:"client.test.response",
                msg: JSON.stringify(testValues)
                },"http://localhost:14000");
        }
    };

    // Swap out the usual postMessage handler for one that will allow us to get values for integration testing.
    window.addEventListener("message",postMessageHandler,false);
    window.removeEventListener("message",ozpIwc.defaultPostMessageParticipantListener.postMessageHandler,false);

}

if(ozpIwc.BasicAuthorization) {
	ozpIwc.authorization=new ozpIwc.BasicAuthorization();
}

if(ozpIwc.KeyValueApi) {
	ozpIwc.keyValueApi=new ozpIwc.LeaderGroupParticipant({
		name: "keyValue.api",
		target: new ozpIwc.KeyValueApi()		
	});

	ozpIwc.defaultRouter.registerParticipant(ozpIwc.keyValueApi);
}