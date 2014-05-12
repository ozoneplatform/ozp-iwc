var sibilant=sibilant || {};

if(sibilant.Peer) {
	sibilant.defaultPeer=new sibilant.Peer();
}

if(sibilant.Router) {
	sibilant.defaultRouter=new sibilant.Router({
			peer:sibilant.defaultPeer
		});
}

if(sibilant.LocalStorageLink) {
	sibilant.defaultLocalStorageLink=new sibilant.KeyBroadcastLocalStorageLink({
		peer: sibilant.defaultPeer
	});
//	sibilant.defaultLocalStorageLink=new sibilant.LocalStorageLink({
//		peer: sibilant.defaultPeer
//	});	
}

if(sibilant.PostMessageParticipantListener) {
	sibilant.defaultPostMessageParticipantListener=new sibilant.PostMessageParticipantListener({
		router: sibilant.defaultRouter
	});
}

if(sibilant.BasicAuthorization) {
	sibilant.authorization=new sibilant.BasicAuthorization();
}

if(sibilant.KeyValueApi) {
	sibilant.keyValueApi=new sibilant.LeaderGroupParticipant({
		name: "keyValue.api",
		target: new sibilant.KeyValueApi()
	});

	sibilant.defaultRouter.registerParticipant(sibilant.keyValueApi);
}
//
//if(sibilant.NamesApi) {
//	sibilant.namesApi=new sibilant.LeaderGroupParticipant({
//		name: "names.api",
//		target: new sibilant.NamesApi()
//	});
//	sibilant.defaultRouter.registerParticipant(sibilant.namesApi);
//}
//
//if(sibilant.IntentsApi) {
//	sibilant.intentsApi=new sibilant.LeaderGroupParticipant({
//		name: "intents.api",
//		target: new sibilant.IntentsApi()
//	});
//	sibilant.defaultRouter.registerParticipant(sibilant.intentsApi);
//}