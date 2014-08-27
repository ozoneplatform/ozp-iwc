describe("Intent API Class", function () {

    var apiBase;
    var oldEndpoints;
    beforeEach(function () {
        oldEndpoints=ozpIwc.endpoint;
        ozpIwc.endpoint=function() {
            return {
                get: function() { return Promise.resolve(); }
            };            
        };
        apiBase = new ozpIwc.IntentsApi({
            'participant': new TestParticipant()
        });
    });

    afterEach(function () {
        ozpIwc.endpoint=oldEndpoints;
        apiBase = null;
    });
    
    it("Sets data types",function() {
        var testPacket=new TestPacketContext({
            'packet': {
                'resource': "/text/plain",
                'action': "set",
                'contentType' : "application/ozpIwc-intents-contentType-v1+json",
                'entity': {
                    'bar':2
                }
            },
            'leaderState': "leader"
        });
        apiBase.routePacket(testPacket);
        expect(testPacket.responses[0].response).toEqual("ok");
    });
    
    it("Sets intent definitions",function() {
        var testPacket=new TestPacketContext({
            'packet': {
                'resource': "/text/plain/view",
                'action': "set",
                'contentType' : "application/ozpIwc-intents-definition-v1+json",
                'entity': {
                    'bar':2
                }
            },
            'leaderState': "leader"
        });
        apiBase.routePacket(testPacket);
        expect(testPacket.responses[0].response).toEqual("ok");
    });

    it("Creating an intent definitions shows up in the content type",function() {
        apiBase.routePacket(new TestPacketContext({
            'packet': {
                'resource': "/text/plain/view",
                'action': "set",
                'contentType' : "application/ozpIwc-intents-definition-v1+json",
                'entity': {
                    'bar':2
                }
            },
            'leaderState': "leader"
        }));
        var testPacket=new TestPacketContext({
            'packet': {
                'resource': "/text/plain",
                'action': "get"
            },
            'leaderState': "leader"
        });
        apiBase.routePacket(testPacket);
        expect(testPacket.responses[0].response).toEqual("ok");
        expect(testPacket.responses[0].entity.actions).toContain("/text/plain/view");
    });
    
    it("Registers handlers",function() {
        var testPacket=new TestPacketContext({
            'packet': {
                'resource': "/text/plain/view",
                'action': "register",
                'contentType' : "application/ozpIwc-intents-handler-v1+json",
                'entity': {
                    'bar':2
                }
            },
            'leaderState': "leader"
        });
        apiBase.routePacket(testPacket);
        expect(testPacket.responses[0].response).toEqual("ok");
        expect(testPacket.responses[0].entity.resource).toMatch(/text\/plain\/view\/.*/);
    });
    
    describe("Invoking handlers",function() {
        var handlerResource;
        beforeEach(function() {
            var registerPacket=new TestPacketContext({
                'packet': {
                    'resource': "/text/plain/view",
                    'action': "register",
                    'contentType' : "application/ozpIwc-intents-handler-v1+json",
                    'entity': {
                        'type': "text/plain",
                        'action' : "view",
                        'invokeIntent': {
                            dst: "system.api",
                            resource: "/intentHandler",
                            action: "view"
                        }
                    }
                },
                'leaderState': "leader"
            });

            apiBase.routePacket(registerPacket);
            handlerResource=registerPacket.responses[0].entity.resource;
            expect(handlerResource).toBeDefined();
        });
        it("Invokes handlers directly",function() {
            var testPacket=new TestPacketContext({
                'packet': {
                    'resource': handlerResource,
                    'action': "invoke",
                    'contentType' : "text/plain",
                    'entity': "Some Text"
                },
                'leaderState': "leader"
            });
            apiBase.routePacket(testPacket);

            expect(apiBase.participant.sentPackets[0].action).toEqual("view");
            expect(apiBase.participant.sentPackets[0].resource).toEqual("/intentHandler");
            expect(apiBase.participant.sentPackets[0].contentType).toEqual("text/plain");
            expect(apiBase.participant.sentPackets[0].entity).toEqual("Some Text");
        });
        it("Handler's return value is forwarded to the invoker",function() {

            var testPacket=new TestPacketContext({
                'packet': {
                    'resource': handlerResource,
                    'action': "invoke",
                    'contentType' : "text/plain",
                    'entity': "Some Text"
                },
                'leaderState': "leader"
            });
            apiBase.routePacket(testPacket);

            var invokePacket=apiBase.participant.sentPackets[0];
            
            apiBase.participant.receiveFromRouter(new TestPacketContext({
                'packet': {
                    'src': "fakeHandler",
                    'response': "ok",
                    'replyTo': invokePacket.msgId,
                    'contentType' : "text/winnar",
                    'entity': "You won!"
                },
                'leaderState': "leader"
            }));
            
            var fowardedPacket=testPacket.responses[0];
            expect(fowardedPacket.contentType).toEqual("text/winnar");
            expect(fowardedPacket.entity).toEqual("You won!");

        });
    });
});