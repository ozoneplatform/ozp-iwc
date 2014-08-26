describe("Intent API Class", function () {

    var apiBase;

    beforeEach(function () {
        apiBase = new ozpIwc.IntentsApi({
            'participant': new TestParticipant()
        });
    });

    afterEach(function () {
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

});