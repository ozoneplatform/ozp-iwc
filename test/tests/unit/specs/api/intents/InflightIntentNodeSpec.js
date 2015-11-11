describe("Intents in Flight Value", function () {
    var invokePacket = {
        src: "src0",
        msgId: "p:0",
        contentType: "text/plain",
        entity: "Some test value"
    };
    var baseEntity = {
        'intent': {
            'type': "text/plain",
            'action': "view"
        },
        'contentType': invokePacket.contentType,
        'entity': invokePacket.entity,
        'invokePacket': invokePacket,
        'status': "ok"
    };
    var handlerChoices = [
        {
            resource: "/handler1"
        }, {
            resource: "/handler2"
        }
    ];

    var makeNode = function (config) {
        config = config || {};
        return new ozpIwc.api.intents.node.InFlightNode({
            'resource': config.resource || '/ozpIntents/invocations/abcd',
            'invokePacket': invokePacket,
            'type': config.type || baseEntity.intent.type,
            'action': config.action || baseEntity.intent.action,
            'handlerChoices': config.handlerChoices || handlerChoices
        });
    };

    var stateValidation = {
        init: function (node) {
            expect(node.entity.state).toEqual("init");
            expect(node.entity.handler).toEqual({
                'resource': null,
                'address': null
            });
        },
        choosing: function (node) {
            expect(node.entity).toEqual(jasmine.objectContaining(baseEntity));
            expect(node.entity.state).toEqual("choosing");
            expect(node.entity.handler).toEqual({
                'resource': null,
                'address': null
            });
        },
        deliveringOnlyOne: function (node) {
            expect(node.entity).toEqual(jasmine.objectContaining(baseEntity));
            expect(node.entity.state).toEqual("delivering");
            expect(node.entity.handler).toEqual({
                'resource': handlerChoices[0].resource,
                'reason': 'onlyOne'
            });
        },
        deliveringUserSelected: function (node) {
            expect(node.entity).toEqual(jasmine.objectContaining(baseEntity));
            expect(node.entity.state).toEqual("delivering");
            expect(node.entity.handler).toEqual({
                'resource': handlerChoices[0].resource,
                'reason': 'userSelected'
            });
        },
        running: function (node) {
            expect(node.entity).toEqual(jasmine.objectContaining(baseEntity));
            expect(node.entity.state).toEqual("running");
        },
        complete: function (node) {
            expect(node.entity).toEqual(jasmine.objectContaining(baseEntity));
            expect(node.entity.state).toEqual("complete");
        }
    };

    it("expects initial state to be choosing if there are multiple handler choices", function () {
        var node = makeNode();
        stateValidation.init(node);
    });

    it("expects initial state to be delivering if there is only one handler choice", function () {
        var node = makeNode({'handlerChoices': [handlerChoices[0]]});
        node = ozpIwc.api.intents.FSM.transition(node);
        stateValidation.deliveringOnlyOne(node);
        expect(node.entity.handler).toEqual({
            resource: handlerChoices[0].resource,
            reason: "onlyOne"
        });
    });

    //============================================
    // choosing -> delivering
    //============================================

    it("transitions from choosing to delivering on receiving a 'delivering' packet", function () {
        var node = makeNode();
        node = ozpIwc.api.intents.FSM.transition(node, {
            'entity': {
                'state': "delivering",
                'handler': {
                    'resource': handlerChoices[0].resource,
                    'reason': "userSelected"
                }
            }
        });
        stateValidation.deliveringUserSelected(node);
        expect(node.entity.handler).toEqual({
            resource: handlerChoices[0].resource,
            reason: "userSelected"
        });
    });
    it("transitions from choosing to error on receiving a error packet", function () {
        var node = makeNode();
        node = ozpIwc.api.intents.FSM.transition(node, {'entity': {'state': "error", 'error': "Unknown Error"}});
        expect(node.entity.state).toEqual("error");
        expect(node.entity.reply).toEqual("Unknown Error");
    });
    it("throws badState if the set lacks resource or reason", function () {
        var node = makeNode();
        expect(function () {
            ozpIwc.api.intents.FSM.transition(node, {
                'entity': {
                    'state': "delivering",
                    'handler': {
                        'reason': "userSelected"
                    }
                }
            });
        }).toThrow();
        expect(function () {
            ozpIwc.api.intents.FSM.transition(node, {
                'entity': {
                    'state': "delivering",
                    'handler': {
                        'resource': handlerChoices[0].resource
                    }
                }
            });
        }).toThrow();
        stateValidation.init(node);
    });

    //============================================
    // delivering -> running
    //============================================
    describe("transition from delivering to running", function () {
        var node;
        beforeEach(function () {
            node = makeNode({'handlerChoices': [handlerChoices[0]]});
            node = ozpIwc.api.intents.FSM.transition(node);
            stateValidation.deliveringOnlyOne(node);
        });
        it("on receiving a 'running' packet", function () {
            node = ozpIwc.api.intents.FSM.transition(node, {
                'entity': {
                    'state': "running",
                    'handler': {
                        'address': "someAddress",
                        'resource': "/handler1"
                    }
                }
            });
            stateValidation.running(node);
            expect(node.entity.handler.address).toEqual("someAddress");
            expect(node.entity.handler.resource).toEqual("/handler1");
            expect(node.entity.handler.reason).toEqual("onlyOne");
        });

        it("transitions from delivering to error on receiving a error packet", function () {
            node = ozpIwc.api.intents.FSM.transition(node, {'entity': {'state': "error", 'error': "Unknown Error"}});
            expect(node.entity.state).toEqual("error");
            expect(node.entity.reply).toEqual("Unknown Error");
        });

        it("throws badState if the set lacks an address", function () {
            expect(function () {
                node = ozpIwc.api.intents.FSM.transition(node, {
                    'entity': {
                        'state': "running",
                        'handler': {
                            'resource': "/intentReceiver"
                        }
                    }
                });
            }).toThrow();
            stateValidation.deliveringOnlyOne(node);
        });
    });
    //============================================
    // running ->
    //============================================
    describe("transition from running", function () {
        var node;
        beforeEach(function () {
            node = makeNode({'handlerChoices': [handlerChoices[0]]});
            node = ozpIwc.api.intents.FSM.transition(node);
            stateValidation.deliveringOnlyOne(node);
            node = ozpIwc.api.intents.FSM.transition(node, {
                'entity': {
                    'state': "running",
                    'handler': {
                        'address': "someAddress",
                        'resource': "/intentReceiver"
                    }
                }
            });
            stateValidation.running(node);
        });

        it("to error on receiving a error packet", function () {
            node = ozpIwc.api.intents.FSM.transition(node, {
                'entity': {
                    'state': "error",
                    'error': "Unknown Error"
                }
            });
            expect(node.entity.state).toEqual("error");
            expect(node.entity.reply).toEqual("Unknown Error");
        });

        it("to complete on receiving a 'complete' packet", function () {
            node = ozpIwc.api.intents.FSM.transition(node, {
                'entity': {
                    'state': "complete",
                    'reply': {
                        'contentType': "text/plain",
                        'entity': "Goodbye!"
                    }
                }
            });
            stateValidation.complete(node);
            expect(node.entity.reply).toEqual({
                'contentType': "text/plain",
                'entity': "Goodbye!"
            });
        });
    });
});