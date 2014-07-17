var ozpIwc=ozpIwc || {};

ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.NamesApi.prototype.makeValue = function(packet){
    return new ozpIwc.NamesApiValue({resource: packet.resource, contentType: packet.contentType});
};
