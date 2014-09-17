/**
 * Network Integration
 */


describe("Names API", function () {
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
        
        var gate=doneSemaphore(2,done);

        participant.on("connected",gate);
        client.on("connected",gate);
    });
    
    afterEach(function() {
        client.disconnect();
        participant.close();
    });


    describe("/address resources", function() {
        xit("returns info about myself via get /address/${client.address}",function(done) {
            
        });

        xit("uses the /me alias for get /address/${client.address}",function(done) {
            
        });    
        xit("returns limited info about another client",function(done) {
            
        });
        xit("returns metrics information about me at /address/${client.address}/metrics",function(done) {
            
        });

        xit("set action is noPerm",function(done) {
            
        });
        xit("delete action is noPerm",function(done) {
            
        });

    });
    describe("/multicast resources",function() {
        xit("adds client to the group with an addChild action on /multicast/${name}",function(done) {
            
        });    
        xit("returns multicast group info for /multicast/${name}",function(done) {
            
        });

        xit("returns the group members for /multicast/${name} for members",function(done) {
            
        });
        xit("returns metrics information about the multicast group at /multicast/${name}/metrics",function(done) {
            
        });
        
        xit("set action is noPerm",function(done) {
            
        });
        xit("delete action is noPerm",function(done) {
            
        });

    });
    
    describe("/api resources",function() {
        xit("returns a list of APIs at /api",function(done) {
            
        });
        xit("returns a descriptor at /api/data.api",function(done) {
            
        });
        xit("returns API metrics at /api/data.api/metrics",function(done) {
            
        });
        
        xit("set action is noPerm",function(done) {
            
        });
        xit("delete action is noPerm",function(done) {
            
        });
    });


    describe("Legacy integration tests",function() {
        var testId="/address/testAddress";

        var testFragment = {
            entity: {
                name: 'testName',
                address: 'testAddress',
                participantType: 'testType'
            },
            contentType: 'application/ozpIwc-address-v1+json'
        };

        afterEach(function (done) {
            var called = false;

            client.api('names.api').delete(testId,testFragment)
                .then(function(reply){
                    if (!called) {
                        called = true;
                        expect(reply.response).toEqual('ok');
                        done();
                    }
                })
                .catch(function(error) {
                    expect(error).toEqual('');
                });
        });


        it('Client sets values', function (done) {
            var called = false;
            client.api('names.api').set(testId,testFragment)
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
        });


        it('Client gets values', function (done) {
            var called = false;

            client.api('names.api').set(testId,testFragment)
                .then(function(reply) {
                    client.api('names.api').get(testId,{})
                        .then(function(reply) {
                            if (!called) {
                                called = true;
                                expect(reply.entity).toEqual(testFragment.entity);
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

        it('Client deletes values', function (done) {
            var called = false;

            client.api('names.api').delete(testId,{})
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
        });

    });
});
