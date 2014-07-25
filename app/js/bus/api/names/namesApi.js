var ozpIwc=ozpIwc || {};

ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.NamesApi.prototype.makeValue = function(packet){
    return new ozpIwc.NamesApiValue({resource: packet.resource, contentType: packet.contentType, namesApi: this});
};

ozpIwc.NamesApi.prototype.findOrMakeValue=function(packet) {
    if (packet.resource==='/me') {
        packet.resource='/address/'+packet.src;
    }
    var node=this.data[packet.resource];

    if(!node) {
        node=this.data[packet.resource]=this.makeValue(packet);
    }
    return node;
};