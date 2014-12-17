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
            testing: true,
            srcPeer: ozpIwc.util.generateId(),
            data: transportPacket
        };
    };

    var testPacket = function(link,size){
        return networkPacketGenerator(link,transportPacketGenerator(dataGenerator(size)));
    };

    var otherContextOnLoad = function(){
        ozpIwc.heartBeatFrequency= 100000; // 100 seconds
        this.peerB = new ozpIwc.Peer();

        this.linkB = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: this.peerB
        });
        console.log("ok");
    };
    var peerA, linkA, otherContext;

    beforeEach(function(){
        peerA = new ozpIwc.Peer();

        linkA = new ozpIwc.KeyBroadcastLocalStorageLink({
            peer: peerA
        });

    });

    describe("Basic Functionality",function(){
        it("sends and receives between two links",function(done){
            linkA.peer.receive = function(linkId, packet){

                if(packet.testing){
                    expect(packet.data).toEqual(referencePacket.data);
                    done();
                }
            };

            var referencePacket = testPacket(linkA,10);
            otherContext = new ozpIwc.browsingContext(otherContextOnLoad,function(message,scope){
                console.log(message);
                if(message.data.testing) {
                    this.linkB.send(message.data);
                }
            });
            otherContext.send(referencePacket);
        });
    });
});