/**
 * Multi-peer example.
 *
 */

describe('Participant Integration', function () {
    var clients = [];

    var setPacket = {
        dst: "keyValue.api",
        action: "set",
        resource: "/test",
        entity: "test works",
        test: true
    };

    var watchPacket = {
        dst: "keyValue.api",
        action: "watch",
        resource: "/test"
    };

    var maxPacketsPerSource=function(packetsSeen) {
        var maxPackets=0;
        for (var seqIds in packetsSeen) {
            if (seqIds.length>maxPackets) {
                maxPackets=seqIds.length;
            }
        }
        return maxPackets;
    }

    beforeEach(function (done) {
        var clientGen = {
            clientCount: 2,
            clientUrl: "http://localhost:14000/integration/additionalOrigin.html"
        };
        generateClients(clientGen, function (clientRefs) {
            clients = clientRefs;
            done();
        });
    });

    afterEach(function () {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i]) {
                clients[i].disconnect();
                clients[i] = null;
            }
        }
    });


    it('can watch resources set by peers.', function (done) {
        var called = false;

        var watchCallback = function (reply) {
            if (!called && reply.action === 'changed') {
                called = true;

                expect(reply.action).toEqual('changed');
                expect(reply.entity.newValue).toEqual(setPacket.entity);

                done();
                // returning falsy will cause callback to not persist.
                return null;

            } else if (reply.action === 'success'){
                clients[1].send(setPacket);
            }

            // returning truthy will cause callback to persist.
            return true;
        };

        clients[0].send(watchPacket, watchCallback);
    });


    it('limits packet History to ozpIwc.Peer.maxSeqIdPerSource', function(done) {
        var called = false;

        var testBusCallback = function(event){
            if (!called) {
                called = true;

                var testValues = event.data;
                expect(testValues.maxSeqIdPerSource).not.toBeLessThan(maxPacketsPerSource(testValues.packetsSeen));

                done();
                //testBus callbacks can also be persistent if returned truthy. Return falsy for non-persistent.
                return null;
            }
        };

        var sendCount=0;
        var setCallback =  function(callback){
            clients[0].getTestBus(testBusCallback);
            if (sendCount++<=1010) {
                clients[0].send(setPacket, setCallback);
            }
            return null;
        };

        clients[0].send(setPacket, setCallback);
    });
});
