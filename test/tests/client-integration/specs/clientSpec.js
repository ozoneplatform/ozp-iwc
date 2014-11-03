
describe("IWC Client", function() {
    var client;
    var participant;

    var pinger = function(remoteClient, testAddress) {
        var sendTick = function() {
            remoteClient.send({
                dst: testAddress,
                entity: {'tick': ozpIwc.util.now()}
            });
            window.setTimeout(sendTick, 10);
        };
        sendTick();
    };

    afterEach(function() {
        if (client) {
            client.disconnect();
            client=null;
        }
        if (participant) {
            participant.close();
            participant=null;
        }
    });

    it("Can be used before the connection is fully established", function(done) {
        client = new ozpIwc.Client({
            'peerUrl': "http://localhost:14002"
        });
        
        var gate = doneSemaphore(2, done);
        client.send({
            'dst': "data.api",
            'action': "get",
            'resource': ""
        },function(response) {
            gate();
        });
        
        client.on("connected",gate);
        
        
    });

    describe("", function() {

        beforeEach(function(done) {
            client = new ozpIwc.Client({
                'peerUrl': "http://localhost:14002"
            });
            participant = new ozpIwc.test.MockParticipant({
                'clientUrl': "http://localhost:14001",
                'client': client
            });

            var gate = doneSemaphore(2, done);

            participant.on("connected", gate);
            client.on("connected", gate);
        });


        it("has an address", function() {
            expect(client.address).not.toBe("$nobody");
        });

        it("hears the ping", function(done) {
            participant.run(pinger);

            // current version of jasmine breaks if done() is called multiple times
            // use the called flag to prevent this
            var called = false;
            client.on("receive", function(packet) {
                if (packet.entity.tick && !called) {
                    done();
                    called = true;
                }
            });
        });


        it("gets pings in order", function(done) {
            participant.run(pinger);

            // current version of jasmine breaks if done() is called multiple times
            // use the called flag to prevent this
            var callCount = 10;
            var lastPing = 0;

            client.on("receive", function(packet) {
                if (packet.entity.tick) {
                    expect(packet.entity.tick).toBeGreaterThan(lastPing);
                    lastPing = packet.entity.tick;
                    if (callCount-- === 0) {
                        done();
                    }
                }
            });

        });

        it('sends 15mb packets', function(done) {
            client.on("receive", function(packet) {
                if (packet.entity.bulkyData) {
                    expect(packet.entity.bulkyData.length).toEqual(19131876);
                    done();
                }
            });


            participant.run(function(remoteClient, testAddress) {
                var result = "0123456789abcdefghijklmnopqrstuvwxyz";

                // quickly creates result.length * 3^12 characters of data
                for (var i = 0; i < 12; i++) {
                    result += result + result;
                }
                remoteClient.send({
                    dst: testAddress,
                    entity: {
                        'bulkyData': result
                    }
                });
            });
        });
    });
    describe("launch parameters",function() {
        var testPeerUrl="http://" + window.location.hostname + ":14002";

        
        it("when peerUrl is a string, it directly connects",function(done) {
             client=new ozpIwc.Client({
                 peerUrl: testPeerUrl,
                 autoPeer: false
             });
             client.connect().then(function() {
                expect(client.peerUrl).toEqual(testPeerUrl);
                done();
             }).catch(function(error) {
                 console.log("Error " ,error);
                 expect(JSON.strinfigy(error)).toEqual("did not happen");
                 done();
             });
        });
        it("when peerUrl is an array, the first is chosen",function(done) {
             client=new ozpIwc.Client({
                 peerUrl: [testPeerUrl,"http://ozp.example.com"],
                 autoPeer: false
             });
             client.connect().then(function() {
                expect(client.peerUrl).toEqual(testPeerUrl);
                done();
             }).catch(function(error) {
                 console.log("Error " ,error);
                 expect(error).toEqual("did not happen");
                 done();
             });
        });
        
        it("fetches the mailbox when passed ozpIwc.mailbox",function(done) {
             window.name="ozpIwc.inFlightIntent=\"/ozpIntents/invocations/123\"";
             client=new ozpIwc.Client({
                 peerUrl: "http://localhost:14002",
                 autoPeer: false
             });
             window.name="";
             spyOn(client,"send").and.callThrough();
             client.connect().then(function() {
                expect(client.send).toHaveBeenCalledWith(jasmine.objectContaining({
                    'dst': "intents.api",
                    'resource' : "/ozpIntents/invocations/123",
                    'action' : "get"
                }),jasmine.any(Function));
                 done();
             }).catch(function(error) {
                 console.log("Error " ,error);
                 expect(error).toEqual("did not happen");
                 done();
             });
        });
        describe("",function() {
            var originalHref=window.location.href;
            var baseUrl=window.location.protocol + "//" + window.location.host+window.location.pathname;

            afterEach(function() {
                history.replaceState({},"page",originalHref);
            });
            
            it("when ozpIwc.peer is in the query params and whitelisted in the array, choose it",function(done) {
                history.replaceState({}, "page 2", baseUrl + "?ozpIwc.peer=\"" + testPeerUrl + "\"");
                client=new ozpIwc.Client({
                    peerUrl: ["http://ozp.example.com",testPeerUrl],
                    autoPeer: false
                });
                client.connect().then(function() {
                   expect(client.peerUrl).toEqual(testPeerUrl);
                   done();
                }).catch(function(error) {
                    console.log("Error " ,error);
                    expect(error).toEqual("did not happen");
                    done();
                });
            });
            it("when ozpIwc.peer is in the hash and whitelisted in the array, choose it",function(done) {
                history.replaceState({}, "page 2", baseUrl + "#ozpIwc.peer=\"" + testPeerUrl + "\"");
                client=new ozpIwc.Client({
                    peerUrl: ["http://ozp.example.com",testPeerUrl],
                    autoPeer: false
                });
                client.connect().then(function() {
                   expect(client.peerUrl).toEqual(testPeerUrl);
                   done();
                }).catch(function(error) {
                    console.log("Error " ,error);
                    expect(error).toEqual("did not happen");
                    done();
                });
            });
            it("when ozpIwc.peer is in the query params, pass it to the function to be validated",function(done) {
                history.replaceState({}, "page 2", baseUrl + "?ozpIwc.peer=\"" + testPeerUrl + "\"");
                client=new ozpIwc.Client({
                    peerUrl: function(url,resolve) { 
                        expect(url).toEqual(testPeerUrl);
                        resolve(testPeerUrl);
                    },
                    autoPeer: false
                });
                client.connect().then(function() {
                   expect(client.peerUrl).toEqual(testPeerUrl);
                   done();
                }).catch(function(error) {
                    console.log("Error " ,error);
                    expect(error).toEqual("did not happen");
                    done();
                });
            });
            it("when ozpIwc.peer is in the hash, pass it to the function to be validated",function(done) {
                history.replaceState({}, "page 2", baseUrl + "#ozpIwc.peer=\"" + testPeerUrl + "\"");
                client=new ozpIwc.Client({
                    peerUrl: function(url,resolve) { 
                        expect(url).toEqual(testPeerUrl);
                        resolve(testPeerUrl);
                    },
                    autoPeer: false
                });
                client.connect().then(function() {
                   expect(client.peerUrl).toEqual(testPeerUrl);
                   done();
                }).catch(function(error) {
                    console.log("Error " ,error);
                    expect(error).toEqual("did not happen");
                    done();
                });
            });            
        });
    });
});
