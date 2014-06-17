var ozpIwc=ozpIwc || {};

if(ozpIwc.Peer) {
	ozpIwc.defaultPeer=new ozpIwc.Peer();
}

ozpIwc.TestParticipant=ozpIwc.util.extend(ozpIwc.InternalParticipant,function(config) {
    ozpIwc.InternalParticipant.apply(this,arguments);
    this.participantType="testParticipant";
});

ozpIwc.TestParticipant.prototype.receiveFromRouter=function(packetContext) {
    var packet=packetContext.packet;
    var msg={maxSeqIdPerSource: ozpIwc.Peer.maxSeqIdPerSource,
             packetsSeen: this.router.peer.packetsSeen,
             type: "client.test.response"};
    parent.postMessage(msg, "http://localhost:14000");
};

if(ozpIwc.Router) {
	ozpIwc.defaultRouter=new ozpIwc.Router({
			peer:ozpIwc.defaultPeer
		});
    if (ozpIwc.Participant) {
        ozpIwc.testParticipant = new ozpIwc.TestParticipant({name: "Test Participant"});
        ozpIwc.defaultRouter.registerParticipant(ozpIwc.testParticipant);
        console.log("created test participant with address: " + ozpIwc.testParticipant.address);
    }
}

if(ozpIwc.LocalStorageLink) {
	ozpIwc.defaultLocalStorageLink=new ozpIwc.KeyBroadcastLocalStorageLink({
		peer: ozpIwc.defaultPeer
	});
}

if(ozpIwc.PostMessageParticipantListener) {
	ozpIwc.defaultPostMessageParticipantListener=new ozpIwc.PostMessageParticipantListener( {
		router: ozpIwc.defaultRouter
	});
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