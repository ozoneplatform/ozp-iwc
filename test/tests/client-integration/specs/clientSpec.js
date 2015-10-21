describe("IWC Client", function () {
    var client, client2;
    var BUS_URL = "http://" + window.location.hostname + ":14002";

    beforeAll(function (done) {
        client = new ozpIwc.Client({peerUrl: BUS_URL, autoConnect: false});
        client.connect().then(function () {
            done();
        });
    });


    afterEach(function (done) {
        client.data().list('/').then(function (resp) {
            var packets = [];
            var resources = resp.entity || [];
            resources.forEach(function (resource) {
                packets.push(client.data().messageBuilder.delete(resource));
            });
            client.data().bulkSend(packets).then(function () {
                Promise.all(packets).then(function () {
                    done();
                });
            });
        });
    });

    describe("connection", function () {
        it("connects", function () {
            expect(client.address).not.toEqual("$nobody");
        });

        pit("connects 2 clients with different addresses", function () {
            var client2 = new ozpIwc.Client({peerUrl: BUS_URL});
            return client2.connect().then(function () {
                expect(client2.address).not.toEqual("$nobody");
                expect(client2.address).not.toEqual(client.address);
                return client2.disconnect();
            });
        });

        pit("allows requests before connection established.", function () {
            var client2 = new ozpIwc.Client({peerUrl: BUS_URL});

            return client2.names().get('/address').then(function (response) {
                expect(response).toBeDefined();
                return client2.disconnect();
            });
        });

        pit("allows clients to share resources", function () {
            var client2 = new ozpIwc.Client({peerUrl: BUS_URL});
            return client2.connect().then(function () {
                return client.data().set("/foo", {entity: "cow"});
            }).then(function () {
                    return client2.data().get("/foo");
            }).then(function (reply) {
                expect(reply.dst).toEqual(client2.address);
                expect(reply.entity).toEqual("cow");
                return client2.disconnect();
            });
        });

        pit("gets launchData from hash", function(){
            client.readLaunchParams("#ozpIwc.launchData=%7B%22channel%22%3A1%7D");
            return client.getLaunchData().then(function(launchData){
                expect(launchData).toEqual({'channel':1});
            });
        });
        pit("gets launchData from query", function(){
            client.readLaunchParams("?ozpIwc.launchData=%7B%22channel%22%3A1%7D");
            return client.getLaunchData().then(function(launchData){
                expect(launchData).toEqual({'channel':1});
            });
        });
    });

    describe("launch parameters", function () {
        var client2;

        afterEach(function () {
            client2.disconnect();
            client2 = undefined;
        });

        pit("when peerUrl is a string, it directly connects", function () {
            client2 = new ozpIwc.Client({
                peerUrl: BUS_URL,
                autoConnect: false
            });
            return client2.connect().then(function () {
                expect(client2.peerUrl).toEqual(BUS_URL);
            });
        });

        pit("when peerUrl is an array, the first is chosen", function () {
            client2 = new ozpIwc.Client({
                peerUrl: [BUS_URL, "http://ozp.example.com"],
                autoConnect: false
            });
            return client2.connect().then(function () {
                expect(client2.peerUrl).toEqual(BUS_URL);
            });
        });
    });

    describe("transmission", function () {

        beforeAll(function (done) {
            client2 = new ozpIwc.Client({peerUrl: BUS_URL});
            client2.connect().then(function () {
                done();
            });
        });

        afterAll(function () {
            client2.disconnect();
            client2 = undefined;
        });

        pit('handles large (15mb) packets', function () {
            var result = "0123456789abcdefghijklmnopqrstuvwxyz";

            // quickly creates result.length * 3^12 characters of data
            for (var i = 0; i < 12; i++) {
                result += result + result;
            }

            return client2.data().set('/transmissionTests/15mb', {entity: result}).then(function (resp) {
                expect(resp.response).toEqual("ok");
                return client2.data().get('/transmissionTests/15mb').then(function (resp2) {
                    expect(resp2.entity).toEqual(result);
                });
            });
        });
    });

    describe("bulkSend", function () {

        pit("responds to a bulk set with an ok for receiving the packets, and responds to each request individually", function () {
            var packets = [];
            packets.push(client.data().messageBuilder.set("/foo", {entity: "bar"}));
            packets.push(client.data().messageBuilder.set("/bar", {entity: "buz"}));
            packets.push(client.data().messageBuilder.get("/foo"));
            packets.push(client.data().messageBuilder.get("/bar"));

            return client.data().bulkSend(packets).then(function (reply) {
                //These actually will resolve before the bulkSend resolves, but for the pit test structure this is
                // easiest.
                return Promise.all(packets).then(function (replies) {
                    expect(replies[0].response).toEqual("ok");
                    expect(replies[1].response).toEqual("ok");
                    expect(replies[2].entity).toEqual("bar");
                    expect(replies[3].entity).toEqual("buz");
                });
            });
        });

        pit("responds to a bulk set with an ok for receiving the packets, and responds to each request individually including rejections", function () {
            var packets = [];
            packets.push(client.data().messageBuilder.set("/foo", {entity: "bar"}));
            packets.push(client.data().messageBuilder.set("/bar", {entity: "buz"}));
            packets.push(client.data().messageBuilder.get("/NO_RESOURCE"));
            packets.push(client.data().messageBuilder.get("/foo"));
            packets.push(client.data().messageBuilder.get("/bar"));

            //Long promise chain, this is just because we want to see that packet[2] (noResource) will error, but all
            // others will respond still.
            return client.data().bulkSend(packets).then(function (reply) {
                return packets[0];
            }).then(function (res) {
                expect(res.response).toEqual("ok");
                return packets[1];
            }).then(function (res) {
                expect(res.response).toEqual("ok");
                return packets[2];
            }).then(function (res) {
                expect(res).toNotHappen();
            }, function (err) {
                expect(err.response).toEqual("noResource");
                return packets[3];
            }).then(function (res) {
                expect(res.entity).toEqual("bar");
                return packets[4];
            }).then(function (res) {
                expect(res.entity).toEqual("buz");
            });
        });
    });
    describe("respondOn", function () {

        pit("defaults to respond on all (response/errors) by default", function () {
            return client.data().set("/foo", {entity: "barbuz"}).then(function (reply) {
                return client.data().get("/NO_RESOURCE").catch(function (error) {
                    // We want to resolve this
                    expect(error.response).toEqual("noResource");
                    return error;
                });
            });
        });

        it("does not receive response packets if respondOn is none", function (done) {
            var resolved = false;
            var rejected = false;
            setTimeout(function () {
                expect(resolved).toEqual(false);
                expect(rejected).toEqual(false);
                done();
            }, 1000);

            client.api("data.api").set("/foo", {respondOn: "none", entity: "barbuz"}).then(function (reply) {
                expect(reply).notToHappen();
            }).catch(function (err) {
                expect(err).notToHappen();
            });

            client.api("data.api").get("/NO_RESOURCE", {respondOn: "none", entity: "barbuz"}).then(function (reply) {
                expect(reply).notToHappen();
            }).catch(function (err) {
                expect(err).notToHappen();
            });
        });

        it("responds only on errors if respondOn is error", function (done) {
            var resolved = false;
            var rejected = false;
            setTimeout(function () {
                expect(resolved).toEqual(false);
                expect(rejected).toEqual(true);
                done();
            }, 1000);

            client.api("data.api").set("/foo", {respondOn: "error", entity: "barbuz"}).then(function (reply) {
                expect(reply).notToHappen();
            }).catch(function (err) {
                expect(err).notToHappen();
            });

            client.api("data.api").get("/NO_RESOURCE", {respondOn: "error", entity: "barbuz"}).then(function (reply) {
                resolved = true;
                expect(reply).notToHappen();
            }).catch(function (err) {
                rejected = true;
            });
        });
    });

    describe("Resource Lifespans", function () {
        beforeEach(function (done) {
            client2 = new ozpIwc.Client({peerUrl: BUS_URL});
            client2.connect().then(function () {
                done();
            });
        });

        afterEach(function () {
            client2.disconnect();
            client2 = undefined;
        });

        pit("Bound resources are automatically bound to the client address", function () {
            return client2.data().set("/foo", {lifespan: "bound"}).then(function () {
                return client2.data().get("/foo");
            }).then(function (resp) {
                expect(resp.lifespan).toEqual({
                    type: 'Bound',
                    addresses: [client2.address]
                });
            });
        });
        pit("A Client can bind multiple addresses to a resource", function () {
            return client2.connect().then(function () {
                return client2.data().set("/fuz", {
                    lifespan: {
                        type: "Bound",
                        addresses: [client2.address, "fake.address"]
                    }
                });
            }).then(function () {
                return client2.data().get("/fuz");
            }).then(function (resp) {
                expect(resp.lifespan).toEqual({
                    type: 'Bound',
                    addresses: [client2.address, "fake.address"]
                });
            });
        });
        pit("Bound resources are automatically removed when the client disconnects", function () {
            return client2.data().set("/foo", {lifespan: "bound"}).then(function () {
                return client2.data().get("/foo");
            }).then(function (resp) {
                return client2.disconnect();
            }).then(function () {
                return client.data().get("/foo");
            }).then(function (resp) {
                expect(resp).toNotHappen();
            }).catch(function (e) {
                expect(e.response).toEqual("noResource");
            });
        });

        pit("Bound resources are visable to other clients", function () {
            return client.data().set("/foo", {lifespan: "bound"}).then(function () {
                return client.data().get("/foo");
            }).then(function (resp) {
                return client2.data().get("/foo");
            }).then(function (resp) {
                expect(resp.lifespan).toEqual({
                    type: 'Bound',
                    addresses: [client.address]
                });
            });
        });

    });
});