describe("Intent API Class", function () {

    var apiBase;
    var endpoint;

    // mock data for the endpoints
    var data = {
        "http://example.com/intents/1": {
            response: {
                _links: {
                    self: {
                        type: "application/vnd.ozp-iwc-fake+json;version=1",
                        href: "http://example.com/intents/1"
                    }
                }
            }
        }
    };
    data["/"] = {
        response: {
            _links: {
                item: Object.keys(data).map(function (k) {
                    return data[k].response._links.self;
                })
            },
            _embedded: {item: []}
        },
        header: {
            'Content-Type': "application/json"
        }
    };

    beforeEach(function () {
        var fakeRouter = new FakeRouter();
        apiBase = new ozpIwc.api.intents.Api({
            'authorization': ozpIwc.wiring.authorization,
            'participant': new TestClientParticipant({
                authorization: ozpIwc.wiring.authorization,
                router: fakeRouter
            }),
            'name': "testIntents.api",
            'router': fakeRouter,
            'ajaxQueue': new ozpIwc.util.AjaxPersistenceQueue()
        });
        apiBase.isRequestQueueing = false;
        apiBase.leaderState = "leader";

        endpoint = jasmine.createSpyObj('endpoint', ['get', 'put', 'delete']);
//        ozpIwc.api.endpoint=function() { return endpoint; };
        ozpIwc.api.endpoint = jasmine.createSpy("ozpIwc.api.endpoint");
        ozpIwc.api.endpoint.and.returnValue(endpoint);
        spyOn(ozpIwc.util, "openWindow");

        endpoint.get.and.callFake(function (url) {
            return Promise.resolve(data[url]);
        });
    });

    pit("fetches data from the server", function () {
        apiBase.leaderState = "member";
        return apiBase.transitionToLoading().then(function () {
            expect(endpoint.get).toHaveBeenCalledWith("/", []);
            expect(endpoint.get).toHaveBeenCalledWith("http://example.com/intents/1", [{
                name: "Accept",
                value: "application/vnd.ozp-iwc-fake+json;version=1"
            }]);
        });
    });
    it("registers handlers", function () {
        var testPacket = new TestPacketContext({
            'packet': {
                'resource': "/text/plain/view",
                'action': "register",
                'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
                'entity': {
                    'bar': 2,
                    'invokeIntent': {
                        'dst': "fakeAddress.unitTest"
                    }
                }
            },
            'leaderState': "leader"
        });
        apiBase.receivePacketContext(testPacket);
        expect(testPacket.responses[0]).toEqual(jasmine.objectContaining({
            response: "ok"
        }));
        expect(testPacket.responses[0].entity.resource).toMatch(/text\/plain\/view\/.*/);
    });

    describe("invocation workflow", function () {
        var handlerResource = "/text/plain/view/1234";

        var makeInvocationPacket = function (resource) {
            return new TestPacketContext({
                'packet': {
                    'resource': resource,
                    'action': "invoke",
                    'contentType': "text/plain",
                    'entity': "Some Text",
                    'respondOn': "all"
                },
                'leaderState': "leader"
            });
        };

        var makeRegistrationPacket = function (resource) {
            return new TestPacketContext({
                'packet': {
                    'resource': handlerResource,
                    'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
                    'action': "register",
                    'entity': {
                        'type': "text/plain",
                        'action': "view",
                        'invokeIntent': {
                            dst: "system.api",
                            resource: "/intentHandler",
                            action: "view"
                        }
                    }
                },
                'leaderState': "leader"
            });
        };
        beforeEach(function () {
            apiBase.receivePacketContext(makeRegistrationPacket(handlerResource));
            apiBase.receivePacketContext(new TestPacketContext({
                'packet': {
                    'resource': "/text/plain/view/7890",
                    'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
                    'action': "register",
                    'entity': {
                        'type': "text/plain",
                        'action': "view",
                        'invokeIntent': {
                            dst: "someApplication",
                            resource: "/intentHandler",
                            action: "view"
                        }
                    }
                },
                'leaderState': "leader"
            }));

            // act as if there are no saved preferences by default
            apiBase.getPreference = function () {return Promise.reject();};
        });

        pit("invokes handlers directly", function () {
            var invocationPacket = makeInvocationPacket(handlerResource);
            apiBase.receivePacketContext(invocationPacket);
            expect(invocationPacket).toHaveSent({
                dst: invocationPacket.packet.src,
                response: "ok"
            });
            jasmine.clock().tick(100);
            return invocationPacket.responses[0].then(function (resp) {
                var inflightIntent = resp.entity.inFlightIntent;
                expect(inflightIntent.entity.state).toEqual("delivering");
            });

        });

        pit("sends the delivery packet on a direct invocation", function () {
            var invocationPacket = makeInvocationPacket(handlerResource);
            apiBase.receivePacketContext(invocationPacket);
            expect(invocationPacket).toHaveSent({
                dst: invocationPacket.packet.src,
                response: "ok"
            });
            return invocationPacket.responses[0].then(function (resp) {
                var inflightIntent = resp.entity.inFlightIntent;
                expect(apiBase.participant).toHaveSent({
                    dst: "system.api",
                    resource: "/intentHandler",
                    action: "view",
                    entity: {
                        inFlightIntent: inflightIntent
                    }
                });
            });
        });

        pit("presents the chooser when there are multiple choices", function () {
            var invocationPacket = makeInvocationPacket("/text/plain/view");
            apiBase.receivePacketContext(invocationPacket);
            expect(invocationPacket).toHaveSent({
                dst: invocationPacket.packet.src,
                response: "ok"
            });
            return invocationPacket.responses[0].then(function (resp) {
                var inflightIntent = resp.entity.inFlightIntent;
                expect(inflightIntent.entity.state).toEqual("choosing");
                expect(ozpIwc.util.openWindow)
                    .toHaveBeenCalledWith(ozpIwc.config.intentsChooserUri, jasmine.objectContaining({
                        "ozpIwc.peer": ozpIwc.config._busRoot,
                        "ozpIwc.intentSelection": "intents.api" + inflightIntent.resource
                    }), ozpIwc.config.intentChooserFeatures);
            });
        });

        pit("uses a saved preference when one exists", function () {
            var invocationPacket = makeInvocationPacket("/text/plain/view");
            apiBase.getPreference = function () {return Promise.resolve(handlerResource);};
            apiBase.receivePacketContext(invocationPacket);
            expect(invocationPacket).toHaveSent({
                dst: invocationPacket.packet.src,
                response: "ok"
            });
            return invocationPacket.responses[0].then(function (resp) {
                var inflightIntent = resp.entity.inFlightIntent;
                expect(inflightIntent.entity.state).toEqual("delivering");
                expect(ozpIwc.util.openWindow)
                    .not.toHaveBeenCalled();
            });
        });

        pit("ignores a saved preference that's not valid", function () {
            var invocationPacket = makeInvocationPacket("/text/plain/view");
            apiBase.getPreference = function () {return Promise.resolve("/invalid/handler");};
            apiBase.receivePacketContext(invocationPacket);
            expect(invocationPacket).toHaveSent({
                dst: invocationPacket.packet.src,
                response: "ok"
            });
            return invocationPacket.responses[0].then(function (resp) {
                var inflightIntent = resp.entity.inFlightIntent;
                expect(inflightIntent.entity.state).toEqual("choosing");
                expect(ozpIwc.util.openWindow)
                    .toHaveBeenCalledWith(ozpIwc.config.intentsChooserUri, jasmine.objectContaining({
                        "ozpIwc.peer": ozpIwc.config._busRoot,
                        "ozpIwc.intentSelection": "intents.api" + inflightIntent.resource
                    }), ozpIwc.config.intentChooserFeatures);
            });
        });

        pit("marks the invocation as running when it receives a running packet", function () {
            var invocationPacket = makeInvocationPacket(handlerResource);
            apiBase.receivePacketContext(invocationPacket);
            return invocationPacket.responses[0].then(function (resp) {
                var inflightIntent = resp.entity.inFlightIntent;
                var runningPacket = new TestPacketContext({
                    'packet': {
                        'resource': inflightIntent.resource,
                        'action': "set",
                        'contentType': "application/vnd.ozp-iwc-intent-invocation-v1+json",
                        'entity': {
                            'state': "running",
                            'handler': {
                                'address': "someAddress",
                                'resource': "/intentReceiver"
                            }
                        }
                    }
                });
                apiBase.receivePacketContext(runningPacket);
                expect(apiBase.data[inflightIntent.resource].entity.state).toEqual("running");
            });
        });
    });
});