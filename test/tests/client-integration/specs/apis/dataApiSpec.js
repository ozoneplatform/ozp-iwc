describe("Data API", function () {
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

    it('sets a value visible to other clients',function(done) {
        var packet={
            'dst': "data.api",
            'resource': "/test",
            'action' : "set",
            'entity' : { 'foo' : 1 }
        }
        participant.send(packet,function() {
            client.api('data.api').set(packet.resource,{entity: packet.entity})
                .then(function (reply) {
                    expect(reply.response).toEqual('ok');
                    client.api('data.api').get(packet.resource)
                        .then(function(reply) {
                            expect(reply.entity).toEqual(packet.entity);
                            done();
                        })
                        .catch(function(error) {
                            expect(error).toEqual('');
                    });
                })
                .catch(function (error) {
                    expect(error).toEqual('');
                });

        });
    });

    it('setting a value generates a change to other clients',function(done) {
        var packet={
            'dst': "data.api",
            'resource': "/test",
            'action' : "set",
            'entity' : { 'foo' : 1 }
        };
        client.api('data.api').watch(packet.resource,null,function(reply) {
            if(reply.response==="changed") {
                expect(reply.entity.newValue).toEqual(packet.entity);
                expect(reply.entity.oldValue).toEqual({});
                done();
            }
            return true;
        })
            .then(function(reply) {
                participant.send(packet);
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });

    });

    it("can delete a value set by someone else",function(done) {
        var packet={
            'dst': "data.api",
            'resource': "/test",
            'action' : "set",
            'entity' : { 'foo' : 1 }
        };
        participant.send(packet,function() {
            client.api('data.api').delete(packet.resource)
                .then(function(reply) {
                    expect(reply.response).toEqual("ok");
                    client.api('data.api').get(packet.resource)
                        .then(function(reply) {
                            expect(reply.entity).toBeUndefined();
                            done();
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

    it('Integration bus cleans up after every run',function(done) {
        client.api('data.api').get('/test')
            .then(function(reply) {
                expect(reply.entity).toEqual({});
                done();
            })
            .catch(function(error) {
                expect(error).toEqual('');
            });
    });

    xit('can list children added by another client',function(done) {

    });

    xit('can remove children added by another client',function(done){

    });

    xit('gets a change notice on a child being added by another client',function(done){

    });

    xit('gets a change notice on a child being removed by another client',function(done){

    });

    xit('permissions on the entity restrict access to the origin',function(done){

    });
    describe('Legacy API Tests', function () {

        afterEach(function (done) {
            var called = false;
            client.api('data.api').delete('/test')
                .then(function (packet) {
                    expect(packet.response).toEqual('ok');
                }).catch(function (error) {
                    expect(error).toEqual('');
                });
            if (!called) {
                called = true;
                done();
            }
        });


        it('Client sets values', function (done) {
            var called = false;
            client.api('data.api').set('/test', { entity: "testData"})
                .then(function (packet) {
                    if (!called) {
                        called = true;
                        expect(packet.response).toEqual('ok');
                        done();
                    }
                })
                .catch(function (error) {
                    expect(error).toEqual('');
                });
        });


        it('Client gets values', function (done) {
            var called = false;

            client.api('data.api').set('/test', { entity: "testData"})
                .then(function (packet) {
                    client.api('data.api').get('/test', {})
                        .then(function (packet) {
                            if (!called) {
                                called = true;

                                expect(packet.entity).toEqual('testData');

                                done();
                            }
                        })
                        .catch(function (error) {
                            expect(error).toEqual('');
                        })
                })
                .catch(function (error) {
                    expect(error).toEqual('');
                });
        });

        it('Client deletes values', function (done) {
            var called = false;
            client.api('data.api').delete('/test')
                .then(function (packet) {
                    expect(packet.response).toEqual('ok');
                    if (!called) {
                        called = true;
                        done();
                    }
                }).catch(function (error) {
                    expect(error).toEqual('');
                });
        });


        it('Client watches & un-watches keys', function (done) {
            var called = false;

            client.api('data.api').watch('/test', {}, function (packet) {
                if (packet.response === "changed") {
                    expect(packet.entity.newValue).toEqual('testData');
                    client.api('data.api').unwatch('/test', {})
                        .then(function (packet2) {
                            if (!called) {
                                called = true;

                                expect(packet2.response).toEqual('ok');

                                done();
                            }
                        })
                        .catch(function (error) {
                            expect(error).toEqual('');
                        });
                }
            })
                .catch(function(error) {
                    expect(error).toEqual('')
                });

            client.api('data.api').set('/test', {entity: 'testData'})
                .then(function (packet) {
                    expect(packet.response).toEqual('ok');
                })
                .catch(function (error) {
                    expect(error).toEqual('');
                });
        });

//        xdescribe('Collection-like Actions', function () {
//
//            //TODO implement if needed
//        });
    });
});
