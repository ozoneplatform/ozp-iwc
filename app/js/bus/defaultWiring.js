var ozpIwc=ozpIwc || {};

ozpIwc.apiRoot = {
    "_links": {
        "self": { "href" : "/api" },
        "data": { "href":"/api/data/v1/exampleUser"},
        "intents": { "href":"/api/intents/v1"},
        "applications": { "href":"/api/application/v1"},
        "user": { "href":"/api/user/v1/exampleUser"},
        "system": { "href":"/api/system/v1"}
    },
    "_embedded": {
        "user": {
            "name": "Jon Doe",
            "userName": "jon.doe",
            "_links" : {
                "self": { "href":"/api/user/v1/exampleUser"}
            }
        },
        "system": {
            "version": "1.0",
            "name": "IWC Demo site",
            "_links" : {
                "self": { "href":"/api/system/v1"}
            }
        }
    }
};

if(ozpIwc.Peer) {
    ozpIwc.defaultPeer=new ozpIwc.Peer();
}

if(ozpIwc.Router) {
    ozpIwc.namesApi=new ozpIwc.NamesApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "names.api"})
    });
    ozpIwc.defaultRouter=new ozpIwc.Router({
        peer:ozpIwc.defaultPeer
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.namesApi.participant);
}



if(ozpIwc.KeyBroadcastLocalStorageLink) {
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
        'participant': new ozpIwc.LeaderGroupParticipant({
            'name': "data.api"
        }),
        'href': ozpIwc.apiRoot._links.data.href,
        'loadServerDataEmbedded': true
    });

    ozpIwc.defaultRouter.registerParticipant(ozpIwc.dataApi.participant);
}

if(ozpIwc.IntentsApi) {
    ozpIwc.intentsApi=new ozpIwc.IntentsApi({
        'participant': new ozpIwc.LeaderGroupParticipant({
            'name': "intents.api"
        }),
        'href': ozpIwc.apiRoot._links.intents.href,
        'loadServerDataEmbedded': true
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.intentsApi.participant);
}
if(ozpIwc.SystemApi && ozpIwc.LeaderGroupParticipant) {
    ozpIwc.systemApi=new ozpIwc.SystemApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "system.api"}),
        'userHref': ozpIwc.apiRoot._links.user.href,
        'systemHref': ozpIwc.apiRoot._links.system.href,
        'securityAttributes': {'modifyAuthority': 'apiLoader'}
    });

    ozpIwc.defaultRouter.registerParticipant(ozpIwc.systemApi.participant);
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