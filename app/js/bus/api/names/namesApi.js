var ozpIwc=ozpIwc || {};

ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.NamesApi.prototype.makeValue = function(packet, participant){
    return new ozpIwc.NamesApiValue(
        {contentType: packet.contentType, entity: participant}
    );
};
