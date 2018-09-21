describe("System API", function () {

    var systemApi;
    var applicationNode;
    var userNode;
    var systemNode;
    var oldEndpoints;
    var applicationPacket = {
        'resource': "/application/abcApp",
        'contentType': "application/vnd.ozp-application-v1+json",
        'version': 1,
        'entity': {
            "name": "Blue Bouncing Ball",
            "description": "A blue bouncing ball",
            "type": "application",
            "state": "active",
            "uiHints": {
                "width": 400,
                "height": 400,
                "singleton": false
            },
            "tags": [
                "demo"
            ],
            "intents": [
                {
                    "type": "application/ozp-demo-ball+json",
                    "action": "view",
                    "icon": "http://" + window.location.hostname + ":15000/largeIcon.png",
                    "label": "Blue Ball"
                }
            ],
            "icons": {
                "small": "http://" + window.location.hostname + ":15000/largeIcon.png",
                "large": "http://" + window.location.hostname + ":15000/smallIcon.png"
            },
            "screenShots": [
                {
                    "href": "http://" + window.location.hostname + ":15000/screenShot.png",
                    "title": "A screenshot"
                }
            ],
            "launchUrls": {
                "default": "http://" + window.location.hostname + ":15000/?color=blue",
                "test": "http://test.localhost:15000/?color=blue"
            },
            "_links": {
                "self": {"href": "/api/application/v1/12345"},
                "describes": {"href": "http://" + window.location.hostname + ":15000/?color=blue"}
            }
        }
    };
    beforeEach(function () {
        oldEndpoints = ozpIwc.api.endpoint;
        ozpIwc.api.endpoint = function () {
            return {
                get: function () { return Promise.resolve(); }
            };
        };
        var fakeRouter = new FakeRouter();
        systemApi = new ozpIwc.api.system.Api({
            'name': "system.test.api",
            'authorization': ozpIwc.wiring.authorization,
            'participant': new TestClientParticipant({
                authorization: ozpIwc.wiring.authorization,
                router: fakeRouter
            }),
            'router': fakeRouter,
            'ajaxQueue': new ozpIwc.util.AjaxPersistenceQueue()
        });
        systemApi.isRequestQueueing = false;
        systemApi.leaderState = "leader";
        systemApi.participant.sentPackets = [];
        systemApi.createNode(applicationPacket);
    });

    afterEach(function () {
        systemApi = null;
        ozpIwc.api.endpoint = oldEndpoints;
        systemApi = null;
        applicationNode = null;
        userNode = null;
        systemNode = null;
    });

    it("does not allow set on /application/{id}", function () {
        var context = new TestPacketContext({
            'leaderState': "leader",
            'packet': {
                'resource': "/application/abcApp",
                'action': "set",
                'msgId': "1234",
                'src': "srcParticipant",
                entity: {
                    launchUrls: {
                        default: "http://bogus.com"
                    }
                }
            }
        });
        systemApi.receivePacketContext(context);
        expect(context.responses[0].response).toEqual("badAction");
    });

    it(" prevents user from deleting an application", function () {
        var context = new TestPacketContext({
            'leaderState': "leader",
            'packet': {
                'resource': "/application/abcApp",
                'action': "delete",
                'msgId': "1234",
                'src': "srcParticipant",
                entity: {
                    launchUrls: {
                        default: "http://bogus.com"
                    }
                }
            }
        });
        systemApi.receivePacketContext(context);
        expect(context.responses[0].response).toEqual("badAction");
    });

    it("gets an application", function () {
        var context = new TestPacketContext({
            'leaderState': "leader",
            'packet': {
                'resource': "/application/abcApp",
                'action': "get",
                'msgId': "1234",
                'src': "srcParticipant",
                entity: {
                    launchUrls: {
                        default: "http://bogus.com"
                    }
                }
            }
        });
        systemApi.receivePacketContext(context);
        var reply = context.responses[0];
        expect(reply.response).toEqual("ok");
        expect(reply.entity).toEqual(applicationPacket.entity);
    });

    it('handles launch actions', function () {
        var launchData = {
            'foo': 1
        };
        var packetContext = new TestPacketContext({
            'packet': {
                'resource': "/application/abcApp",
                'entity': launchData,
                action: 'launch'
            }
        });
        systemApi.receivePacketContext(packetContext);
        var reply = packetContext.responses[0];
        expect(reply.response).toEqual("ok");
        expect(systemApi.participant).toHaveSent({
            action: "invoke",
            dst: "intents.api",
            "entity": jasmine.objectContaining({
                "url": "http://localhost:15000/?color=blue",
                "applicationId": "/application/abcApp",
                "launchData": {
                    "foo": 1
                }
            })
        });
    });

    it('handles invoke actions by launching applications', function () {
        var packetContext = new TestPacketContext({
            'packet': {
                'resource': "/launchNewWindow",
                action: 'invoke',
                'entity': {
                    'foo': 1,
                    'inFlightIntent': {
                        'resource': '/intents/invocation/123',
                        'entity': {
                            'entity': {
                                'url': "http://localhost:15000/?color=blue",
                                "applicationId": "/application/abcApp",
                                "launchData": {
                                    "hi": "Hello World",
                                    "openInNewWindow": true
                                }
                            }
                        }
                    }

                }
            }
        });
        spyOn(ozpIwc.util, "openWindow");
        systemApi.receivePacketContext(packetContext);
        expect(packetContext).toHaveSent({
            "response": "ok"
        });

        expect(ozpIwc.util.openWindow.calls.mostRecent().args[0]).toEqual("http://" + window.location.hostname + ":15000/?color=blue");
        var params = ozpIwc.util.openWindow.calls.mostRecent().args[1];
        expect(params['ozpIwc.peer']).toEqual(ozpIwc.config._busRoot);
        expect(params['ozpIwc.inFlightIntent']).toEqual(packetContext.packet.entity.inFlightIntent.resource);
    });
});