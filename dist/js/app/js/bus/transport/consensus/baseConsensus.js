ozpIwc.consensus = ozpIwc.consensus || {};

ozpIwc.consensus.BaseConsensus = function(config){
    config = config || {};

    if(!config.participant) { throw "Consensus module expects a participant.";}
    this.participant = config.participant;

    if(!config.name) { throw "Bully module expects a name.";}
    this.name = config.name;

    this.consensusAddress = config.consensusAddress || this.name + ".consensus";


    var self = this;
    this.participant.on("connectedToRouter",function() {
        self.participant.permissions.pushIfNotExist('ozp:iwc:address', [self.participant.address,self.consensusAddress]);
        self.participant.permissions.pushIfNotExist('ozp:iwc:sendAs',[self.participant.address,self.consensusAddress]);
        self.participant.permissions.pushIfNotExist('ozp:iwc:receiveAs',[self.participant.address,self.consensusAddress]);

        ozpIwc.metrics.gauge(self.metricRoot,"registeredCallbacks").set(function() {
            return self.getCallbackCount();
        });
    });
    ozpIwc.defaultRouter.registerParticipant(this.participant);
    ozpIwc.defaultRouter.registerMulticast(this.participant,[this.consensusAddress]);

    this.participant.on("receive",this.routePacket,this);
};

ozpIwc.consensus.BaseConsensus.prototype.routePacket= function(packetContext){
   throw "routePacket is to be overridden by consensus implementation";
};


ozpIwc.consensus.BaseConsensus.prototype.onBecomeCoordinator = function(){

};


ozpIwc.consensus.BaseConsensus.prototype.onBecomeMember = function(){

};

