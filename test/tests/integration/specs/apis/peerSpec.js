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
        entity: "test works"
    };

    var watchPacket = {
        dst: "keyValue.api",
        action: "watch",
        resource: "/test"
    };

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


    /**
     * @TODO Need to wait for peers to connect before watching can trigger (else test pass rate is sporadic)
     */
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
            }
            // returning truthy will cause callback to persist.
            return true;
        };

        clients[0].send(watchPacket, watchCallback);
        clients[0].send(setPacket);
    });


    it('limits packet History to ozpIwc.Peer.maxSeqIdPerSource', function(done) {
        var called = false;

        var peerCallback = function(event){
            if (!called) {
                called = true;
                var testValues = JSON.parse(event.data);
                var maxSeqIdPerSource = ozpIwc.Peer.maxSeqIdPerSource;
                var peer = ozpIwc.defaultPeer;
                expect(maxSeqIdPerSource).not.toBeLessThan(peer.packetsSeen.length);
                done();
            }
            return null;
        };

        var setCallback =  function(callback){
            clients[0].getPeer(peerCallback);
            return null;
        };
        for(var i = 0; i < 1010; i++){
            clients[0].send(setPacket, setCallback);
        }

    });

});
