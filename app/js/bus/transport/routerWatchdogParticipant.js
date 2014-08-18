/**
 * @class
 */
ozpIwc.RouterWatchdog=ozpIwc.util.extend(ozpIwc.InternalParticipant,function(config) {
    ozpIwc.InternalParticipant.apply(this,arguments);

    this.participantType="routerWatchdog";
    var self=this;
    this.on("connected",function() {
        this.name=this.router.self_id;
    },this);

    this.heartbeatFrequency=config.heartbeatFrequency || 10000;
    var self=this;

    this.timer=window.setInterval(function() {
        var heartbeat={
            dst: "names.api",
            action: "set",
            resource: "/router/" + self.router.self_id,
            entity: { participants: {} }
        };
        for(var k in self.router.participants) {
            heartbeat.entity.participants[k]=self.router.participants[k].heartbeatStatus();
        }
        self.send(heartbeat);
    },this.heartbeatFrequency);
    
    this.on("connected",this.setupWatches,this);
});

ozpIwc.RouterWatchdog.prototype.setupWatches=function() {
    this.name=this.router.self_id;
    var self=this;

    //register the router watchdog with the names api service
    var value = ozpIwc.namesApi.findOrMakeValue({resource: '/address/' + self.address, contentType: "ozp-address-collection-v1+json"});
    var packet = {
        src: self.address,
        entity: self,
        dst: "names.api"
    };
    value.set(packet);

    //register other participants with the names api service
    this.router.on("registeredParticipant", function(event) {
        var pAddress=event.participant.address || event.participant.electionAddress;
        if (!pAddress) {
            return;
        }
        var value = ozpIwc.namesApi.findOrMakeValue({resource: '/address/' + pAddress, contentType: "ozp-address-object-v1+json"});
        var packet = {
            src: pAddress,
            entity: event.participant,
            dst: "names.api"
        };
        value.set(packet);
    });

    //register multicast group memberships with the names api service
    this.router.on("registeredMulticast", function(event) {
        var reg=event.entity;
        var value = ozpIwc.namesApi.findOrMakeValue({resource: '/multicast/' + reg.group, contentType: "ozp-multicast-object-v1+json"});
        var packet = {
            src: reg.address,
            entity: reg.address,
            dst: "names.api"
        };
        value.set(packet);
    });
};

ozpIwc.RouterWatchdog.prototype.shutdown=function() {
    window.clearInterval(this.timer);
};

