/*jshint noarg:false */
describe("IWC Client", function() {
    jasmine.getEnv().defaultTimeoutInterval = 3000;// e.g. 15000 milliseconds

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
            client = null;
        }
        if (participant) {
            participant.close();
            participant = null;
        }
    });

    pit("Can be used before the connection is fully established", function() {
        client = new ozpIwc.Client({
            'peerUrl': "http://" + window.location.hostname + ":14002"
        });

        return client.send({
            'dst': "names.api",
            'action': "get",
            'resource': "/address"
        }).then(function(response) {
            expect(response).toBeDefined();
        });
    });

    describe("", function() {

        beforeEach(function(done) {
            client = new ozpIwc.Client({
                'peerUrl': "http://" + window.location.hostname + ":14002"
            });
            participant = new ozpIwc.test.MockParticipant({
                'clientUrl': "http://" + window.location.hostname + ":14001",
                'client': client
            });

            var gate = ozpIwc.testUtil.doneSemaphore(2, done);
            participant.on("connected", function() {
                gate();
            });
            client.connect().then(function() {
                gate();
            }).catch(function(e) {
                console.error("IWC Client failed to connect due to ", e);
            });
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
                    client.off(arguments.callee);
                }
            });
        });


        it("gets pings in order", function(done) {

            // current version of jasmine breaks if done() is called multiple times
            // use the called flag to prevent this
            var callCount = 10;
            var lastPing = 0;

            client.on("receive", function(packet) {
                if (packet.entity.tick) {
                    console.log(JSON.stringify(packet));
                    expect(packet.entity.tick).toBeGreaterThan(lastPing);
                    lastPing = packet.entity.tick;
                    if (callCount-- === 0) {
                        client.off(arguments.callee);
                        done();
                    }
                }
            });

            participant.run(pinger);

        });

        it('sends 15mb packets', function(done) {
            client.on("receive", function(packet) {
                if (packet.entity.bulkyData) {
                    expect(packet.entity.bulkyData.length).toEqual(19131876);
                    client.off(arguments.callee);
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
    describe("api Mappings", function() {

        it("has its apiMap at construction based on the ozpIwc.apiMap", function() {
            client = new ozpIwc.Client({
                'peerUrl': "http://" + window.location.hostname + ":14002",
                autoConnect: false
            });
            expect(client.apiMap['data.api']).not.toBeUndefined();
            expect(client.apiMap['data.api'].functionName).toEqual('data');
            expect(client.apiMap['data.api'].address).toEqual('data.api');
            expect(client.apiMap['data.api'].actions.length).toBeGreaterThan(0);

            expect(client.apiMap['names.api']).not.toBeUndefined();
            expect(client.apiMap['names.api'].functionName).toEqual('names');
            expect(client.apiMap['names.api'].address).toEqual('names.api');
            expect(client.apiMap['names.api'].actions.length).toBeGreaterThan(0);

            expect(client.apiMap['intents.api']).not.toBeUndefined();
            expect(client.apiMap['intents.api'].functionName).toEqual('intents');
            expect(client.apiMap['intents.api'].address).toEqual('intents.api');
            expect(client.apiMap['intents.api'].actions.length).toBeGreaterThan(0);

            expect(client.apiMap['system.api']).not.toBeUndefined();
            expect(client.apiMap['system.api'].functionName).toEqual('system');
            expect(client.apiMap['system.api'].address).toEqual('system.api');
            expect(client.apiMap['system.api'].actions.length).toBeGreaterThan(0);
        });

        it("creates api function calls on creation", function() {
            client = new ozpIwc.Client({
                'peerUrl': "http://" + window.location.hostname + ":14002",
                autoConnect: false
            });
            expect(client.data).not.toBeUndefined();
            expect(client.names).not.toBeUndefined();
            expect(client.system).not.toBeUndefined();
            expect(client.intents).not.toBeUndefined();

            expect(client.data()).toEqual(client.api('data.api'));
            expect(client.names()).toEqual(client.api('names.api'));
            expect(client.system()).toEqual(client.api('system.api'));
            expect(client.intents()).toEqual(client.api('intents.api'));
        });
    });

    describe("launch parameters", function() {
        var testPeerUrl = "http://" + window.location.hostname + ":14002";


        pit("when peerUrl is a string, it directly connects", function() {
            client = new ozpIwc.Client({
                peerUrl: testPeerUrl,
                autoConnect: false
            });
            return client.connect().then(function() {
                expect(client.peerUrl).toEqual(testPeerUrl);
            });
        });
        pit("when peerUrl is an array, the first is chosen", function() {
            client = new ozpIwc.Client({
                peerUrl: [testPeerUrl, "http://ozp.example.com"],
                autoConnect: false
            });
            return client.connect().then(function() {
                expect(client.peerUrl).toEqual(testPeerUrl);
            });
        });

//        it("fetches the mailbox when passed ozpIwc.mailbox", function(done) {
//            window.name = "ozpIwc.inFlightIntent=\"/ozpIntents/invocations/123\"";
//            client = new ozpIwc.Client({
//                peerUrl: "http://" + window.location.hostname + ":14002",
//                autoConnect: false
//            });
//            window.name = "";
//            spyOn(client, "send").and.callThrough();
//            client.connect().then(function() {
//                expect(client.send).toHaveBeenCalledWith(jasmine.objectContaining({
//                    'dst': "intents.api",
//                    'resource': "/ozpIntents/invocations/123",
//                    'action': "get"
//                }),undefined);
//                done();
//            })['catch'](function(error) {
//                console.log("Error ", error);
//                expect(error).toEqual("did not happen");
//                done();
//            });
//        });
    });
    describe("bulkSend",function(){

        beforeEach(function(done) {
            client=new ozpIwc.Client({
                peerUrl: "http://" + window.location.hostname + ":14002"
            });
            participant=new ozpIwc.test.MockParticipant({
                clientUrl: "http://" + window.location.hostname + ":14001",
                'client': client
            });

            var gate=ozpIwc.testUtil.doneSemaphore(2,done);

            participant.on("connected",gate);
            client.on("connected",gate);
        });


        pit("responds to a bulk set with an ok for receiving the packets, and responds to each request individually", function(){
            var packets = [];
            packets.push(client.api('data.api').messageBuilder.set("/foo",{entity: "bar"}));
            packets.push(client.api('data.api').messageBuilder.set("/bar",{entity: "buz"}));
            packets.push(client.api('data.api').messageBuilder.get("/foo"));
            packets.push(client.api('data.api').messageBuilder.get("/bar"));

            return client.api('data.api').bulkSend(packets).then(function(reply){
                //These actually will resolve before the bulkSend resolves, but for the pit test structure this is easiest.
                return Promise.all(packets).then(function(replies){
                    expect(replies[0].response).toEqual("ok");
                    expect(replies[1].response).toEqual("ok");
                    expect(replies[2].entity).toEqual("bar");
                    expect(replies[3].entity).toEqual("buz");
                });
            });
        });

        pit("responds to a bulk set with an ok for receiving the packets, and responds to each request individually including rejections", function(){
            var packets = [];
            packets.push(client.api('data.api').messageBuilder.set("/foo",{entity: "bar"}));
            packets.push(client.api('data.api').messageBuilder.set("/bar",{entity: "buz"}));
            packets.push(client.api('data.api').messageBuilder.get("/NO_RESOURCE"));
            packets.push(client.api('data.api').messageBuilder.get("/foo"));
            packets.push(client.api('data.api').messageBuilder.get("/bar"));

            //Long promise chain, this is just because we want to see that packet[2] (noResource) will error, but all others
            //will respond still.
            return client.api('data.api').bulkSend(packets).then(function(reply){
                return packets[0];
            }).then(function(res){
                expect(res.response).toEqual("ok");
                return packets[1];
            }).then(function(res) {
                expect(res.response).toEqual("ok");
                return packets[2];
            }).then(function(res){
                expect(res).toNotHappen();
            },function(err){
                expect(err.response).toEqual("noResource");
                return packets[3];
            }).then(function(res){
                expect(res.entity).toEqual("bar");
                return packets[4];
            }).then(function(res){
                expect(res.entity).toEqual("buz");
            });
        });
    });
    describe("respondOn",function(){

        beforeEach(function(done) {
            client=new ozpIwc.Client({
                peerUrl: "http://" + window.location.hostname + ":14002"
            });
            participant=new ozpIwc.test.MockParticipant({
                clientUrl: "http://" + window.location.hostname + ":14001",
                'client': client
            });

            var gate=ozpIwc.testUtil.doneSemaphore(2,done);

            participant.on("connected",gate);
            client.connect().then(gate);
        });

        pit("defaults to respond on all (response/errors) by default",function(){
            return client.api("data.api").set("/foo",{entity: "barbuz"}).then(function(reply){
                return client.data().get("/NO_RESOURCE").catch(function(error){
                    // We want to resolve this
                    expect(error.response).toEqual("noResource");
                    return error;
                });
            });
        });

        it("does not receive response packets if respondOn is none",function(done){
            var resolved = false;
            var rejected = false;
            setTimeout(function(){
                expect(resolved).toEqual(false);
                expect(rejected).toEqual(false);
                done();
            },3000);

            client.api("data.api").set("/foo",{respondOn:"none", entity: "barbuz"}).then(function(reply){
                expect(reply).notToHappen();
            }).catch(function(err){
                expect(err).notToHappen();
            });

            client.api("data.api").get("/NO_RESOURCE",{respondOn:"none", entity: "barbuz"}).then(function(reply){
                expect(reply).notToHappen();
            }).catch(function(err){
                expect(err).notToHappen();
            });
        });

        it("responds only on errors if respondOn is error",function(done){
            var resolved = false;
            var rejected = false;
            setTimeout(function(){
                expect(resolved).toEqual(false);
                expect(rejected).toEqual(true);
                done();
            },3000);

            client.api("data.api").set("/foo",{respondOn: "error", entity: "barbuz"}).then(function(reply){
                expect(reply).notToHappen();
            }).catch(function(err){
                expect(err).notToHappen();
            });

            client.api("data.api").get("/NO_RESOURCE",{respondOn: "error", entity: "barbuz"}).then(function(reply){
                resolved = true;
                expect(reply).notToHappen();
            }).catch(function(err){
                rejected = true;
            });
        });
    });

    describe("Resource Lifespans",function(){
        var client;

        beforeEach(function() {
            window.name="";
            client=new ozpIwc.Client({peerUrl:"http://" + window.location.hostname + ":13000"});
        });
        afterEach(function() {
            client.disconnect();
            client=null;
        });

        pit("Bound resources are automatically bound to the client address",function(){
            return client.data().set("/foo",{lifespan:"bound"}).then(function(){
                return client.data().get("/foo");
            }).then(function(resp){
                expect(resp.lifespan).toEqual({
                    type: 'Bound',
                    addresses: [client.address]
                });
            });
        });
        pit("A Client can bind multiple addresses to a resource",function() {
            return client.connect().then(function(){
                return client.data().set("/foo", {
                    lifespan: {
                        type: "Bound",
                        addresses: [client.address, "fake.address"]
                    }
                });
            }).then(function(){
                return client.data().get("/foo");
            }).then(function(resp){
                expect(resp.lifespan).toEqual({
                    type: 'Bound',
                    addresses: [client.address, "fake.address"]
                });
            });
        });
        pit("Bound resources are automatically removed when the client disconnects",function(){
            return client.data().set("/foo",{lifespan:"bound"}).then(function(){
                return client.data().get("/foo");
            }).then(function(resp){
                client.disconnect();
                client=new ozpIwc.Client({peerUrl:"http://" + window.location.hostname + ":13000"});
                return client.connect();
            }).then(function(){
                return client.data().get("/foo");
            }).then(function(resp){
                expect(resp).toNotHappen();
            }).catch(function(e){
                expect(e.response).toEqual("noResource");
            });
        });

        pit("Bound resources are visable to other clients", function(){
            var client2;
            return client.data().set("/foo",{lifespan:"bound"}).then(function(){
                return client.data().get("/foo");
            }).then(function(resp){
                client2=new ozpIwc.Client({peerUrl:"http://" + window.location.hostname + ":13000"});
                return client2.connect();
            }).then(function(){
                return client2.data().get("/foo");
            }).then(function(resp) {
                expect(resp.lifespan).toEqual({
                    type: 'Bound',
                    addresses: [client.address]
                });
            });
        });

    });

//    describe("", function() {
//        var originalHref = window.location.href;
//        var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
//
//        afterEach(function() {
//            history.replaceState({}, "page", originalHref);
//        });
//
//        it("when ozpIwc.peer is in the query params and whitelisted in the array, choose it", function(done) {
//            history.replaceState({}, "page 2", baseUrl + "?ozpIwc.peer=\"" + testPeerUrl + "\"");
//            client = new ozpIwc.Client({
//                peerUrl: ["http://ozp.example.com", testPeerUrl],
//                autoConnect: false
//            });
//            client.connect().then(function() {
//                expect(client.peerUrl).toEqual(testPeerUrl);
//                done();
//            })['catch'](function(error) {
//                console.log("Error ", error);
//                expect(error).toEqual("did not happen");
//                done();
//            });
//        });
//        it("when ozpIwc.peer is in the hash and whitelisted in the array, choose it", function(done) {
//            history.replaceState({}, "page 2", baseUrl + "#ozpIwc.peer=\"" + testPeerUrl + "\"");
//            client = new ozpIwc.Client({
//                peerUrl: ["http://ozp.example.com", testPeerUrl],
//                autoConnect: false
//            });
//            client.connect().then(function() {
//                expect(client.peerUrl).toEqual(testPeerUrl);
//                done();
//            })['catch'](function(error) {
//                console.log("Error ", error);
//                expect(error).toEqual("did not happen");
//                done();
//            });
//        });
//        it("when ozpIwc.peer is in the query params, pass it to the function to be validated", function(done) {
//            history.replaceState({}, "page 2", baseUrl + "?ozpIwc.peer=\"" + testPeerUrl + "\"");
//            client = new ozpIwc.Client({
//                peerUrl: function(url, resolve) {
//                    expect(url).toEqual(testPeerUrl);
//                    resolve(testPeerUrl);
//                },
//                autoConnect: false
//            });
//            client.connect().then(function() {
//                expect(client.peerUrl).toEqual(testPeerUrl);
//                done();
//            })['catch'](function(error) {
//                console.log("Error ", error);
//                expect(error).toEqual("did not happen");
//                done();
//            });
//        });
//        it("when ozpIwc.peer is in the hash, pass it to the function to be validated", function(done) {
//            history.replaceState({}, "page 2", baseUrl + "#ozpIwc.peer=\"" + testPeerUrl + "\"");
//            client = new ozpIwc.Client({
//                peerUrl: function(url, resolve) {
//                    expect(url).toEqual(testPeerUrl);
//                    resolve(testPeerUrl);
//                },
//                autoConnect: false
//            });
//            client.connect().then(function() {
//                expect(client.peerUrl).toEqual(testPeerUrl);
//                done();
//            })['catch'](function(error) {
//                console.log("Error ", error);
//                expect(error).toEqual("did not happen");
//                done();
//            });
//        });
//    });
});
