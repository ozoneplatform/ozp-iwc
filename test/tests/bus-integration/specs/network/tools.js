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
