describe("IWC LocalStorage Key Broadcast", function () {
    var peerA, linkA, otherContext;

    var otherContextOnLoad = function () {
        this.peerB = new ozpIwc.network.Peer();

        this.linkB = new ozpIwc.network.KeyBroadcastLocalStorageLink({
            peer: this.peerB
        });
    };

    beforeEach(function () {
        peerA = new ozpIwc.network.Peer();
        linkA = new ozpIwc.network.KeyBroadcastLocalStorageLink({
            peer: peerA
        });
        otherContext = new ozpIwc.testUtil.BrowsingContext(otherContextOnLoad, function (message, scope) {
            scope.linkB.send(message);
        });
    });

    afterEach(function () {
        otherContext.iframe.parentNode.removeChild(otherContext.iframe);
    });

    describe("Basic Functionality", function () {

        it("transfers messages through the browser storage event", function (done) {
            var referencePacket = ozpIwc.testUtil.testPacket(linkA, 10);

            spyOn(linkA.peer, 'receive').and.callFake(function (linkId, packet) {
                expect(packet).toEqual(referencePacket);
                done();
            });

            otherContext.send(referencePacket);
        });
    });
    describe("Advanced Functionality", function () {

        it("transfers fragments through the browser storage event", function (done) {
            var referencePacket = ozpIwc.testUtil.testPacket(linkA, 2 * 1024 * 1024);
            var size = JSON.stringify(referencePacket.data).length;
            var fragmentCount = Math.ceil(size / linkA.fragmentSize);

            spyOn(linkA.peer, 'receive').and.callFake(function (linkId, packet) {
                expect(packet.defragmented).toEqual(true);
                expect(packet.sequence).toEqual(fragmentCount - 1);
                expect(packet.data.data).toEqual(referencePacket.data.data);
                done();
            });

            otherContext.send(referencePacket);
        });

        xit("handles not parseable messages", function (done) {

            spyOn(ozpIwc.log, "error");


            var referencePacket = ozpIwc.testUtil.testPacket(linkA, 10);

            otherContext = new ozpIwc.testUtil.BrowsingContext(otherContextOnLoad, function (message, scope) {
                message = {
                    data: {
                        foo: this
                    }
                };
                scope.linkB.send(message);
            });
            otherContext.send(referencePacket);
        });
    });
});