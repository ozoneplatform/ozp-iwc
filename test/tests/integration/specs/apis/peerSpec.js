/**
 * Multi-peer example.
 *
 */

/**
 * @TODO consider finding a cleaner way than chained callbacks to prepare the clients.
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
            console.log(clientRefs);
            done();
        });
    });

    afterEach(function () {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i]) {
                console.log(clients[i]);
                clients[i].disconnect();
                clients[i] = null;
            }
        }
    });

    it('can send from iframe', function (done) {
        var called = false;
        clients[0].send(watchPacket, function (reply) {
            if (reply.action === 'changed' && !called) {
                called = true;
                expect(reply.action).toEqual('changed');
                expect(reply.entity.newValue).toEqual(setPacket.entity);
                done();
            }
        });
        clients[1].send(setPacket);
    });


	it('can cancel callbacks', function() {
		var sentWatchPacket = clients[0].send(watchPacket, function(reply){
			expect(false).toEqual(true);
		});

		delete clients[0].replyCallbacks[sentWatchPacket.msgId];
		clients[1].send(setPacket);
	})

});
