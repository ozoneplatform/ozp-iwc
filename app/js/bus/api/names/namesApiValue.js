ozpIwc.NamesApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
    config=config || {};
    this.namesApi=config.namesApi || ozpIwc.namesApi;
});

ozpIwc.NamesApiValue.prototype.set=function(packet) {
    if(this.isValidContentType(packet.contentType)) {
        this.permissions=packet.permissions || this.permissions;
        this.contentType=packet.contentType;
        if (this.resource) {
            if (this.resource.indexOf('/address') === 0) {
                var id = this.addressId(this.resource);
                if (id) {
                    if (id === 'undefined') {
                        return;
                    }
                    this.entity=this.entity || {};
                    var participantInfo = {
                        pType: packet.entity.participantType,
                        address: packet.entity.electionAddress ? packet.entity.electionAddress : packet.entity.address,
                        name: packet.entity.name
                    };
                    this.entity = participantInfo;
                    var node = this.namesApi.findOrMakeValue({resource: '/address'});
                    node.set({entity: id})
                } else if (this.resource === '/address') {
                    this.entity=this.entity || [];
                    this.entity.push(packet.entity);
                }
            } else {
                this.entity=packet.entity;
            }
            this.version++;
        }
    }
}

ozpIwc.NamesApiValue.prototype.deleteData=function(packet) {
    if (this.resource) {
        if (this.resource.indexOf('/address') === 0) {
            var id = this.addressId(this.resource);
            if (id) {
                var originalEntity=this.entity;
                ozpIwc.CommonApiValue.prototype.deleteData.apply(this,arguments);
                if (originalEntity) {
                    var node = this.namesApi.findOrMakeValue({resource: '/address'});
                    node.deleteData({entity: id})
                    this.version++;
                }
            } else {
                if (!this.entity) {
                    return;
                }
                var elementRemoved=false;
                this.entity=this.entity.filter(function(element) {
                    var keep=element !== packet.entity;
                    if (!keep) {
                        elementRemoved=true;
                    }
                    return keep;
                });
                if (elementRemoved){
                    var node = this.namesApi.findOrMakeValue({resource: '/address/'+packet.entity});
                    node.deleteData();
                    this.version++;
                }
            }
        } else {
            ozpIwc.CommonApiValue.prototype.deleteData.apply(this,arguments);
        }
    }
};

ozpIwc.NamesApiValue.prototype.addressId=function(resource) {
    var regexp=/\/address\/(.*)/;
    var res=regexp.exec(resource);
    if (res && res.length > 1) {
        return res[1];
    }
    return null;
};
