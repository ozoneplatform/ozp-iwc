/**
 * Network Integration
 */


describe("System API", function () {
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

    

    describe("/user resource", function() {
        xit("has pretty name and email in /user",function(done) {

        });

        xit("set action is noPerm",function(done) {
            
        });
        xit("delete action is noPerm",function(done) {
            
        });
    });

    describe("/system resource", function() {
        xit("has system version in /system",function(done) {
            
        });

        xit("set is a badAction",function(done) {
            
        });

        xit("delete is a badAction",function(done) {
            
        });
    });

    describe("/application resources", function() {
        xit("lists the sampleData applications at /application",function(done) {
            
        });
        xit("gets reference data at /application/${id}",function(done) {
            
        });
        xit("set action is noPerm",function(done) {
            
        });
        xit("delete action is noPerm",function(done) {
            
        });
    });

    describe("Legacy integration tests",function() {
        var testResource="/application/abcApplication";

        var securityAttributes={'modifyAuthority': 'apiLoader'};

        var testEntity={
            screenShots: {
                overview: {
                    url: "https://mail.example.com/screenshot1.png",
                    title: "This shows the basic user interface"
                }
            },
            links: {
                self: "names.api/application/12341-123-abba-123",
                launch: {
                    default: "https://mail.example.com",
                    development: "https://dev.mail.example.com",
                    test: "https://test.mail.example.com"
                },
                userDocs: "https://mail.example.com/help.html",
                integrationDocs: "https://mail.example.com/integration.html",
                onlineHelp: "https://mail.example.com/liveChat.html"
            },
            intents: {
            }
        };

        afterEach(function (done) {
            var called = false;
            client.api('system.api').delete(testResource, {'securityAttributes': securityAttributes})
                .then(function(reply) {
                    if (!called) {
                        expect(reply.response).toEqual('ok');
                        called = true;
                        done();
                    }
                })
                .catch(function(error) {
                    expect(error).toEqual('');
                });
        });


        it('Client sets values', function (done) {
            var called = false;
            client.api('system.api').set(testResource,{entity: testEntity,'securityAttributes': securityAttributes})
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
            client.api('system.api').set(testResource,{entity: testEntity, 'securityAttributes': securityAttributes})
                .then(function(reply) {
                    client.api('system.api').get(testResource)
                        .then(function(reply) {
                            if (!called) {
                                called = true;
                                expect(reply.response).toEqual('ok');
                                expect(reply.entity).toEqual(testEntity);
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
            client.api('system.api').delete(testResource,{'securityAttributes': securityAttributes})
                .then(function(reply) {
                    if (!called) {
                        expect(reply.response).toEqual('ok');
                        called = true;
                        done();
                    }
                })
                .catch(function(error) {
                    expect(error).toEqual('');
                });
        });


        it('Client watches & un-watches keys', function (done) {
            var called = false;

            client.api('system.api').watch(testResource,{entity: testEntity},function(reply) {
                if (reply.response === 'changed') {
                    expect(reply.entity.newValue).toEqual(testEntity);
                    client.api('system.api').unwatch(testResource)
                        .then(function (reply) {
                            if (!called) {
                                expect(reply.response).toEqual('ok');
                                called=true;
                                done();
                            }
                        })
                        .catch(function (error) {
                            expect(error).toEqual('');
                        });
                    return true;
                }
            })
                .then(function(reply) {
                    client.api('system.api').set(testResource,{entity: testEntity,'securityAttributes': securityAttributes})
                        .then(function(reply) {
                            expect(reply.response).toEqual('ok');
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

});
