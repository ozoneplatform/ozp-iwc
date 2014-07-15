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
        for (var i = 0; i < size; i ++) {
            result += chars.substr(Math.floor(Math.random() * 26), 1);
        }
        return result;
    };

    var packetGenerator = function(size) {
        return {
            dst: "data.api",
            action: "set",
            resource: "/001",
            entity: {
                foo: dataGenerator(size)
            }
        };
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
            //    clients[i].remove();
            }
        }
        clients = [];
    });

    it('can watch resources set by peers.', function (done) {
        var called = false;
        var watchPacket = {
            dst: "data.api",
            action: "watch",
            resource: "/0001"
        };

        var setPacket = {
            dst: "data.api",
            action: "set",
            resource: "/0001"
        };
        setPacket.entity = dataGenerator(10* 1024 * 1024 / 2 / 2 ); // 2.5mb

        var watchCallback = function (reply) {
            if (!called && reply.action === 'changed') {
                called = true;

                expect(reply.action).toEqual('changed');
                console.log(reply.entity.newValue.length + ' === '  + setPacket.entity.length);
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