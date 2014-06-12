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
//	ozpIwc.defaultLocalStorageLink=new ozpIwc.LocalStorageLink({
//		peer: ozpIwc.defaultPeer
//	});	
}

if(ozpIwc.PostMessageParticipantListener) {
	ozpIwc.defaultPostMessageParticipantListener=new ozpIwc.PostMessageParticipantListener({
		router: ozpIwc.defaultRouter
	});
    var postMessageHandler = function(event) {
        if (event.data.type !== "client.test.request") {
           ozpIwc.defaultPostMessageParticipantListener.postMessageHandler(event);
        } else {
            console.log('this is a debug injection.');
        }
    }
    // Swap out the usual postMessage handler for one that will allow us to get values for integration testing.
    window.removeEventListener("message",ozpIwc.defaultPostMessageParticipantListener.postMessageHandler,false);
    window.addEventListener("message",postMessageHandler,false);

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
//
//if(ozpIwc.NamesApi) {
//	ozpIwc.namesApi=new ozpIwc.LeaderGroupParticipant({
//		name: "names.api",
//		target: new ozpIwc.NamesApi()
//	});
//	ozpIwc.defaultRouter.registerParticipant(ozpIwc.namesApi);
//}
//
//if(ozpIwc.IntentsApi) {
//	ozpIwc.intentsApi=new ozpIwc.LeaderGroupParticipant({
//		name: "intents.api",
//		target: new ozpIwc.IntentsApi()
//	});
//	ozpIwc.defaultRouter.registerParticipant(ozpIwc.intentsApi);
//}