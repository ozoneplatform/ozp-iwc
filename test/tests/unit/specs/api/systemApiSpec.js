describe("System API",function() {

    var systemApi;
    var applicationNode;
    var userNode;
    var systemNode;
    var oldEndpoints;
    beforeEach(function() {
        oldEndpoints=ozpIwc.endpoint;
        ozpIwc.endpoint=function() {
            return {
                get: function() { return Promise.resolve(); }
            };            
        };
        systemApi=new ozpIwc.SystemApi({
            'participant': new TestParticipant()
        });

        systemApi.data["/application/abcApp"]=applicationNode=systemApi.findOrMakeValue({
            'resource': "/application/abcApp",
            'contentType' : "ozpIwc-application-definition-v1+json",
            'version' : 1,
            'entity' : {
                "name" : "Blue Bouncing Ball",
                "description" : "A blue bouncing ball",
                "type" : "application",
                "state" : "active",
                "uiHints": {
                    "width" : 400,
                    "height" : 400,
                    "singleton" : false
                },
                "tags": [
                    "demo"
                ],
                "intents": [
                    {
                        "type": "application/ozp-demo-ball+json",
                        "action": "view",
                        "icon": "http://localhost:15000/largeIcon.png",
                        "label": "Blue Ball"
                    }
                ],
                "icons" : {
                    "small": "http://localhost:15000/largeIcon.png",
                    "large": "http://localhost:15000/smallIcon.png"
                },
                "screenShots" : [
                    {
                        "href" : "http://localhost:15000/screenShot.png",
                        "title" : "A screenshot"
                    }
                ],
                "launchUrls" : {
                    "default": "http://localhost:15000/?color=blue",
                    "test" : "http://test.localhost:15000/?color=blue"
                },
                "_links": {
                    "self" : { "href": "/api/application/v1/12345"},
                    "describes" : { "href": "http://localhost:15000/?color=blue"}
                }
            }
        });

    });

    afterEach(function() {
        ozpIwc.endpoint=oldEndpoints;
        systemApi=null;
        applicationNode=null;
        userNode=null;
        systemNode=null;
    });
    
    it("launches an application",function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {
                    'foo': 1
                }
            },
            action: 'launch'
        });
        spyOn(window,"open");
        
        systemApi.handleLaunch(applicationNode,packetContext);
        expect(window.open.calls.mostRecent().args[0]).toEqual("http://localhost:15000/?color=blue");
        expect(window.open.calls.mostRecent().args[1]).toMatch(/ozpIwc.mailbox=(%2[fF]mailbox%2[fF]([a-z0-9]+))/);
        var mailboxPath=decodeURIComponent(
            /ozpIwc.mailbox=(%2[fF]mailbox%2[fF]([a-z0-9]+))/.exec(
                window.open.calls.mostRecent().args[1]
            )[1]
        );
        
        var mailbox=systemApi.data[mailboxPath];
        expect(mailbox).toBeDefined();
        expect(mailbox.entity).toEqual({'foo':1});
        
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
//                'contentType' : "ozpIwc-application-definition-v1+json",
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
//            'contentType' : "ozpIwc-application-list-v1+json",
//            'version' : 1
//        });
//
//        packetContext=new TestPacketContext({
//            'packet': {
//                'contentType' : "ozpIwc-application-list-v1+json",
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
//            'contentType' : "ozpIwc-application-definition-v1+json",
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
//                'contentType': "ozpIwc-application-definition-v1+json"
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
//                'contentType' : "ozpIwc-application-definition-v1+json",
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
//                'contentType' : "ozpIwc-application-definition-v1+json",
//                'version' : 1
//            }
//        });
//
//        systemApi.handleSet(applicationNode,packetContext);
//        systemApi.handleSet(applicationNode,packetContext);
//        expect(systemApi.data['/application'].entity.length).toEqual(1);
//    });

});