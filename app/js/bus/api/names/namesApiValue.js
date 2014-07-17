ozpIwc.NamesApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
    config=config || {};
    this.contentType=config.contentType;
    this.resource = config.resource;
    if (this.resource.indexOf('/address') === 0) {
        var id=this.addressId(this.resource);
        if (id) {
            this.entity={};
        } else {
            this.entity=[];
        }
    }
});

ozpIwc.NamesApiValue.prototype.set=function(packet) {
    if(this.isValidContentType(packet.contentType)) {
        this.permissions=packet.permissions || this.permissions;
        this.contentType=packet.contentType;
        if (packet.resource.indexOf('/address') === 0) {
            var id=this.addressId(packet.resource);
            if (id && packet.resource === '/address/' + id) {
                if (id === 'undefined') {
                    return;
                }
                var participantInfo = {
                    type : packet.entity.participantType,
                    address: packet.entity.electionAddress? packet.entity.electionAddress : packet.entity.address,
                    name: packet.entity.name
                };
                this.entity[id]=participantInfo;
                var node=ozpIwc.namesApi.findOrMakeValue({resource: '/address'});
                node.set({resource: '/address', entity: id})
                console.log("set id " + id);
            } else if (packet.resource === '/address') {
                console.log("add id " + packet.entity);
                this.entity.push(packet.entity);
            }
            this.version++;
        }
    }
}

ozpIwc.NamesApiValue.prototype.addressId=function(resource) {
    var regexp=/\/address\/(.*)/;
    var res=regexp.exec(resource);
    if (res && res.length > 1) {
        return res[1];
    }
    return null;
}