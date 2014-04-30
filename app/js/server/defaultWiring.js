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
	sibilant.defaultLocalStorageLink=new sibilant.LocalStorageLink({
		peer: sibilant.defaultPeer
	});	
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
	sibilant.defaultRouter.registerMulticast(sibilant.keyValueApi,["keyValue.api"])
}