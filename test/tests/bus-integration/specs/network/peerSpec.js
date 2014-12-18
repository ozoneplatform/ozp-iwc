describe("IWC Peer", function() {

    var otherContextOnLoad = function () {
        this.peerB = new ozpIwc.Peer();

        this.linkB = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: this.peerB
        });
    };

    var peerA, linkA, otherContext;

    beforeEach(function () {
        peerA = new ozpIwc.Peer();

        linkA = new ozpIwc.KeyBroadcastLocalStorageLink({
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
        it("shouldn't receive duplicates",function(){
            peerA.events.on('receive',function(){
                expect(ozpIwc.metrics.counter('network.packets.dropped').get()).toEqual(0);
            });

            var referencePacket = ozpIwc.testUtil.testPacket(linkA, 10);
            otherContext.send(referencePacket);
        });
        it("sends packets",function(){

        });

    });

    describe("Advanced Functionality", function () {

    });
});