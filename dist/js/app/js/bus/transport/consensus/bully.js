/**
 * @submodule bus.consensus
 */
ozpIwc.consensus = ozpIwc.consensus || {};

/**
 * An implementation of the Bully Algorithm as a consensus module for the IWC.
 * Acknowledge(OK) message is not used in current implementation, rather a victory message is sent out on an interval
 * to notify other consensus modules whom the coordinator is.
 *
 * The consensusId is a negative reference to the time at which the bully was created. This means the oldest bully
 * module leads.
 *
 * @class Bully
 * @namespace ozpIwc.consensus
 * @extends BaseConsensus
 * @type {Function}
 */
ozpIwc.consensus.Bully = ozpIwc.util.extend(ozpIwc.consensus.BaseConsensus,function(config) {
    ozpIwc.consensus.BaseConsensus.apply(this, arguments);
    /**
     * Election rank of this module. Seniority rules.
     * @property consensusId
     * @type {Number}
     */
    this.consensusId = config.consensusId || -ozpIwc.util.now();

    /**
     * How long this module waits before assuming the coordinator is down.
     * @property coordinatorTimeoutHeartbeat
     * @type {Number}
     */
    this.coordinatorTimeoutHeartbeat = config.heartbeat || ozpIwc.config.consensusTimeout;

    /**
     * How often this module broadcasts being the coordinator (if coordinator).
     * @property coordinatorTimeoutHeartbeat
     * @type {Number}
     */
    this.coordinatorIntervalHeartbeat = this.coordinatorTimeoutHeartbeat / 2;

    /**
     * Data passing functionality for those who use this module. Data passed into gatherLogs will be shared with other
     * matching modules if this module is the coordinator.
     *
     * @method gatherLogs
     * @type {Function}
     */
    this.gatherLogs = config.gatherLogs || function(){};

    //Give some arbitrary time for the query to respond before kicking off an election
    this.restartCoordinatorTimeout(1000);
    this.sendQueryMessage();
});

/**
 * Routes packets for the bully module. Packets with the following actions are accepted:
 *  - election
 *  - acknowledge
 *  - query
 *  - victory
 *
 * @method routePacket
 * @override
 * @param {ozpIwc.TransportPacket} packetContext
 */
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
/**
 * Sends an election message to other Bully Modules to determine a coordinator.
 *
 * @method sendElectionMessage
 */
ozpIwc.consensus.Bully.prototype.sendElectionMessage = function(){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "election",
        'entity': {
            'consensusId': this.consensusId
        }
    });
};

/**
 * @TODO: Unused, a modified bully algorithm was implemented.
 * Sends an acknowledge message to the consensusId that sent an election message to inform them that this module out
 * ranks them.
 *
 * @method sendAckMessage
 * @param {String}consensusSender
 */
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

/**
 * Sends a victory message to other bully modules informing them of this modules role as Coordinator.
 *
 * @method sendVictoryMessage
 */
ozpIwc.consensus.Bully.prototype.sendVictoryMessage = function(){
    var logs = this.gatherLogs();
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "victory",
        'entity': {
            'consensusId': this.consensusId,
            'logs': logs
        }
    });
};

/**
 * Sends a query message to other bully modules. The Coordinator will hear this message and respond immediately with
 * a victory message to inform Coordinator status.
 *
 * @method sendQueryMessage
 */
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
/**
 * Handler function for receiving election messages. If the message sender is of lower rank than this module, this
 * module joins the election.
 *
 * @method onElectionMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onElectionMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId ){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // Ignore it if they out rank us.
    if(consensusId > this.consensusId){
        this.cancelElection();
        this.restartCoordinatorTimeout(this.coordinatorTimeoutHeartbeat,true);
        return;
    }

    // Let them know that we out rank them.
    //this.sendAckMessage(consensusId);
    this.cancelElection();
    this.startElection();
};

/**
 * Handler function for receiving acknowledge messages. If the acknowledge message is directed at this bully module, it
 * will cancel its election as a higher ranking module exists.
 *
 * @method onAckMessage
 * @param {Object} packet
 */
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

/**
 * Handler function for receiving victory messages. If the sender out ranks this module, the module will act as a
 * member of the module group and start a watchdog to start a new election if the coordinator goes silent.
 *
 * @method onAckMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onVictoryMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // Ignore it if they out rank us.
    if(consensusId > this.consensusId){
        this.cancelElection();
        if(entity.logs){
            this.events.trigger("receivedLogs",entity.logs);
        }
        this.restartCoordinatorTimeout();
        return;
    }

    //Rebel if needed.
    this.startElection();

};


/**
 * Handler function for receiving query messages. If this module is the coordinator it will respond with a victory
 * message to inform sender that this module is the coordinator.
 *
 * @method onAckMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onQueryMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId){ throw "Non-formatted election message received.";}

    // If this Bully is pumping out victory messages its the leader, otherwise don't respond
    if(this.coordinatorInterval){
        this.sendVictoryMessage();
        return;
    }
};


//==================================================================
// Consensus Coordinator timeout
//==================================================================
/**
 * Restarts the watchdog for which the coordinator must respond before ending otherwise this module will start an
 * election.
 *
 * @method restartCoordinatorTimeout
 * @param {Number}[timeout]
 */
ozpIwc.consensus.Bully.prototype.restartCoordinatorTimeout = function(timeout,keepState){
    timeout = timeout || this.coordinatorTimeoutHeartbeat;
    var self = this;
    window.clearTimeout(this.coordinatorTimeout);
    if(!keepState) {
        this.changeState("member");
    }
    this.coordinatorTimeout = window.setTimeout(function(){
        self.onCoordinatorTimeout(timeout);
    },timeout);
};

/**
 * Handler function for when no response was made by the coordinator and its watchdog times out.
 *
 * @method onCoordinatorTimeout
 * @param timeout
 */
ozpIwc.consensus.Bully.prototype.onCoordinatorTimeout = function(timeout){
    this.startElection(timeout);
};



//==================================================================
// Coordinator functionality
//==================================================================
/**
 * Handler function for when this module becomes coordinator of all active matching bully modules.
 *
 * @override
 * @method onBecomeCoordinator
 */
ozpIwc.consensus.Bully.prototype.onBecomeCoordinator = function() {
    var self = this;
    window.clearInterval(this.coordinatorInterval);

    this.sendVictoryMessage(self.lastElection);
    this.changeState("coordinator");
    this.coordinatorInterval = window.setInterval(function(){
        self.sendVictoryMessage(self.lastElection);
    },this.coordinatorIntervalHeartbeat);
};

//==================================================================
// Election control
//==================================================================
/**
 * Makes this bully module start an election for the coordinator role.
 *
 * @method startElection
 * @param {Number} [timeout]
 */
ozpIwc.consensus.Bully.prototype.startElection = function(timeout){
    timeout = timeout || this.coordinatorTimeoutHeartbeat;
    var self = this;
    window.clearTimeout(this.electionTimeout);

    this.electionTimeout = window.setTimeout(function(){
            self.onBecomeCoordinator();
    },timeout);

    self.sendElectionMessage();
};

/**
 * Cancels this modules participation in the current election.
 *
 * @method cancelElection
 */
ozpIwc.consensus.Bully.prototype.cancelElection = function(){
    window.clearTimeout(this.electionTimeout);
};



