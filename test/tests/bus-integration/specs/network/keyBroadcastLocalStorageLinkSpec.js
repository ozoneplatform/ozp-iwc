describe("IWC LocalStorage Key Broadcast", function() {

    var dataGenerator = function (size) {
        var result = "";
        var chars = "abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < size; i++) {
            result += chars.substr(Math.floor(Math.random() * 26), 1);
        }
        return result;
    };

    var transportPacketGenerator = function (entity) {
        return {
            msgId: ozpIwc.util.generateId(),
            entity: entity
        };
    };

    var networkPacketGenerator = function (link,transportPacket) {
        return {
            sequence: link.peer.sequenceCounter++,
            srcPeer: ozpIwc.util.generateId(),
            data: transportPacket,
            ver:0,
            src: "testSrc",
            dst: "testDst",
            msgId: "i:0"
        };
    };

    var testPacket = function(link,size){
        return networkPacketGenerator(link,transportPacketGenerator(dataGenerator(size)));
    };

    var otherContextOnLoad = function(){
        this.peerB = new ozpIwc.Peer();

        this.linkB = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: this.peerB
        });
    };

    var peerA, linkA, otherContext;

    beforeEach(function(){
        peerA = new ozpIwc.Peer();

        linkA = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: peerA
        });
    });

    afterEach(function(){
        otherContext.iframe.remove();
    });

    describe("Basic Functionality",function() {

        it("transfers messages through the browser storage event", function (done) {

            var referencePacket = testPacket(linkA, 10);
            spyOn(linkA.peer,'receive').and.callFake(function(linkId,packet){
                expect(packet).toEqual(referencePacket);
                done();
            });

            otherContext = new ozpIwc.browsingContext(otherContextOnLoad, function (message, scope) {
                scope.linkB.send(message);
            });
            otherContext.send(referencePacket);
        });
    });
    describe("Advanced Functionality",function(){

        it("transfers fragments through the browser storage event",function(done){

            var referencePacket = testPacket(linkA,10*1024*1024);
            var size = JSON.stringify(referencePacket.data).length;
            var fragmentCount = Math.ceil(size/linkA.fragmentSize);

            spyOn(linkA.peer,'receive').and.callFake(function(linkId,packet){
                expect(packet.defragmented).toEqual(true);
                expect(packet.sequence).toEqual(fragmentCount -1);
                expect(packet.data.data).toEqual(referencePacket.data.data);
                done();
            });

            otherContext = new ozpIwc.browsingContext(otherContextOnLoad,function(message,scope){
                scope.linkB.send(message);
            });

            otherContext.send(referencePacket);
        });
    });
});