/**
 * Sending large data
 *
 */

describe('Packet Fragment Integration', function () {
    var clients = [];

    // Generates a string of random data
    var dataGenerator = function (size) {
        var result = "";
        var chars = "abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < size; i++) {
            result += chars.substr(Math.floor(Math.random() * 26), 1);
        }
        return result;
    };

    var setPacket = {
        dst: "data.api",
        action: "set",
        resource: "/0001",
        test: true
    };

    var watchPacket = {
        dst: "data.api",
        action: "watch",
        resource: "/0001",
        test: true
    };

    beforeEach(function (done) {
        var clientGen = {
            clientUrl: "http://localhost:14000/integration/additionalOrigin.html"
        };
        var clientCount = 0;
        var numClients = 2;
        var called = false;

        for (var i = 0; i < numClients; i++) {
            generateClient(clientGen, function (client) {
                clients.push(client);
                clientCount++;
                // Wait until
                if (clientCount == numClients && !called) {
                    called = true;
                    done();
                }
            });
        }
    });

    afterEach(function () {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i]) {
                clients[i].remove();
            }
        }
        clients = [];
    });

    it('packets are not fragmented/defragmented if smaller than fragmentSize', function (done) {
        var called = false;
        setPacket.entity = {
            foo: dataGenerator(1 * 1024 * 1024 / 2) // 1mb
        };

        var echoCallback = function (event) {
            if (event.echo && !called) {
                called = true;
                expect(event.defragmented).toEqual(false);
                done();
            }
        };

        clients[0].on("receive", echoCallback);
        clients[0].send(setPacket);
    });

    it('packets are fragmented/defragmented if larger than fragmentSize', function (done) {
        var called = false;
        setPacket.entity = {
            foo: dataGenerator(3 * 1024 * 1024 / 2) // 3mb
        };

        var echoCallback = function (event) {
            if (event.echo && !called) {
                console.log(event);
                called = true;
                expect(event.defragmented).toEqual(true);
                done();
            }
        };

        clients[0].on("receive", echoCallback);
        clients[0].send(setPacket);
    });


    it('sends/receives packets smaller than fragmentSize', function (done) {

        var called = false;
        setPacket.entity = {
            foo: dataGenerator(1024 / 2) // 1kb
        };
        var watchCallback = function (reply) {
            console.log(reply);
            if (!called && reply.action === 'changed') {
                called = true;
                expect(reply.action).toEqual('changed');
                expect(reply.entity.newValue).toEqual(setPacket.entity);

                done();
                // returning falsy will cause callback to not persist.
                return null;


            } else if (reply.action === 'ok') {
                clients[1].send(setPacket);
            }
            // returning truthy will cause callback to persist.
            return true;
        };

        clients[0].send(watchPacket, watchCallback);
    });

    it('sends/receives packets larger than fragmentSize', function (done) {

        var called = false;
        setPacket.entity = {
            foo: dataGenerator(3 * 1024 * 1024 / 2 / 2)// 3mb
        };

        var watchCallback = function (reply) {
            console.log(reply);
            if (!called && reply.action === 'changed') {
                called = true;
                expect(reply.action).toEqual('changed');
                expect(reply.entity.newValue).toEqual(setPacket.entity);

                done();
                // returning falsy will cause callback to not persist.
                return null;


            } else if (reply.action === 'ok') {
                clients[1].send(setPacket);
            }
            // returning truthy will cause callback to persist.
            return true;
        };

        clients[0].send(watchPacket, watchCallback);
    });

});