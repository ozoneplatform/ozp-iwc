var ozpIwc=ozpIwc || {};

ozpIwc.SystemApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.SystemApi.prototype.makeValue = function(packet){
    return new ozpIwc.SystemApiValue({resource: packet.resource, contentType: packet.contentType});
};

ozpIwc.SystemApi.prototype.isPermitted=function(node,packetContext) {
    if (packetContext.packet.action==='set' || packetContext.packet.action==='delete') {
        this.permissions.modifyAuthority='apiLoader';
    } else {
        delete this.permissions.modifyAuthority;
    }
    ozpIwc.CommonApiBase.prototype.isPermitted.apply(this,arguments);
}
