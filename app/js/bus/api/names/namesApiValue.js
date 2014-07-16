ozpIwc.NamesApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
    config=config || {};
    this.contentType=config.contentType;
    this.resource = config.resource;
    this.entity={};
});

ozpIwc.NamesApiValue.prototype.set=function(packet) {
    if(this.isValidContentType(packet.contentType)) {
        this.permissions=packet.permissions || this.permissions;
        this.contentType=packet.contentType;
        this.version++;
        if (packet.resource === '/address') {
            var address=packet.entity.address || packet.entity.electionAddress;
            var participantInfo = {
                type : packet.entity.participantType,
                address: packet.entity.electionAddress? packet.entity.electionAddress : packet.entity.address,
                name: packet.entity.name
            };
            this.entity[address]=participantInfo;
        }
    }
}