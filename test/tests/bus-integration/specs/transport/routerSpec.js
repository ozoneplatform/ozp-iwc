describe("IWC Router", function () {
    var routerA, peerA, linkA, partA, otherContext;

    var otherContextOnLoad = function () {
        this.peerB = new ozpIwc.network.Peer();

        this.linkB = new ozpIwc.network.KeyBroadcastLocalStorageLink({
            peer: this.peerB
        });
        this.routerB = new ozpIwc.transport.Router({
            peer: this.peerB
        });
        this.partB = new ozpIwc.transport.participant.Internal();
        this.routerB.registerParticipant(this.partB);
    };

    beforeEach(function () {
        peerA = new ozpIwc.network.Peer();
        linkA = new ozpIwc.network.KeyBroadcastLocalStorageLink({
            peer: peerA
        });
        routerA = new ozpIwc.transport.Router({
            peer: peerA,
            heartbeatFrequency: 10000
        });
        otherContext = new ozpIwc.testUtil.BrowsingContext(otherContextOnLoad, function (message, scope) {
            if (message) {
                message = scope.partB.fixPacket(message);
                scope.partB.send(message);
            }
        });
        partA = new ozpIwc.transport.participant.Internal();
        routerA.registerParticipant(partA);
    });

    afterEach(function () {
        otherContext.iframe.parentNode.removeChild(otherContext.iframe);
    });

    describe("Basic Functionality", function () {
        it('routes messages from the peer', function (done) {
            var referencePacket = {dst: partA.address, entity: 3};
            partA.receiveFromRouterImpl = function (data) {
                if (data.packet.dst === partA.address) {
                    expect(data.packet.dst).toEqual(referencePacket.dst);
                    expect(data.packet.entity).toEqual(referencePacket.entity);
                    done();
                }
            };


            otherContext.send(referencePacket);
        });
    });
});