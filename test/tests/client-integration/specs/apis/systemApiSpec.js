/**
 * Network Integration
 */


describe("System API", function() {
    var client;
    var participant;

    beforeEach(function(done) {
        client = new ozpIwc.Client({
            peerUrl: "http://localhost:14002"
        });
        participant = new ozpIwc.test.MockParticipant({
            clientUrl: "http://localhost:14001",
            'client': client
        });

        var gate = done_semaphore(2, done);

        participant.on("connected", gate);
        client.on("connected", gate);
    });

    afterEach(function() {
        client.disconnect();
        participant.close();
    });

    it("has pretty name and email in /user", function(done) {
        client.api("system.api").get("/user")
            .then(function(reply) {
                expect(reply.response).toEqual("ok");
                expect(reply.entity).toBeDefined();
                done();
            }).catch(function(error) {
                expect(error).toEqual("Should not happen");
                done();
            });
    });
    it("has system version in /system", function(done) {
        client.api("system.api").get("/system")
            .then(function(reply) {
                expect(reply.response).toEqual("ok");
                expect(reply.entity).toBeDefined();
                done();
            }).catch(function(error) {
                expect(error).toEqual("Should not happen");
                done();
            });

    });
    it("lists the sampleData applications at /application", function(done) {
        client.api("system.api").get("/application")
            .then(function(reply) {
                expect(reply.response).toEqual("ok");
                expect(reply.entity).toEqual([]);
                done();
            }).catch(function(error) {
                expect(error).toEqual("Should not happen");
                done();
            });

    });

    ["/application/1234", "/user", "/system"].forEach(function(resource) {
        it("denies set on " + resource, function(done) {
            client.api("system.api").set(resource, {entity: "blah"})
                .then(function(reply) {
                    expect(reply).toEqual("Should not happen");
                    done();
                }).catch(function(error) {
                    expect(error.response).toEqual("badAction");
                    done();
                });
        });

        it("denies delete on " + resource, function(done) {
            client.api("system.api").delete(resource, {entity: "blah"})
                .then(function(reply) {
                    expect(reply).toEqual("Should not happen");
                    done();
                }).catch(function(error) {
                    expect(error.response).toEqual("badAction");
                    done();
                });
        });
    });
});
