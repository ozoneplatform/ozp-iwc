var ozpIwc=ozpIwc || {};

if(ozpIwc.Peer) {
    ozpIwc.defaultPeer=new ozpIwc.Peer();
}

if(ozpIwc.Router) {
    console.log("defined namesApi")
    ozpIwc.namesApi=new ozpIwc.NamesApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "names.api"})
    });
    ozpIwc.defaultRouter=new ozpIwc.Router({
        peer:ozpIwc.defaultPeer
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.namesApi.participant);
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
}

if(ozpIwc.BasicAuthorization) {
    ozpIwc.authorization=new ozpIwc.BasicAuthorization();
}

if(ozpIwc.DataApi && ozpIwc.LeaderGroupParticipant) {
    ozpIwc.dataApi=new ozpIwc.DataApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "data.api"})
    });

    ozpIwc.defaultRouter.registerParticipant(ozpIwc.dataApi.participant);
}

if(ozpIwc.IntentsApi) {
    ozpIwc.intentsApi = new ozpIwc.IntentsApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "intents.api"})
    });

    ozpIwc.defaultRouter.registerParticipant(ozpIwc.intentsApi.participant);
}
if(ozpIwc.NamesApi && ozpIwc.LeaderGroupParticipant) {
    ozpIwc.namesApi=new ozpIwc.NamesApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "names.api"})
    });

    ozpIwc.defaultRouter.registerParticipant(ozpIwc.namesApi.participant);
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