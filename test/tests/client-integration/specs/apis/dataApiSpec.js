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

        pit ('Gets the contents of the data api', function() {
            return dataApi.set('/test', {entity: "testData"}).then(function (packet) {
                return dataApi.get('/test');
            }).then(function (packet) {
                expect(packet.response).toEqual('ok');
            });
        });

        pit("responds to a bulk get with matching entities", function () {
            var packetOne = {'resource': "/family", 'entity': "value1"};
            var packetTwo = {'resource': "/family_a", 'entity': "value2", 'contentType': "application/vnd.ozp-iwc-data-object+json;version=2"};
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

        pit('[Meta] data api is cleaned up after every run',function() {
            return client.data().get('/family').catch(function(error) {
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

    describe("Collections",function(){
        pBeforeEach(function(){
            return dataApi.set("/tester",{entity:123}).catch(function(e){
                expect(e).toNotHappen();
            });
        });

        pit('Each resource has a collection property',function(){
            return dataApi.get('/tester').then(function(response){
                expect(response.collection).toEqual([]);
            });
        });

        pit('Each resource updates its collection property if it has a child added to it',function(){
            var response;
            return dataApi.addChild('/tester',{entity:456}).then(function(resp) {
                response = resp;
                return dataApi.get('/tester');
            }).then(function(reply){
                expect(reply.collection.length).toEqual(1);
                expect(reply.collection).toEqual([response.entity.resource]);
            });
        });
        pit('Each resource updates its collection property if it has children added to it',function(){
            var response1,response2;
            return dataApi.addChild('/tester',{entity:456}).then(function(resp) {
                response1 = resp;
                return dataApi.addChild('/tester', {entity: 456});
            }).then(function(resp){
                response2 = resp;
                return dataApi.get('/tester');
            }).then(function(reply){
                expect(reply.collection.length).toEqual(2);
                expect(reply.collection).toEqual([response1.entity.resource,response2.entity.resource]);
            });
        });

        pit('Each resource updates its collection property if it has children removed to it',function(){
            var response;
            return dataApi.addChild('/tester',{entity:456}).then(function(resp) {
                response = resp;
                return dataApi.get('/tester');
            }).then(function(reply){
                expect(reply.collection.length).toEqual(1);
                expect(reply.collection).toEqual([response.entity.resource]);
                return dataApi.removeChild('/tester',{entity:{resource: response.entity.resource}});
            }).then(function(){
                return dataApi.get('/tester');
            }).then(function(reply){
                expect(reply.collection).toEqual([]);
            });
        });

        pit('A resource only updates if a child was added not a subresource being set.',function(){
            return dataApi.set('/tester/123', {entity:123}).then(function(){
                return dataApi.get('/tester');
            }).then(function(reply){
                expect(reply.collection).toEqual([]);
            });
        });
        pit('A watched resource does not collect if it does not have a pattern',function(){
            var resolve,reject;
            var promise = new Promise(function(res,rej){
                resolve = res;
                reject = rej;
            });
            dataApi.get('/tester').then(function(response){
                expect(response.pattern).toBeUndefined();
                return dataApi.watch('/tester',function(reply){
                    reject(reply);
                });
            }).then(function(){
                dataApi.set('/tester/123',{entity:123});
            });

            window.setTimeout(function(){
                expect(true).toEqual(true);
                resolve();
            },1000);
            return promise;


        });
        it('A watched resource collects if it has a pattern',function(done){
            var resource = '/tester/123';
            client.data().set('/tester',{pattern: '/tester/'}).then(function(response){
                return client.data().watch('/tester',function(reply,clearCB){
                    expect(reply.entity.newCollection).toEqual([resource]);
                    expect(reply.entity.oldCollection).toEqual([]);
                    clearCB();
                    done();
                });
            }).then(function(){
                return client.data().set(resource,{entity:123});
            });
        });
    });

});