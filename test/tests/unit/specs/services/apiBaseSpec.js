var TestApi=ozpIwc.api.createApi("testApi.api",function() {});
TestApi.useDefaultRoute(ozpIwc.api.base.Api.allActions);

function createApiRequestObject(fakeRouter) {
    fakeRouter=fakeRouter || new FakeRouter();
	var apiBase=new TestApi({
        authorization: ozpIwc.wiring.authorization,
        'participant': new TestClientParticipant({
            authorization: ozpIwc.wiring.authorization,
            router: fakeRouter
        }),
        'router': fakeRouter
    });
    apiBase.data["/foo"]=new ozpIwc.api.base.Node({
        resource: "/foo",
        self: "https://example.com/iwc/foo",
        contentType: "text/plain",
        entity: "hello world"
    });
    apiBase.data["/foo/1"]=new ozpIwc.api.base.Node({
        resource: "/foo/1",
        self: "https://example.com/iwc/foo/1",
        contentType: "text/plain",
        entity: "resource 1"
    });
    apiBase.data["/foo/2"]=new ozpIwc.api.base.Node({
        resource: "/foo/2",
        self: "https://example.com/iwc/foo/2",
        contentType: "text/plain",
        entity: "resource 2"
    });
    return apiBase;
}

describe("Base Api request handling",function() {
	var apiBase;
	beforeEach(function() {
        apiBase=createApiRequestObject();
        apiBase.isRequestQueueing=false;
        apiBase.leaderState = "leader";
	});
    
    var testPacket=function(packet) {
        packet.src=packet.src || "unitTest";
        packet.msgId=packet.msgId || "i:1";
        packet.resource=packet.resource || "/foo";
        return new TestPacketContext({
            'leaderState': "leader",
            'packet': packet
        });
    };

//=====================================================================
// Basic Actions: Get
//=====================================================================
    describe("action get",function() {
        pit("returns a valid resource",function() {
            var context=testPacket({action:"get",resource:"/foo"});
            console.log(apiBase);
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0].contentType).toEqual("text/plain");
                expect(context.responses[0].entity).toEqual("hello world");
            });
        });

        pit("returns noResource for non-existent resource",function() {
            var context=testPacket({action:"get",resource:"/does-not-exist"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("noResource");
                expect(context.responses[0].entity).toBeDefined();
            });
        });
    });
    

//=====================================================================
// Basic Actions: List
//=====================================================================

    describe("action list",function() {
        pit("returns an array of matching resources",function() {
            var context=testPacket({action:"list",resource:"/foo/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0]).toEqual(jasmine.objectContaining({
                    contentType: "application/json",
                    entity: ["/foo/1","/foo/2"]
                }));
            });
        });
        pit("returns an empty list if nothing matches",function() {
            var context=testPacket({action:"list",resource:"/does-not-exist/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0]).toEqual(jasmine.objectContaining({
                    contentType: "application/json",
                    entity: []
                }));
            });
        });
    });
//=====================================================================
// Basic Actions: bulkGet
//=====================================================================

    describe("action bulkGet",function() {
        pit("returns an array of matching resources",function() {
            var context=testPacket({action:"bulkGet",resource:"/foo/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0].entity[0]).toEqual(jasmine.objectContaining({
                    contentType: "text/plain",
                    entity: "resource 1"
                }));
                expect(context.responses[0].entity[1]).toEqual(jasmine.objectContaining({
                    contentType: "text/plain",
                    entity: "resource 2"
                }));
            });
        });
        pit("returns an empty list if nothing matches",function() {
            var context=testPacket({action:"bulkGet",resource:"/does-not-exist/"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(context.responses[0].entity).toEqual([]);
            });
        });

    
    });
    
//=====================================================================
// Basic Actions: set
//=====================================================================
    describe("action set",function() {
        pit("modifies an existant resource",function() {
            var context=testPacket({
                    'resource': "/foo",
                    'action': "set",
                    'entity': { foo:1}
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/foo"].entity).toEqual({foo:1});
                
            });
        });

        pit("creates a non-existent resource",function() {
            var context=testPacket({
                    'resource': "/does-not-exist",
                    'action': "set",
                    'entity': { foo:1}
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/does-not-exist"].entity).toEqual({foo:1});
                
            });
        });
        pit("returns noMatch for a bad version pre-condition",function() {
            var context=testPacket({
                    'resource': "/foo",
                    'action': "set",
                    'ifTag': 20,
                    'entity': { foo:1}
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("noMatch");
                expect(context.responses[0].entity.expectedVersion).toEqual(20);
                expect(context.responses[0].entity.actualVersion).toEqual(1);
            });
        });
    });
//=====================================================================
// Basic Actions: bulkSend
//=====================================================================
    describe("action bulkSend",function() {

        pit("returns ok when receiving a formatted bulkSend",function(){
            var context = [];
            context.push(testPacket({
                'resource': "/foo",
                'action': "set",
                'entity': { foo:1}
            }));
            context.push(testPacket({
                'resource': "/foo1",
                'action': "set",
                'entity': { foo:2}
            }));
            var bulkSendPacket = testPacket({
                'action': "bulkSend",
                'entity': context
            });
            return apiBase.receivePacketContext(bulkSendPacket).then(function() {
                expect(bulkSendPacket.responses.length).toEqual(1);
                expect(bulkSendPacket.responses[0].response).toEqual("ok");
                expect(apiBase.data["/foo"].entity).toEqual({foo:1});
                expect(apiBase.data["/foo1"].entity).toEqual({foo:2});

            });
        });

        pit("returns ok when receiving a bulkSend with an error producing request",function(){
            var context = [];
            context.push(testPacket({
                'resource': "/foo",
                'action': "set",
                'entity': { foo:1}
            }));
            context.push(testPacket({
                'resource': "/foo1",
                'action': "reset",
                'entity': { foo:2}
            }));
            var bulkSendPacket = testPacket({
                'action': "bulkSend",
                'entity': context
            });
            return apiBase.receivePacketContext(bulkSendPacket).then(function() {
                expect(bulkSendPacket.responses.length).toEqual(1);
                expect(bulkSendPacket.responses[0].response).toEqual("ok");
                expect(apiBase.data["/foo"].entity).toEqual({foo:1});
                expect(apiBase.data["/foo1"]).not.toBeDefined();

            });
        });
    });
//=====================================================================
// Basic Actions: delete
//=====================================================================
    describe("action delete",function() {
        pit("deletes an existant resource",function() {
            var context=testPacket({action:"delete",resource:"/foo"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/foo"].deleted).toEqual(true);
                
            });
        });

        pit("deletes a non-existent resource",function() {
            var context=testPacket({action:"delete",resource:"/does-not-exist"});
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.data["/does-not-exist"]).toBeUndefined();
                
            });
        });
        pit("returns noMatch for a bad version pre-condition",function() {
            var context=testPacket({
                action: "delete",
                resource:"/foo",
                ifTag: 20
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses.length).toEqual(1);
                expect(context.responses[0].response).toEqual("noMatch");
                expect(context.responses[0].entity.expectedVersion).toEqual(20);
                expect(context.responses[0].entity.actualVersion).toEqual(1);
            });
        });
    });
//=====================================================================
// Basic Actions: watch
//=====================================================================

    describe("action watch on an existing resource",function() {
        var watchContext;
        beforeEach(function() {
            watchContext=testPacket({
                src: "unitTest",
                msgId: "i:100",
                action:"watch",
                resource:"/foo"
            });
        });
        afterEach(function() {
            watchContext=null;
        });
        pit("returns the current value",function() {
            return apiBase.receivePacketContext(watchContext).then(function() {
                expect(watchContext.responses.length).toEqual(1);
                expect(watchContext.responses[0].response).toEqual("ok");
                expect(watchContext.responses[0].contentType).toEqual("text/plain");
                expect(watchContext.responses[0].entity).toEqual("hello world");
            });
        });
        
        pit("notifies watchers when the resource value changes",function() {
            var context=testPacket({
                resource: "/foo",
                action: "set",
                entity: { foo:1}
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                console.log("Sending set packet");
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                console.log("Checking for change packet");
                expect(apiBase.participant).toHaveSent({
                    resource: "/foo",
                    dst: "unitTest",
                    replyTo: "i:100",
                    entity: {
                        newValue: { foo:1},
                        oldValue: "hello world",
                        newCollection: [],
                        oldCollection: [],
                        deleted: false
                    }
                });
            });
        });
        pit("deleting the resource broadcasts to watchers",function() {
            var context=testPacket({action:"delete",resource:"/foo"});
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                expect(apiBase.participant).toHaveSent({
                    resource: "/foo",
                    dst: "unitTest",
                    replyTo: "i:100",
                    entity: {
                        newValue: null,
                        oldValue: "hello world",
                        newCollection: null,
                        oldCollection: [],
                        deleted: true
                    }
                });
            });
        });
    });
    describe("action watch on an non-existent resource",function() {
        var watchContext;
        beforeEach(function() {
            watchContext=testPacket({
                src: "unitTest",
                msgId: "i:100",
                action:"watch",
                resource:"/does-not-exist"
            });
        });
        afterEach(function() {
            watchContext=null;
        });
        
        pit("returns a null value",function() {
            return apiBase.receivePacketContext(watchContext).then(function() {
                expect(watchContext.responses.length).toEqual(1);
                expect(watchContext.responses[0].response).toEqual("ok");
                expect(watchContext.responses[0].contentType).toBeUndefined();
                expect(watchContext.responses[0].entity).toBeUndefined();
            });
        });
        pit("broadcasts to watchers when the resource is created",function() {
            var context=testPacket({
                resource: "/does-not-exist",
                action: "set",
                entity: { foo:1}
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                expect(apiBase.participant).toHaveSent({
                    resource: "/does-not-exist",
                    dst: "unitTest",
                    replyTo: "i:100",
                    entity: {
                        newValue: { foo:1},
                        oldValue: undefined,
                        newCollection: [],
                        oldCollection: [],
                        deleted: false
                    }
                });
            });
        });
        pit("a watch on a non-existant resource does not create that resource",function() {
            var context=testPacket({
                resource: "/does-not-exist",
                action: "get"
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(pauseForPromiseResolution).then(function() {
                expect(context.responses[0].response).toEqual("noResource");
            });
        });

    });
//=====================================================================
// Basic Actions: unWatch
//=====================================================================

    describe("action unwatch",function() {
        var watchContext;
        beforeEach(function() {
            watchContext=testPacket({
                src: "unitTest",
                msgId: "i:100",
                action:"watch",
                resource:"/foo"
            });
        });
        afterEach(function() {
            watchContext=null;
        });
        
        pit("removes an existant watch",function() {
            var context=testPacket({
                resource: "/foo",
                action: "unwatch"
            });
            return apiBase.receivePacketContext(watchContext).then(function() {
                return apiBase.receivePacketContext(context);
            }).then(function() {
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.watchers["/foo"].length).toEqual(0);
            });
        });
        pit("is a NOP if there is no watch",function() {
            var context=testPacket({
                resource: "/foo",
                action: "unwatch"
            });
            return apiBase.receivePacketContext(context).then(function() {
                expect(context.responses[0].response).toEqual("ok");
                expect(apiBase.watchers["/foo"]).toBeUndefined(0);
            });
        });

    });
});    

describe("Base Api leadership handoff",function() {
	var apiBase;
    var fakeRouter;
	beforeEach(function() {
        fakeRouter=new FakeRouter();
        apiBase=createApiRequestObject(fakeRouter);
	});
    
    describe("Leader handoff basic functions",function() {
        it("starts as a member in the queuing state",function() {
            expect(apiBase.leaderState).toEqual("member");
            expect(apiBase.isRequestQueueing).toEqual(true);
        });

        it("transitions to the dormant state upon receiving announceLeader",function() {
            apiBase.receivePacketContext(new TestPacketContext({
                packet: {
                    dst: apiBase.coordinationAddress,
                    action: "announceLeader"
            }}));
            expect(apiBase.leaderState).toEqual("member");
            expect(apiBase.isRequestQueueing).toEqual(false);
        });
        
        it("transitions to a loading state",function() {
            apiBase.transitionToLoading();
            expect(apiBase.leaderState).toEqual("loading");
            expect(apiBase.isRequestQueueing).toEqual(true);
        });        

        pit("member transitions to ready->loading->master upon receiving deathscream",function() {
            spyOn(apiBase,"initializeData").and.callThrough();
            spyOn(apiBase,"transitionToMemberReady").and.callThrough();

            var deathScream=apiBase.createDeathScream();
            var deathScreamPacket=new TestPacketContext({
                packet: {
                    dst: apiBase.coordinationAddress,
                    action: "deathScream",
                    entity: deathScream
            }});
            return apiBase.receivePacketContext(deathScreamPacket).then(function() {
                // Check for ready state-- queueing packets as member, holding deathscream data
                expect(apiBase.leaderState).toEqual("member");
                expect(apiBase.isRequestQueueing).toEqual(true);
                expect(apiBase.deathScream).toEqual(deathScream);
                expect(apiBase.transitionToMemberReady).toHaveBeenCalledWith(deathScream);
                // simulates the lock being gained
                return apiBase.transitionToLoading();
            }).then(function() {
                expect(apiBase.leaderState).toEqual("leader");
                expect(apiBase.initializeData).toHaveBeenCalledWith(deathScream);
            });
        });         
        it("Creates deathScream data",function() {
            var deathScream=apiBase.createDeathScream();
            deathScream.data.forEach(function(node){
                var apiNode=apiBase.data[node.resource];
                expect(apiNode).toBeDefined();
                expect(node.entity).toEqual(apiNode.entity);
            });           
        });
        
        pit("Initializes data from a deathScream",function() {
            var apiBase2=new TestApi({
                authorization: ozpIwc.wiring.authorization,
                'participant': new TestClientParticipant({
                    authorization: ozpIwc.wiring.authorization,
                    router: fakeRouter
                }),
                'name': "testApi.api",
                'router': fakeRouter
            });
            var deathScream=apiBase.createDeathScream();
            
            var deathScreamPacket=new TestPacketContext({
                packet: {
                    dst: apiBase.coordinationAddress,
                    action: "deathScream",
                    entity: deathScream
            }});
            return apiBase2.receivePacketContext(deathScreamPacket).then(function() {
                // simulates the lock being gained
                return apiBase2.transitionToLoading();
            }).then(function() {
                expect(apiBase2.leaderState).toEqual("leader");
                expect(apiBase2.data).toEqual(apiBase.data);
                expect(apiBase2.watchers).toEqual(apiBase.watchers);
            });
 
        });
    });
});
