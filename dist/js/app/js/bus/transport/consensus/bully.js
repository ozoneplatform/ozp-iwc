ozpIwc.consensus = ozpIwc.consensus || {};


ozpIwc.consensus.Bully = ozpIwc.util.extend(ozpIwc.consensus.BaseConsensus,function(config) {
    ozpIwc.consensus.BaseConsensus.apply(this, arguments);
    this.consensusId = config.consensusId || -ozpIwc.util.now();
    this.coordinatorTimeoutheartbeat = config.heartbeat || 2000;
    this.coordinatorIntervalheartbeat = this.coordinatorTimeoutheartbeat / 2;

    //this.sendQueryMessage();
    this.restartCoordinatorTimeout();
});

ozpIwc.consensus.Bully.prototype.routePacket = function(packetContext){
    var packet = packetContext.packet || {};

    //Accept packets sent out to this consensus module
    if(packet.dst === this.consensusAddress){
        //But ignore own packets
        if(packet.src !== this.participant.address){
            switch(packet.action){
                case "election":
                    this.onElectionMessage(packet);
                    break;
                case "acknowledge":
                    this.onAckMessage(packet);
                    break;
                case "victory":
                    this.onVictoryMessage(packet);
                    break;
                case "query":
                    this.onQueryMessage(packet);
                    break;
                default:
                    break;
            }
        }
    }

};


//==================================================================
// Consensus message sending
//==================================================================

ozpIwc.consensus.Bully.prototype.sendElectionMessage = function(){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "election",
        'entity': {
            'consensusId': this.consensusId
        }
    });
};

ozpIwc.consensus.Bully.prototype.sendAckMessage = function(consensusSender){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "acknowledge",
        'entity': {
            'consensusId': this.consensusId,
            'replyTo':{
                'consensusId': consensusSender
            }
        }
    });
};

ozpIwc.consensus.Bully.prototype.sendVictoryMessage = function(){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "victory",
        'entity': {
            'consensusId': this.consensusId
        }
    });
};
ozpIwc.consensus.Bully.prototype.sendQueryMessage = function(){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "query",
        'entity': {
            'consensusId': this.consensusId
        }
    });
};


//==================================================================
// Consensus message handling
//==================================================================

ozpIwc.consensus.Bully.prototype.onElectionMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId ){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // Ignore it if they out rank us.
    if(consensusId > this.consensusId){
        this.cancelElection();
        window.clearTimeout(this.coordinatorTimeout);
        window.clearInterval(this.coordinatorInterval);
        return;
    }

    // Let them know that we out rank them.
    //this.sendAckMessage(consensusId);
    this.cancelElection();
    this.startElection();
};

ozpIwc.consensus.Bully.prototype.onAckMessage = function(packet){
    var entity = packet.entity;
    var replyTo = entity.replyTo || {};
    if (!replyTo.consensusId){ throw "Non-formatted acknowledge message received.";}
    var consensusId = replyTo.consensusId;

    // Ignore if it wasn't sent directly to me.
    if(consensusId !== this.consensusId){
        return;
    }

    //what do we do on ack?
    //cancel election timeout
    this.cancelElection();
};

ozpIwc.consensus.Bully.prototype.onVictoryMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // Ignore it if they out rank us.
    if(consensusId > this.consensusId){
        this.cancelElection();
        this.restartCoordinatorTimeout();
        return;
    }

    //Rebel if needed.
    this.startElection();

};

ozpIwc.consensus.Bully.prototype.onQueryMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // If this Bully is pumping out victory messages its the leader, otherwise don't respond
    if(this.coordinatorInterval){
        this.sendAckMessage(consensusId);  //@TODO: Pass state data along.
        return;
    }

    //Rebel if needed.
    this.startElection();

};


//==================================================================
// Consensus Coordinator timeout
//==================================================================
ozpIwc.consensus.Bully.prototype.restartCoordinatorTimeout = function(){
    var self = this;
    window.clearTimeout(this.coordinatorTimeout);

    this.coordinatorTimeout = window.setTimeout(function(){
        self.onCoordinatorTimeout();
    },this.coordinatorTimeoutheartbeat);
};

ozpIwc.consensus.Bully.prototype.onCoordinatorTimeout = function(){
    this.startElection();
};



//==================================================================
// Coordinator functionality
//==================================================================
ozpIwc.consensus.Bully.prototype.onBecomeCoordinator = function() {
    var self = this;
    window.clearInterval(this.coordinatorInterval);

    this.sendVictoryMessage(self.lastElection);

    this.coordinatorInterval = window.setInterval(function(){
        self.sendVictoryMessage(self.lastElection);
    },this.coordinatorIntervalheartbeat);
};

//==================================================================
// Election control
//==================================================================
ozpIwc.consensus.Bully.prototype.startElection = function(){
    var self = this;
    window.clearTimeout(this.electionTimeout);

    this.electionTimeout = window.setTimeout(function(){
            self.onBecomeCoordinator();
    },this.coordinatorTimeoutheartbeat);

    self.sendElectionMessage();
};

ozpIwc.consensus.Bully.prototype.cancelElection = function(){
    window.clearTimeout(this.electionTimeout);
};



