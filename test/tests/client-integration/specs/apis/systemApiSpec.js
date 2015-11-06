describe("System Api", function () {
    var client, systemApi;
    var BUS_URL = "http://" + window.location.hostname + ":14002";

    beforeAll(function (done) {
        client = new ozpIwc.Client({peerUrl: BUS_URL});
        client.connect().then(function () {
            systemApi = client.system();
            done();
        });
    });


    describe("general", function () {

        pit("has pretty name and email in /user", function () {
            return systemApi.get("/user").then(function (reply) {
                expect(reply.response).toEqual("ok");
                expect(reply.entity).toBeDefined();
            });
        });

        pit("has system version in /system", function () {
            return systemApi.get("/system")
                .then(function (reply) {
                    expect(reply.response).toEqual("ok");
                    expect(reply.entity).toBeDefined();
                });

        });

        xit("lists the sampleData applications at /application", function () {
            return systemApi.get("/application").then(function (reply) {
                expect(reply.response).toEqual("ok");
                //@TODO mock system api updates for testing
                //expect(reply.entity).toContain("/application/23456");
                //expect(reply.entity).toContain("/application/34567");
                //expect(reply.entity).toContain("/application/45678");
                //expect(reply.entity).toContain("/application/56789");
                //expect(reply.entity).toContain("/application/67890");
            });
        });

        ["/application/1234", "/user", "/system"].forEach(function (resource) {
            pit("denies set on " + resource, function () {
                return systemApi.set(resource, {entity: "blah"})
                    .then(function (reply) {
                        return Promise.reject(reply);
                    }).catch(function (error) {
                        expect(error.response).toEqual("badAction");
                    });
            });
            pit("denies delete on " + resource, function () {
                return systemApi.delete(resource, {entity: "blah"})
                    .then(function (reply) {
                        return Promise.rject(reply);
                    })['catch'](function (error) {
                    expect(error.response).toEqual("badAction");
                });
            });
        });

        xit("registers for the intent run /application/vnd.ozp-iwc-launch-data-v1+json/run/system.api", function () {
            return client.intents().get("/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api")
                .then(function (reply) {
                    console.log("Received ", reply);
                    expect(reply.response).toEqual("ok");
                    expect(reply.entity.invokeIntent).toBeDefined();
                    expect(reply.entity.invokeIntent.action).toEqual("invoke");
                    expect(reply.entity.invokeIntent.dst).toEqual("system.api");
                });
        });

        xit("launch on system.api invokes the intent run /application/vnd.ozp-iwc-launch-data-v1+json/run/system.api", function () {
            // hijack the system.api's intent registration so that we get it
            return client.intents().set("/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api", {
                resource: "/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api",
                entity: {
                    label: "Launch in New Window",
                    invokeIntent: {
                        dst: client.address,
                        action: "invoke",
                        resource: ""
                    }
                }
            }).then(function (reply) {
                expect(reply.response).toEqual("ok");
                return Promise.all([
                    systemApi.launch("/application/23456", {
                        entity: {"foo": 123}
                    }),
                    new Promise(function (resolve, reject) {
                        client.on("receive", function (packet) {
                            if (packet.src === "intents.api" && packet.action === "invoke") {
                                resolve(packet);
                            }
                        });
                    })
                ]);
            }).then(function (replies) {
                var intentsPacket = replies[1];
                expect(intentsPacket.entity.inFlightIntent.entity).toEqual(jasmine.objectContaining({
                    "entity": {
                        'url': 'http://localhost:15001/?color=green',
                        'applicationId': '/application/23456',
                        'launchData': Object({foo: 123}),
                        'id': '25a3d034-31f1-4dbe-b9b4-03c8dad7b5f8'
                    }
                }));
            });
        });
    });
});