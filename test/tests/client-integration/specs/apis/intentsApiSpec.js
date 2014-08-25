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

    afterEach(function() {
        client.disconnect();
        participant.close();
    });

    var registerEntity={
        type: "text/plain",
        action: "view",
        icon: "http://example.com/view-text-plain.png",
        label: "View Plain Text",
        invokeIntent: "system.api/application/123-412"
    }

    var setEntity={
        label: 'changed label',
        invokeIntent: 'changed invokeIntent',
        icon: 'www.changed.icon/icon.png',
        action: 'changed action',
        type: 'changed type'
    };

    it('registers handlers', function (done) {
        var called = false;

        client.api('intents.api').register('/a/b/c', {entity: registerEntity})
            .then(function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.response).toEqual('ok');
                    expect(reply.entity).toContain('/a/b/c');
                    done();
                }
            })
            .catch(function (error) {
                expect(error).toEqual('');
            });
    });

    it('unregisters handlers', function (done) {
        var called = false;

        client.api('intents.api').register('/a/b/c',{entity: registerEntity})
            .then(function(reply) {
                client.api('intents.api').unregister('/a/b/c',reply.entity)
                    .then(function(reply) {
                        if (!called) {
                            called = true;

                            expect(reply.response).toEqual('ok');
                            done();
                        }
                    })
                    .catch(function(error) {
                        expect(error).toEqual('');
                    });
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });

    });

    it('sets handler properties', function (done) {
        var called = false;

        client.api('intents.api').register('/a/b/c',{entity: registerEntity})
            .then(function(reply) {
                client.api('intents.api').set(reply.entity,{entity: setEntity})
                    .then(function(reply) {
                        if (!called) {
                            called = true;
                            expect(reply.response).toEqual('ok');
                            done();
                        }
                    })
                    .catch(function(error) {
                        expect(error).toEqual('');
                    });
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });
    });

    it('gets handler properties', function (done) {
        var called = false;

        client.api('intents.api').register('/a/b/c',{entity: registerEntity})
            .then(function(reply) {
                client.api('intents.api').set(reply.entity,{entity: setEntity})
                    .then(function(reply) {
                        client.api('intents.api').get('/a/b/c',reply.entity)
                            .then(function(reply) {
                                if (!called) {
                                    called = true;
                                    label: 'changed label',
                                        expect(reply.entity).toEqual(reply.entity);
                                    done();
                                }
                            })
                            .catch(function(error) {
                                expect(error).toEqual('');
                            });
                    })
                    .catch(function(error) {
                        expect(error).toEqual('');
                    });
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });
    });

    it('deletes handlers', function (done) {
        var called = false;

        client.api('intents.api').register('/a/b/c',{entity: registerEntity})
            .then(function(reply) {
                client.api('intents.api').delete('/a/b/c',reply.entity)
                    .then(function(reply) {
                        if (!called) {
                            expect(reply.response).toEqual('ok');
                            done();
                        }
                    })
                    .catch(function(error) {
                        expect(error).toEqual('');
                    });
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });
    });

    xit('Invokes specific handlers', function (done) {
        var called = false;

        client.api('intents.api').register('/a/b/c',{entity: registerEntity})
            .then(function(reply) {
                client.api('intents.api').invoke(reply.entity,{})
                    .then(function(reply) {
                        if (!called) {
                            expect(reply.response).toEqual('ok');
                            done();
                        }
                    })
                    .catch(function(error) {
                        expect(error).toEqual('');
                    });
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });
    });

});
