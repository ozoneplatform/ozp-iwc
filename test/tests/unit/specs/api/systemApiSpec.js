describe("System API",function() {

    var systemApi;
    var applicationNode;
    var userNode;
    var systemNode;
    beforeEach(function() {
        systemApi=new ozpIwc.SystemApi({
            'participant': new TestParticipant()
        });

        applicationNode=systemApi.findOrMakeValue({
            'resource': "/application/abcApp",
            'contentType' : "ozp-application-definition-v1+json",
            'version' : 1
        });

        userNode=systemApi.findOrMakeValue({
            'resource': "/user",
            'contentType' : "ozp-user-definition-v1+json",
            'version' : 1
        });

        systemNode=systemApi.findOrMakeValue({
            'resource': "/system",
            'contentType' : "ozp-system-definition-v1+json",
            'version' : 1
        });
    });

    afterEach(function() {
        systemApi=null;
        applicationNode=null;
        userNode=null;
        systemNode=null;
    });
    
//    it("sets an application",function() {
//        var packetContext=new TestPacketContext({
//            'packet': {
//                'entity' : {
//                    screenShots: {
//                        overview: {
//                            url: "https://mail.example.com/screenshot1.png",
//                            title: "This shows the basic user interface"
//                        }
//                    },
//                    links: {
//                        self: "names.api/application/12341-123-abba-123",
//                        launch: {
//                            default: "https://mail.example.com",
//                            development: "https://dev.mail.example.com",
//                            test: "https://test.mail.example.com"
//                        },
//                        userDocs: "https://mail.example.com/help.html",
//                        integrationDocs:  "https://mail.example.com/integration.html",
//                        onlineHelp:  "https://mail.example.com/liveChat.html",
//                    },
//                    intents: {
//                    }
//                },
//                'contentType' : "ozp-application-definition-v1+json",
//                'version' : 1
//            },
//            action: 'set',
//            srcSubject: {'modifyAuthority': 'apiLoader'}//required permission for set action on system.api
//        });
//
//        systemApi.handleSet(applicationNode,packetContext);
//
//        var reply=packetContext.responses[0];
//        expect(reply.response).toEqual("ok");
//
//        // check that the participant info was added.
//        expect(systemApi.data[applicationNode.resource].entity).toEqual(packetContext.packet.entity);
//
//        var applicationListNode=systemApi.findOrMakeValue({
//            'resource': "/application",
//            'contentType' : "ozp-application-list-v1+json",
//            'version' : 1
//        });
//
//        packetContext=new TestPacketContext({
//            'packet': {
//                'contentType' : "ozp-application-list-v1+json",
//                'version' : 1
//            }
//        });
//
//        systemApi.handleGet(applicationListNode,packetContext);
//        expect(systemApi.data[applicationListNode.resource].entity).toEqual(['abcApp']);
//    });
//
//    it("generates changes for added application",function() {
//
//        applicationNode=systemApi.findOrMakeValue({
//            'resource': "/application/abcApplication",
//            'contentType' : "ozp-application-definition-v1+json",
//            'version' : 2
//        });
//        applicationNode.watch({'src': "watcher",'msgId': 1234});
//        var packetContext=new TestPacketContext({
//            'packet': {
//                'resource': "/application/abcApplication",
//                'action': "set",
//                'entity' : {
//                    screenShots: {
//                        overview: {
//                            url: "https://mail.example.com/screenshot2.png", //change here
//                            title: "This shows the basic user interface"
//                        }
//                    },
//                    links: {
//                        self: "names.api/application/12341-123-abba-123",
//                        launch: {
//                            default: "https://mail.example.com",
//                            development: "https://dev.mail.example.com",
//                            test: "https://test.mail.example.com"
//                        },
//                        userDocs: "https://mail.example.com/help.html",
//                        integrationDocs: "https://mail.example.com/integration.html",
//                        onlineHelp: "https://mail.example.com/liveChat.html",
//                    },
//                    intents: {
//                    }
//                },
//                'contentType': "ozp-application-definition-v1+json"
//            },
//            'leaderState': "leader",
//            action: 'set',
//            srcSubject: {'modifyAuthority': 'apiLoader'}//required permission for set action on system.api
//        });
//        systemApi.routePacket(packetContext);
//
//        expect(systemApi.participant.sentPackets.length).toEqual(1);
//        var changePacket=systemApi.participant.sentPackets[0];
//        expect(changePacket.response).toEqual("changed");
//        expect(changePacket.entity.newValue).toEqual(packetContext.packet.entity);
//    });
//
//    it("deletes resource /application/${id} and removes the corresponding entry from resource /application",function() {
//
//        var packetContext=new TestPacketContext({
//            'packet': {
//                'entity' : {
//                    screenShots: {
//                        overview: {
//                            url: "https://mail.example.com/screenshot1.png",
//                            title: "This shows the basic user interface"
//                        }
//                    },
//                    links: {
//                        self: "names.api/application/12341-123-abba-123",
//                        launch: {
//                            default: "https://mail.example.com",
//                            development: "https://dev.mail.example.com",
//                            test: "https://test.mail.example.com"
//                        },
//                        userDocs: "https://mail.example.com/help.html",
//                        integrationDocs:  "https://mail.example.com/integration.html",
//                        onlineHelp:  "https://mail.example.com/liveChat.html",
//                    },
//                    intents: {
//                    }
//                },
//                'contentType' : "ozp-application-definition-v1+json",
//                'version' : 1,
//                srcSubject: {'modifyAuthority': 'apiLoader'}//required permission for set action on system.api
//            }
//        });
//
//        systemApi.handleSet(applicationNode,packetContext);
//        expect(systemApi.data['/application'].entity.length).toEqual(1);
//        systemApi.handleDelete(applicationNode,packetContext);
//        expect(systemApi.data['/application'].entity.length).toEqual(0);
//        expect(systemApi.data[applicationNode.resource].entity).toBeUndefined();
//    });
//
//    it("sets the same /application/${id} resource twice and ensures there is only one entry for it in resource /application",function() {
//
//        var packetContext=new TestPacketContext({
//            'packet': {
//                'entity' : {
//                    screenShots: {
//                        overview: {
//                            url: "https://mail.example.com/screenshot1.png",
//                            title: "This shows the basic user interface"
//                        }
//                    },
//                    links: {
//                        self: "names.api/application/12341-123-abba-123",
//                        launch: {
//                            default: "https://mail.example.com",
//                            development: "https://dev.mail.example.com",
//                            test: "https://test.mail.example.com"
//                        },
//                        userDocs: "https://mail.example.com/help.html",
//                        integrationDocs:  "https://mail.example.com/integration.html",
//                        onlineHelp:  "https://mail.example.com/liveChat.html",
//                    },
//                    intents: {
//                    }
//                },
//                'contentType' : "ozp-application-definition-v1+json",
//                'version' : 1
//            }
//        });
//
//        systemApi.handleSet(applicationNode,packetContext);
//        systemApi.handleSet(applicationNode,packetContext);
//        expect(systemApi.data['/application'].entity.length).toEqual(1);
//    });

});