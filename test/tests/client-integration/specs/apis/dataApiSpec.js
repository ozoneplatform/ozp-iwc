describe("Data Api", function () {
    var client, client2, dataApi, dataApi2;
    var BUS_URL = "http://" + window.location.hostname + ":14002";

    beforeAll(function (done) {
        client = new ozpIwc.Client({peerUrl: BUS_URL});
        client.connect().then(function () {
            dataApi = client.data();
            done();
        });
    });

    afterEach(function (done) {
        dataApi.list('/').then(function (resp) {
            var packets = [];
            var resources = resp.entity || [];
            resources.forEach(function (resource) {
                packets.push(dataApi.messageBuilder.delete(resource));
            });
            dataApi.bulkSend(packets).then(function () {
                Promise.all(packets).then(function () {
                    done();
                });
            });
        });
    });


    describe("general", function () {

        pit('Sets values to the data api', function () {
            return dataApi.set('/test', {entity: "testData"}).then(function (packet) {
                expect(packet.response).toEqual('ok');
            });
        });

        pit('Gets the contents of the data api', function () {
            return dataApi.set('/test', {entity: "testData"}).then(function (packet) {
                return dataApi.get('/test');
            }).then(function (packet) {
                expect(packet.response).toEqual('ok');
            });
        });

        pit("responds to a bulk get with matching entities", function () {
            var packetOne = {'resource': "/family", 'entity': "value1"};
            var packetTwo = {
                'resource': "/family_a",
                'entity': "value2",
                'contentType': "application/vnd.ozp-iwc-data-object+json;version=2"
            };
            var packetThree = {'resource': "/family_b", 'entity': "value3"};
            var packetFour = {'resource': "/notfamily", 'entity': "value4"};

            return dataApi.set(packetOne.resource, {entity: packetOne.entity}).then(function () {
                return dataApi.set(packetTwo.resource, {
                    'entity': packetTwo.entity,
                    'contentType': packetTwo.contentType
                });
            }).then(function () {
                return dataApi.set(packetThree.resource, {'entity': packetThree.entity});
            }).then(function () {
                return dataApi.set(packetFour.resource, {'entity': packetFour.entity});
            }).then(function () {
                return dataApi.bulkGet("/family");
            }).then(function (reply) {
                expect(reply.response).toEqual("ok");
                expect(reply.entity.length).toEqual(3);
                expect(reply.entity[0]).toEqual(jasmine.objectContaining(packetOne));
                expect(reply.entity[1]).toEqual(jasmine.objectContaining(packetTwo));
                expect(reply.entity[2]).toEqual(jasmine.objectContaining(packetThree));
            })['catch'](function (error) {
                expect(error).toEqual('not have happened');
            });
        });

        pit('[Meta] data api is cleaned up after every run', function () {
            return client.data().get('/family').catch(function (error) {
                expect(error.response).toEqual("noResource");
            });
        });
    });

    describe("client interaction", function () {
        beforeAll(function (done) {
            client2 = new ozpIwc.Client({peerUrl: BUS_URL, autoConnect: false});
            client2.connect().then(function () {
                dataApi2 = client2.data();
                done();
            });
        });

        afterAll(function () {
            client2.disconnect();
            client2 = undefined;
        });

        pit('sets a value visible to other clients', function () {
            var entity = {'foo': 1};
            return dataApi.set('/test', {entity: entity}).then(function (resp) {
                return dataApi2.get('/test');
            }).then(function (reply) {
                expect(reply.entity).toEqual(entity);
            });
        });

        it('setting a value generates a change to other clients', function (done) {
            var entity = {'foo': 1};
            dataApi.watch('/test2', function (reply, dn) {
                expect(reply.entity.newValue).toEqual(entity);
                expect(reply.entity.oldValue).toBeUndefined();
                expect(reply.entity.newCollection).toEqual([]);
                expect(reply.entity.oldCollection).toEqual([]);
                dn();
                done();
            }).then(function (reply) {
                expect(reply.response).toEqual("ok");
                expect(reply.collection).toBeUndefined();
                expect(reply.entity).toBeUndefined();
                dataApi2.set('/test2', {'entity': entity});
            });
        });
        pit("can delete a value set by someone else", function () {

            return dataApi.set('/test', {'entity': {'foo': 1}}).then(function () {
                return dataApi.get('/test');
            }).then(function (reply) {
                expect(reply.entity).toEqual({"foo": 1});
                return dataApi2.delete('/test');
            }).then(function (reply) {
                expect(reply.response).toEqual("ok");
                return dataApi.get('/test');
            })['catch'](function (error) {
                expect(error.response).toEqual("noResource");
            });
        });
    });

    describe("Collections", function () {
        pBeforeEach(function () {
            return dataApi.set("/tester", {entity: 123}).catch(function (e) {
                expect(e).toNotHappen();
            });
        });

        pit('Each resource has a collection property', function () {
            return dataApi.get('/tester').then(function (response) {
                expect(response.collection).toEqual([]);
            });
        });

        pit('Each resource updates its collection property if it has a child added to it', function () {
            var response;
            return dataApi.addChild('/tester', {entity: 456}).then(function (resp) {
                response = resp;
                return dataApi.get('/tester');
            }).then(function (reply) {
                expect(reply.collection.length).toEqual(1);
                expect(reply.collection).toEqual([response.entity.resource]);
            });
        });
        pit('Each resource updates its collection property if it has children added to it', function () {
            var response1, response2;
            return dataApi.addChild('/tester', {entity: 456}).then(function (resp) {
                response1 = resp;
                return dataApi.addChild('/tester', {entity: 456});
            }).then(function (resp) {
                response2 = resp;
                return dataApi.get('/tester');
            }).then(function (reply) {
                expect(reply.collection.length).toEqual(2);
                expect(reply.collection).toEqual([response1.entity.resource, response2.entity.resource]);
            });
        });

        pit('Each resource updates its collection property if it has children removed to it', function () {
            var response;
            return dataApi.addChild('/tester', {entity: 456}).then(function (resp) {
                response = resp;
                return dataApi.get('/tester');
            }).then(function (reply) {
                expect(reply.collection.length).toEqual(1);
                expect(reply.collection).toEqual([response.entity.resource]);
                return dataApi.removeChild('/tester', {entity: {resource: response.entity.resource}});
            }).then(function () {
                return dataApi.get('/tester');
            }).then(function (reply) {
                expect(reply.collection).toEqual([]);
            });
        });

        pit('A resource only updates if a child was added not a subresource being set.', function () {
            return dataApi.set('/tester/123', {entity: 123}).then(function () {
                return dataApi.get('/tester');
            }).then(function (reply) {
                expect(reply.collection).toEqual([]);
            });
        });
        pit('A watched resource does not collect if collect is not set', function () {
            var resolve, reject;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            dataApi.get('/tester').then(function (response) {
                expect(response.pattern).toEqual("/tester/");
                return dataApi.watch('/tester', function (reply) {
                    if (reply.entity.newCollection){
                        reject(reply);
                    }
                });
            }).then(function () {
                dataApi.set('/tester/123', {entity: 123});
            });

            window.setTimeout(function () {
                expect(true).toEqual(true);
                resolve();
            }, 1000);
            return promise;


        });
        it('A watched resource collects if set to collect', function (done) {
            var resource = '/tester/123';
            client.data().set('/tester', {collect: true}).then(function (response) {
                return client.data().watch('/tester', function (reply, clearCB) {
                    expect(reply.entity.newCollection).toEqual([resource]);
                    expect(reply.entity.oldCollection).toEqual([]);
                    clearCB();
                    done();
                });
            }).then(function () {
                return client.data().set(resource, {entity: 123});
            });
        });

        pit('Collect on a resource returns the nodes matching its pattern.', function(){
            return client.data.set("/tester/123", {entity: 123})
                    .then(function(){
                        return client.data.collect("/tester");
                    }).then(function(response){
                        expect(response.entity.length).toEqual(1);
                        expect(response.entity[0].resource).toEqual("/tester/123");
                        expect(response.resource).toEqual("/tester");
                        expect(response.pattern).toEqual("/tester/");
                    });
        });

        pit('Collect on a resource returns the nodes matching its custom pattern.', function(){
            return client.data.set("/tester/123", {entity: 123})
                    .then(function(){
                        return client.data.collect("/tester", {pattern: "/"});
                    }).then(function(response){
                        expect(response.entity.length).toEqual(2);
                        expect(response.entity[0].resource).toEqual("/tester");
                        expect(response.entity[1].resource).toEqual("/tester/123");
                        expect(response.resource).toEqual("/tester");
                        expect(response.pattern).toEqual("/");
                    });
        });
    });

    describe("References", function() {
        var fooRef;

        beforeEach(function(){
            fooRef = new client.data.Reference("/foo");
        });

        pit("can set a value through a reference.",function(){
            return fooRef.set("THIS").then(function(){
                return client.data.get("/foo");
            }).then(function(resp){
                expect(resp.entity).toEqual("THIS");
            });
        });

        pit("can get a value through a reference.",function(){
            return client.data.set("/foo",{entity:"THAT"}).then(function(){
                return fooRef.get("/foo");
            }).then(function(entity){
                expect(entity).toEqual("THAT");
            });
        });

        it("can watch a value through a reference",function(done){
            fooRef.watch(function(entity,stop){
                expect(entity.newValue).toEqual("DONE");
                stop();
                done();
            });

            client.data.set("/foo",{entity: "DONE"});
        });

        it("can delete a value through a reference", function(done){
            fooRef.set("THIS")
                  .then(fooRef.delete)
                  .then(fooRef.get)
                  .catch(function(err){
                    expect(err).toEqual("noResource");
                    done();
                });
        });

        pit("can collect children resources through a reference",function(){
            return fooRef.addChild("value1")
                  .then(fooRef.collect)
                  .then(function(children){
                      expect(children.length).toEqual(1);
                      expect(children[0].entity).toEqual("value1");
                  });
        });
        describe("Config", function(){
            describe("fullResponse",function(){
                pit("defaults to only getting the entity back in a promise resolution", function(){
                        return fooRef.set("TEST")
                                     .then(function(){
                                         return fooRef.get();
                                     })
                                     .then(function(value){
                                         expect(value).toEqual("TEST");
                                     });
                });

                pit("defaults to only getting the reason back in a promise rejection", function(){
                        return fooRef.get()
                                     .catch(function(reason){
                                         expect(reason).toEqual("noResource");
                                     });
                });

                pit("gets full packet promise resolutions with fullResponse config", function(){
                    fooRef = new client.data.Reference("/foo",{fullResponse: true});
                        return fooRef.set("TEST")
                                     .then(fooRef.get)
                                     .then(function(value){
                                         expect(value.entity).toEqual("TEST");
                                     });
                });

                pit("gets full packet promise rejections with fullResponse config", function(){
                    fooRef = new client.data.Reference("/foo",{fullResponse: true});
                        return fooRef.get()
                                     .catch(function(value){
                                         expect(value.response).toEqual("noResource");
                                     });
                });
                pit("can modify the fullResponse settings with updateDefaults", function(){
                    return fooRef.set("TEST").then(function(value){
                        expect(value).toEqual("TEST");
                        fooRef.updateDefaults({fullResponse:true});
                        return fooRef.get();
                    }).then(function(value){
                        expect(value.entity).toEqual("TEST");
                    });
                });
            });

            describe("fullCallback",function(){
                it("defaults to only getting the entity back in a callback", function(done){
                    return fooRef.watch(function(val, stop){
                        expect(val.newValue).toEqual("TEST");
                        stop();
                        done();
                    }).then(function(){
                         return fooRef.set("TEST");
                    });
                });

                pit("gets full packet callbacks with fullCallback config", function(){
                    fooRef = new client.data.Reference("/foo",{fullResponse: true});
                    return fooRef.watch(function(val, stop){
                        expect(val.entity.newValue).toEqual("TEST");
                        stop();
                        done();
                    }).then(function(){
                         return fooRef.set("TEST");
                    });
                });
            });
            describe("collect", function(){
                it("by default a reference doesn't notify its watch of collection change if not configured", function(done){
                    fooRef.watch(function(change,stop){
                        expect("this").toEqual("not happen.");
                        stop();
                    });

                    fooRef.addChild("TEST")
                        .then(fooRef.collect)
                        .then(function(collection){
                            expect(collection.length).toEqual(1);
                        });

                    window.setTimeout(function(){
                        expect(true).toEqual(true);
                        done();
                    },1000);
                });

                it("notifies a references watch of collection changes if configured", function(done){
                    fooRef.updateDefaults({collect:true});

                    fooRef.watch(function(change,stop){
                        expect(change.newCollection.length).toEqual(1);
                        expect(change.oldCollection.length).toEqual(0);
                        stop();
                        done();
                    });

                    fooRef.addChild("TEST")
                        .then(fooRef.collect)
                        .then(function(collection){
                            expect(collection.length).toEqual(1);
                        });

                });

                it("disables watch updates about collections if collect is disabled",function(done){


                    var testDisableCollect = function(){
                        fooRef.updateDefaults({collect:false});
                        fooRef.watch(function(noCollectionChange, stop){
                            expect("this").toEqual("not happen.");
                            stop();
                            done();
                        });
                        window.setTimeout(function(){
                            expect(true).toEqual(true);
                            done();
                        },1000);
                    };

                    fooRef.updateDefaults({collect:true});

                    fooRef.watch(function(change,stop){
                        expect(change.newCollection.length).toEqual(1);
                        expect(change.oldCollection.length).toEqual(0);
                        stop();
                        testDisableCollect();
                    });

                    fooRef.addChild("TEST")
                        .then(fooRef.collect)
                        .then(function(collection){
                            expect(collection.length).toEqual(1);
                        });
                });

                pit("reference starts the resource collecting if set true", function(){

                    fooRef = new client.data.Reference("/foo",{
                        fullResponse: true,
                        collect:true
                    });
                    return fooRef.addChild("TEST")
                        .then(fooRef.get)
                        .then(function(response){
                            expect(response.collection.length).toEqual(1);
                        });
                });
            });
        });
    });

});
