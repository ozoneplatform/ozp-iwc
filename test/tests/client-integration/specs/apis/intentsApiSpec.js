describe("Intents Api", function () {
    var client, intentsApi;
    var BUS_URL = "http://" + window.location.hostname + ":14002";
    var registerEntity = {
        type: "text/plain",
        action: "view",
        icon: "http://example.com/view-text-plain.png",
        label: "View Plain Text",
        invokeIntent: "system.api/application/123-412"
    };

    beforeAll(function (done) {
        client = new ozpIwc.Client({peerUrl: BUS_URL});
        client.connect().then(function () {
            intentsApi = client.intents();
            done();
        });
    });

    afterEach(function (done) {
        intentsApi.list('/').then(function (resp) {
            var packets = [];
            var resources = resp.entity || [];
            resources.forEach(function (resource) {
                packets.push(intentsApi.messageBuilder.delete(resource));
            });
            intentsApi.bulkSend(packets).then(function () {
                Promise.all(packets).then(function () {
                    done();
                });
            });
        });
    });


    pit('registers handlers', function () {
        return intentsApi.register('/text/plain/view', {
            entity: registerEntity
        }).then(function (reply) {
            expect(reply.response).toEqual('ok');
            expect(reply.entity.resource).toMatch('/text/plain/view');
        });
    });

    pit('uses sane defaults to register handlers', function () {
        return intentsApi.register('/text/plain/view', {
            entity: {
                type: "text/plain",
                action: "view",
                icon: "http://example.com/view-text-plain.png",
                label: "View Plain Text"
            }
        }).then(function (reply) {
            expect(reply.response).toEqual('ok');
            expect(reply.entity.resource).toMatch('/text/plain/view');
            return intentsApi.get(reply.entity.resource);
        }).then(function (reply) {
            expect(reply.response).toEqual("ok");
            // What is returned needs to be tested.
//            expect(reply.entity.invokeIntent).toBeDefined();
//            expect(reply.entity.invokeIntent.dst).toEqual(client.address);
//            expect(reply.entity.invokeIntent.resource).toMatch("/intents/text/plain/view");
//            expect(reply.entity.invokeIntent.replyTo).toBeDefined();
//            expect(reply.entity.invokeIntent.action).toEqual("invoke");
        }).catch(function (er) {
            console.log(er);
        });
    });

    pit('deletes handlers', function () {
        return intentsApi.register('/text/plain/view', {
            entity: registerEntity
        }).then(function (reply) {
            return intentsApi.delete(reply.entity.resource);
        }).then(function (reply) {
            expect(reply.response).toEqual('ok');
        });
    });

    it('invokes handler directly', function (done) {
        return intentsApi.register('/text/plain/view', {
            entity: {
                type: "text/plain",
                action: "view",
                icon: "http://example.com/view-text-plain.png",
                label: "View Plain Text",
                invokeIntent: {
                    dst: client.address,
                    resource: "/text/plain/view",
                    action: "intentsInvocation"
                }
            }
        }, function (responce) {
            console.log("Handler received packet ", responce);
            expect(responce.entity).toEqual("This is some text");
            expect(responce.intent.type).toEqual("text/plain");
            expect(responce.handler.resource).toMatch("/text/plain/view");
            done();
        }).then(function (reply) {
            console.log("Handler is registered: ", reply);
            expect(reply.response).toEqual('ok');
            expect(reply.entity.resource).toMatch('/text/plain/view');

            return intentsApi.invoke(reply.entity.resource, {
                contentType: "text/plain",
                entity: "This is some text"
            });
        });
    });

    pit("returns the error message to the invoker if failed to be handled.", function(){
        var err;
        return intentsApi.register('/foo/bar/buz', function(resp){
            err = new Error("This.is an error.");
            throw err;
        }).then(function(){
            return intentsApi.invoke("/foo/bar/buz");
        }).catch(function(response){
            expect(response.entity).toEqual(err.toString());
            expect(response.response).toEqual("noResult");
        });
    });

    describe("References",function(){
        var intentRef;
        var intentFn;
        var input;

        beforeEach(function(){
            intentRef = new intentsApi.Reference("/foo/bar/buz");
            input = "HELLO WORLD";
        });

        it("References can register", function(done){
            intentFn = function(val){
                expect(val).toEqual(input);
                done();
            };

            intentRef.register(intentFn)
                     .then(function(){
                         intentsApi.invoke("/foo/bar/buz",{entity: input});
                     });
        });

        it("can invoke", function(done){
            intentFn = function(val){
                expect(val.entity).toEqual(input);
                done();
            };

            intentsApi.register("/foo/bar/buz",intentFn)
                     .then(function(){
                         intentRef.invoke(input);
                     });
        });

        it("can register and invoke", function(done){
            intentFn = function(val){
                expect(val).toEqual(input);
                done();
            };

            intentRef.register(intentFn)
                     .then(function(val){
                         return intentRef.invoke(input);
                     });
        });
    });
});
