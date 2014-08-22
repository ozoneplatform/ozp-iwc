/**
 * Network Integration
 */


describe("intents.api integration", function () {
    var client;
    var participant;

    beforeEach(function(done) {
        client=new ozpIwc.Client({
            peerUrl: "http://localhost:14002"
        });
        participant=new ozpIwc.test.MockParticipant({
            clientUrl: "http://localhost:14001",
            'client': client
        });

        var gate=done_semaphore(2,done);

        participant.on("connected",gate);
        client.on("connected",gate);
    });

    xdescribe('Common Actions', function () {

        var registerPacket = function (resource) {
            return {
                dst: 'intents.api',
                action: 'register',
                resource: resource,
                entity: {
                    type: "text/plain",
                    action: "view",
                    icon: "http://example.com/view-text-plain.png",
                    label: "View Plain Text",
                    invokeIntent: "system.api/application/123-412"
                }
            };
        };

        var unregisterPacket = function (resource) {
            return {
                dst: 'intents.api',
                action: 'unregister',
                resource: resource
            };
        };

        var setPacket = function (resource) {
            return {
                dst: 'intents.api',
                action: 'set',
                resource: resource,
                entity: {
                    label: 'changed label',
                    invokeIntent: 'changed invokeIntent',
                    icon: 'www.changed.icon/icon.png',
                    action: 'changed action',
                    type: 'changed type'
                }
            };
        };

        var getPacket = function (resource) {
            return {
                dst: 'intents.api',
                action: 'get',
                resource: resource
            };
        };

        var deletePacket = function (resource) {
            return {
                dst: 'intents.api',
                action: 'delete',
                resource: resource
            };
        };

        var invokePacket = function (resource) {
            return {
                dst: 'intents.api',
                action: 'invoke',
                resource: resource
            };
        };

        it('registers handlers', function (done) {
            var called = false;
            var sentPacket;

            var registerCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentPacket.msgId);
                    expect(reply.response).toEqual('ok');
                    expect(reply.entity).toContain(sentPacket.resource);
                    done();
                }
            };
            sentPacket = client.send(registerPacket('/a/b/c'), registerCallback);
        });

        it('unregisters handlers', function (done) {
            var called = false;
            var sentPacket;

            var unregisterCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentPacket.msgId);
                    expect(reply.response).toEqual('ok');
                    done();
                }
            };

            var registerCallback = function (reply) {
                sentPacket = client.send(unregisterPacket(reply.entity), unregisterCallback);
            };

            client.send(registerPacket('/a/b/c'), registerCallback);

        });

        it('sets handler properties', function (done) {
            var called = false;
            var sentPacket;


            var setCallback = function (reply) {
                if (!called) {
                    called = true;
                    expect(reply.replyTo).toEqual(sentPacket.msgId);
                    expect(reply.response).toEqual('ok');
                    done();
                }
            };

            var registerCallback = function (reply) {
                sentPacket = client.send(setPacket(reply.entity), setCallback);
            };
            client.send(registerPacket('/a/b/c'), registerCallback);
        });

        it('gets handler properties', function (done) {
            var called = false;
            var sentPacket;

            client.send(registerPacket('/a/b/c'), function (registerReply) {
                var setPacketObj = setPacket(registerReply.entity);
                client.send(setPacketObj, function (setReply) {

                    sentPacket = client.send(getPacket(registerReply.entity), function (reply) {
                        if (!called) {
                            called = true;
                            label: 'changed label',
                            expect(reply.replyTo).toEqual(sentPacket.msgId);
                            expect(reply.entity).toEqual(setPacketObj.entity);
                            done();
                        }
                    });
                });
            });
        });

        it('deletes handlers', function (done) {
            var called = false;
            var sentPacket;

            client.send(registerPacket('/a/b/c'), function (registerReply) {
                sentPacket = client.send(deletePacket(registerReply.entity), function (reply) {
                    if (!called) {
                        expect(reply.replyTo).toEqual(sentPacket.msgId);
                        expect(reply.response).toEqual('ok');
                        done();
                    }
                });
            });
        });

        xit('Invokes specific handlers', function (done) {
            var called = false;
            var sentPacket;

            client.send(registerPacket('/a/b/c'), function (registerReply) {
                sentPacket = client.send(invokePacket(registerReply.entity), function (reply) {
                    if (!called) {
                        expect(reply.replyTo).toEqual(sentPacket.msgId);
                        expect(reply.response).toEqual('ok');
                        done();
                    }
                });
            });
        });


    });
});
