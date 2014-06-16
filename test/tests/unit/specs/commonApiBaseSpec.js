describe("Common API Base class",function() {

	var apiBase;
	var packets=[];
    var simpleNode;
    
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();
		packets=[];
		
		apiBase=new ozpIwc.CommonApiBase({
			'participant': new TestParticipant()
		});
		apiBase.makeValue=function(packet) {
			return new ozpIwc.CommonApiValue({resource: packet.resource});
		};
        simpleNode=new ozpIwc.CommonApiValue({
            'resource': "/node",
            'entity' : { 'foo':1 },
            'contentType' : "application/json"
        });
        
	});
	
	afterEach(function() {
		apiBase=null;
	});
	
	it("responds to a get", function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'resource': "/node",
                'action': "get"
            }
        });
        
		apiBase.handleGet(simpleNode,packetContext);

		expect(packetContext.responses[0])
            .toEqual(jasmine.objectContaining({
                'action':"ok",
                'entity': { 'foo' : 1 }
            }));
	});

	it("sets data", function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'resource': "/node",
                'action': "set",
                'entity': {
                    'bar':2
                },
                'contentType': "application/fake+json"
            }
        });
		
        apiBase.handleSet(simpleNode,packetContext);

		expect(packetContext.responses[0])
            .toEqual(jasmine.objectContaining({
                'action':"ok"
            }));
        expect(simpleNode.entity).toEqual({'bar':2});
        expect(simpleNode.contentType).toEqual("application/fake+json");
	});

	it("deletes data", function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'resource': "/node",
                'action': "set"
            }
        });
		apiBase.handleDelete(simpleNode,packetContext);

        expect(simpleNode.entity).toBeUndefined();
        expect(simpleNode.contentType).toBeUndefined();
        expect(simpleNode.version).toEqual(0);
	});

    it("a watch applies to a node",function() {
        var watchPacketContext=new TestPacketContext({
            'packet': {
                'resource': "/node",
                'action': "watch",
                'msgId' : "1234",
                'src' : "srcParticipant"
            }
        });

        apiBase.handleWatch(simpleNode,watchPacketContext);

        expect(watchPacketContext.responses[0])
            .toEqual(jasmine.objectContaining({
                'action':"ok"
            }));
        expect(simpleNode.watchers[0])
            .toEqual(jasmine.objectContaining({
                'msgId':"1234",
                'src': "srcParticipant"
            }));
    });

    it("can unregister a watch",function() {
        var watchPacketContext=new TestPacketContext({
            'packet': {
                'resource': "/node",
                'action': "watch",
                'msgId' : "1234",
                'src' : "srcParticipant"
            }
        });

        apiBase.handleWatch(simpleNode,watchPacketContext);
        expect(simpleNode.watchers[0])
            .toEqual(jasmine.objectContaining({
                'msgId':"1234",
                'src': "srcParticipant"
            }));
        var unWatchPacketContext=new TestPacketContext({
            'packet': {
                'resource': "/node",
                'action': "unWatch",
                'replyTo' : "1234",
                'src' : "srcParticipant"
            }
        });
        apiBase.handleUnwatch(simpleNode,unWatchPacketContext);

        expect(unWatchPacketContext.responses[0])
            .toEqual(jasmine.objectContaining({
                'action':"ok"
            }));

        expect(simpleNode.watchers.length).toEqual(0);
    });
    describe("CommonAPI Packet Routing",function() {
        it("routes packets to invokeHandler based upon the action");
        it("finds the right node to send to invokeHandler");
        it("returns a badAction packet for unsupported actions");
    });

    describe("Handler invocation",function() {
        it("returns a noPerm response if the action is not permitted");
        it("returns noMatch response if the validatePreconditions returns false");
        it("returns badResource if an invalid resource is used");
        it("invokes the proper handler");
        it("notifies watchers if the node changed");
        it("does not notify watchers if the node is unchanged");
        
    });


});