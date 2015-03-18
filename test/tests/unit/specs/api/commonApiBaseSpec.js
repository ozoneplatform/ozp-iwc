describe("Common API Base class",function() {

	var apiBase;
    var simpleNode;
    
	beforeEach(function() {	

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

    it("responds to a root level list action", function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'action': "list"
            }
        });
        
        // possibly brittle, if CommonApiBase changes how it stores the
        // keys and values
        
        apiBase.data["/node"]=simpleNode;
        
		apiBase.rootHandleList(null,packetContext);

		expect(packetContext.responses[0])
            .toEqual(jasmine.objectContaining({
                'response':"ok",
                'entity': ["/node"]
            }));
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
                'response':"ok",
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
                'response':"ok"
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
                'response':"ok"
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
                'response':"ok"
            }));

        expect(simpleNode.watchers.length).toEqual(0);
    });

    describe("Endpoint",function() {
		var apiBase;

		beforeEach(function() {

			apiBase = new ozpIwc.CommonApiBase({
				'participant': new TestParticipant()
			});
			apiBase.makeValue = function(packet) {
				return new ozpIwc.CommonApiValue({resource: packet.resource});
			};
		});

		afterEach(function() {
			apiBase = null;
		});
       
        it("initializes with both embedded and links",function(done) {
			var originalEndpoint = ozpIwc.endpoint;
			var originalEndpointGet = ozpIwc.Endpoint.prototype.get;
			
            ozpIwc.endpoint = function(name) {
				return new ozpIwc.Endpoint(name);
			};
			ozpIwc.Endpoint.prototype.get = function(resource) {
				return new Promise(function(resolve, reject) {
					resolve({
						header: {'Content-Type': "application/json"},
						response: {
							"_links": {
								"self": {"href": "/api/profile/v1/exampleUser/data"},
								"curies": [{
										"name": "ozp",
										"href": "/api/profile/v1/exampleUser/data/rels/{rel}",
										"templated": true
									}],
								"item": [
									{"href": "/api/profile/v1/exampleUser/data/bigData.json"},
									{"href": "/api/profile/v1/exampleUser/data/dashboards/12345"},
									{"href": "/api/profile/v1/exampleUser/data/dashboards/23456"},
									{"href": "/api/profile/v1/exampleUser/data/toolbars/12345"},
									{"href": "/api/profile/v1/exampleUser/data/toolbars/23456"}
								]
							},
							"_embedded": {
								"item": [
									{
										"_links": {
											"self": {"href": "/api/profile/v1/exampleUser/data/someResource"}
										},
										"contentType": "application/vnd.ozp-data-object-v1+json",
										"key": "someResource",
										"entity": {
											"entity": {
												"some": "data"
											}
										}
									},
									{
										"_links": {
											"self": {"href": "/api/profile/v1/exampleUser/data/pizza"}
										},
										"contentType": "application/vnd.ozp-data-object-v1+json",
										"key": "pizza",
										"entity": {
											"entity": "pepperoni"
										}
									},
									{
										"_links": {
											"self": {"href": "/api/profile/v1/exampleUser/data/theme"}
										},
										"contentType": "application/vnd.ozp-data-object-v1+json",
										"key": "theme",
										"entity": {
											"entity": "dark"
										}
									},
									{
										"_links": {
											"self": {"href": "/api/profile/v1/exampleUser/data/parent"}
										},
										"contentType": "application/vnd.ozp-data-object-v1+json",
										"key": "parent",
										"entity": {
											"children": ["/parent/1234", "/parent/5678"]
										}
									},
									{
										"_links": {
											"self": {"href": "/api/profile/v1/exampleUser/data/parent/1234"}
										},
										"contentType": "application/vnd.ozp-data-object-v1+json",
										"key": "parent/1234",
										"entity": {
											"entity": "I am child 1234 of parent."
										}
									},
									{
										"_links": {
											"self": {"href": "/api/profile/v1/exampleUser/data/parent/5678"}
										},
										"contentType": "application/vnd.ozp-data-object-v1+json",
										"key": "parent/5678",
										"entity": {
											"entity": "I am child 5678 of parent."
										}
									}
								]
							}
						}
					});

				});
			};
			
			var requestHandlers = "";
			
			spyOn(apiBase,"makeValue");
			spyOn(apiBase,"updateResourceFromServerIterative").and.callThrough();
			
			apiBase.loadFromEndpointIterative("fakeEndpoint", requestHandlers)
					.then (function() {
						// basic checks, should add detail value queries
						expect(apiBase.updateResourceFromServerIterative.calls.count()).toEqual(6);
						expect(apiBase.makeValue.calls.count()).toEqual(6);
						
						// reset and cleanup parts of the endpoint api we clobbered for this test
						ozpIwc.endpoint = originalEndpoint;
						ozpIwc.Endpoint.prototype.get = originalEndpointGet;
						done();
					});
        });
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
            apiBase.defaultHandler=jasmine.createSpy('defaultHandler');
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);
            expect(apiBase.defaultHandler).toHaveBeenCalled();
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
                'response': "ok",
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
                'response': "badAction"
            }));

        });
        
        it("returns a noPerm response if the action is not permitted",function() {
            apiBase.data['/node'].permissions.pushIfNotExist('ozp:iwc:haxed','totally');
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/node",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant",
                    'permissions': {
                        'ozp:iwc:haxed' : 'no'
                    }
                }
            });

            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'response': "noPerm"
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
                'response': "noMatch"
            }));
        });
        it("returns badResource if an invalid resource is used",function() {
            spyOn(apiBase,'validateResource').and.throwError(new ozpIwc.ApiError("noMatch","blah"));
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
                'response': "noMatch"
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
            expect(changePacket).toBeDefined();
            expect(changePacket.response).toEqual("changed");
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
        it("responds to a root level list action", function() {
            // possibly brittle, if CommonApiBase changes how it stores the
            // keys and values
            apiBase.data["/node"]=simpleNode;

            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'action': "list",
                    'msgId' : "1234",
                    'src' : "srcParticipant",
                    'entity': { 'bar': 2}
                }
            });

            apiBase.routePacket(context);

            expect(context.responses.length).toEqual(1);

            var packet=context.responses[0];
            expect(packet.response).toEqual("ok");
            expect(packet.entity).toEqual(["/node"]);
        });
    });
    describe("Collection values",function() {
        var collectionNode=new ozpIwc.CommonApiCollectionValue({
                resource: "/foo",
                pattern: /^\/foo\/.*$/
            });
        beforeEach(function() {
            apiBase.data["/foo/1"]=new ozpIwc.CommonApiValue({
                'resource': "/foo/1",
                'entity' : { 'foo':1 },
                'contentType' : "application/json",
                'version' : 1
            });
            apiBase.data["/foo/2"]=new ozpIwc.CommonApiValue({
                'resource': "/foo/2",
                'entity' : { 'foo':2 },
                'contentType' : "application/json",
                'version' : 1
            });
            apiBase.data["/foo/3"]=new ozpIwc.CommonApiValue({
                'resource': "/foo/3",
                'entity' : { 'foo':3 },
                'contentType' : "application/json",
                'version' : 1
            });
            apiBase.addDynamicNode(collectionNode);
        });
    
        it("get on collection nodes list their contents",function() {
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/foo",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });

            apiBase.routePacket(context);

            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'response': "ok",
                'resource': "/foo",
                'entity': ["/foo/1","/foo/2","/foo/3"]
            }));
        });
       
        it("set on collection nodes update their contents",function() {

            apiBase.routePacket(new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/foo/4",
                    'action': "set",
                    'msgId' : "1234",
                    'src' : "srcParticipant",
                    'entity': {'foo': 4}
                }
            }));
            var context=new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/foo",
                    'action': "get",
                    'msgId' : "1234",
                    'src' : "srcParticipant"
                }
            });
            apiBase.routePacket(context);
            expect(context.responses[0]).toEqual(jasmine.objectContaining({
                'dst': "srcParticipant",
                'response': "ok",
                'entity': ["/foo/1","/foo/2","/foo/3","/foo/4"]
            }));

        });     
        
        it("notifies watchers if the collection node changed",function() {
            collectionNode.watch({'src': "watcher",'msgId': 5678});
            apiBase.routePacket(new TestPacketContext({
                'leaderState': "leader",
                'packet': {
                    'resource': "/foo/4",
                    'action': "set",
                    'msgId' : "1234",
                    'src' : "srcParticipant",
                    'entity': {'foo': 4}
                }
            }));

            expect(apiBase.participant.sentPackets.length).toEqual(1);
            var changePacket=apiBase.participant.sentPackets[0];
            expect(changePacket.response).toEqual("changed");
            expect(changePacket.entity.newValue).toEqual([ "/foo/1", "/foo/2", "/foo/3", "/foo/4" ]);
            expect(changePacket.entity.oldValue).toEqual([ "/foo/1", "/foo/2", "/foo/3"]);
        });
        
    });

});