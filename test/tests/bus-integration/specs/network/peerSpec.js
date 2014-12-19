describe("IWC Peer", function() {
    var peerA, linkA, otherContext;

    var otherContextOnLoad = function(){
        this.peerB = new ozpIwc.Peer();

        this.linkB = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: this.peerB
        });
    };
    var testPacket = function (link, size) {
        return ozpIwc.testUtil.networkPacketGenerator(link, ozpIwc.testUtil.dataGenerator(size));
    };

    beforeEach(function(){
        peerA = new ozpIwc.Peer();
        linkA = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: peerA
        });
        otherContext = new ozpIwc.testUtil.BrowsingContext(otherContextOnLoad, function (message, scope) {
            scope.peerB.send(message);
        });
    });

    afterEach(function(){
        peerA.events.off('receive',peerA.inj);
        peerA.inj = function(data){ };
        otherContext.iframe.parentNode.removeChild(otherContext.iframe);
    });

    describe("Basic Functionality",function() {

        it("sends packets", function (done) {
            var referencePacket = testPacket(linkA, 10);

            peerA.inj = function(packet){
                expect(packet.packet.data).toEqual(referencePacket);
                done();
            };
            peerA.events.on('receive',peerA.inj);

            otherContext.send(referencePacket);
        });
    });
    describe("Advanced Functionality",function(){

        it("shouldn't receive duplicates",function(done){
            peerA.inj = function(packet){
                expect(ozpIwc.metrics.counter('network.packets.dropped').get()).toEqual(0);
                done();
            };
            peerA.events.on('receive',peerA.inj);

            var referencePacket = testPacket(linkA,10);
            otherContext.send(referencePacket);
        });
    });
});