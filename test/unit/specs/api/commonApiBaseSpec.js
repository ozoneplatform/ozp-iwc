describe("Common API Base class",function() {

	var apiBase;
	var packets=[];
    var simpleNode;
    
	beforeEach(function() {	
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
            'contentType' : "application/json",
            'version' : 1
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
        beforeEach(function() {
            apiBase.data['/node']=simpleNode;
        });
        
        it("routes packets to invokeHandler based upon the action",function() {
            spyOn(apiBase,"handleGet");
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(apiBase.handleGet).toHaveBeenCalled();
        });

        it("routes packets without an action to the rootHandleAction",function() {
            apiBase.rootHandleGet=jasmine.createSpy('rootHandleGet');
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(apiBase.rootHandleGet).toHaveBeenCalled();
        });
        
        it("finds the right node to send to invokeHandler",function() {
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'resource': "/node",
                'action': "ok",
                'replyTo' : "1234",
                'entity' : { 'foo':1}
            }));
        });
        

        
        it("returns a badAction packet for unsupported actions",function() {
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "OMG NO SUCH ACTION",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'action': "badAction"
            }));
            
        });
        
        it("returns a noPerm response if the action is not permitted",function() {
            apiBase.data['/node'].permissions=['haxed'];
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'action': "noPerm"
            }));
        });
        it("returns noMatch response if the validatePreconditions returns false",function() {
           var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'ifTag': 1234,
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'action': "noMatch"
            }));
        });
        it("returns badResource if an invalid resource is used",function() {
            spyOn(apiBase,'validatePreconditions').and.returnValue(false);
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'action': "noMatch"
            }));
        });

        it("notifies watchers if the node changed",function() {
            simpleNode.watch({'src': "watcher",'msgId': 5678});
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "set",
                    'msgId' : "1234",
                    'src' : "srcParticipant",
                    'entity': { 'bar': 2}
                }
            });

            apiBase.routePacket(context);            
            
            expect(apiBase.participant.sentPackets.length).toEqual(1);
            var changePacket=apiBase.participant.sentPackets[0];
            expect(changePacket.action).toEqual("changed");
            expect(changePacket.entity.newValue).toEqual({'bar':2});
            expect(changePacket.entity.oldValue).toEqual({'foo':1});
        });
        it("does not notify watchers on a get",function() {
                        simpleNode.watch({'src': "watcher",'msgId': 5678});
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);            
            
            expect(apiBase.participant.sentPackets.length).toEqual(0);
            expect(apiBase.participant.sentPackets[0]).toBeUndefined();
        });
    });



});