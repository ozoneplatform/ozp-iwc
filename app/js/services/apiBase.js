ozpIwc.ApiBase= ozpIwc.util.extend(ozpIwc.PacketRouter,function(config) {
	if(!config.participant) {
        throw Error("API must be configured with a participant");
    }
    
    this.participant=config.participant;
    
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
});

ozpIwc.ApiBase.prototype.blah=function() {
    
};