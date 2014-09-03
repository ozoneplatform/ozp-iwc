var ozpIwc=ozpIwc || {};

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 * @class
 * @param {object} config
 * @param {String} config.name 
 *        The name of this API.
 * @param {string} [config.electionAddress=config.name+".election"] 
 *        The multicast channel for running elections.  
 *        The leader will register to receive multicast on this channel.
 * @param {number} [config.priority=Math.Random] 
 *        How strongly this node feels it should be leader.
 * @param {function} [config.priorityLessThan] 
 *        Function that provides a strict total ordering on the priority.  Default is "<".
 * @param {number} [config.electionTimeout=250] 
 *        Number of milliseconds to wait before declaring victory on an election.
 * @param {object} config.states  State machine states the participant will register and react to given their assigned category.
 *        Default states listed are always applied and need not be passed in configuration.
 * @param {object} [config.states.leader=['leader']]
 *        Any state that the participant should deem itself the leader of its group.
 * @param {object} [config.states.member=['member']]
 *        Any state that the participant should deem itself a member (not leader) of its group.
 * @param {object} [config.states.election=['election']]
 *        Any state that the participant should deem itself in an election with its group.
 * @param {object} [config.states.queueing=['connecting','election']]
 *        Any state that the participant should block non-election messages until not in a queueing state
 */
ozpIwc.LeaderGroupParticipant=ozpIwc.util.extend(ozpIwc.InternalParticipant,function(config) {
	ozpIwc.InternalParticipant.apply(this,arguments);
    config.states = config.states || {};


	if(!config.name) {
		throw "Config must contain a name value";
	}


	// Networking info
	this.name=config.name;
	this.electionAddress=config.electionAddress || (this.name + ".election");


	// Election times and how to score them
	this.priority = config.priority || ozpIwc.defaultLeaderPriority || -ozpIwc.util.now();
	this.priorityLessThan = config.priorityLessThan || function(l,r) { return l < r; };
	this.electionTimeout=config.electionTimeout || 1000; // quarter second
    this.electionQueue=[];


    // State Machine configuration
	this.leaderState= null;
    this.states = config.states;

    this.states.leader = this.states.leader || [];
    this.states.leader = this.states.leader.concat(["leader"]);

    this.states.member = this.states.member || [];
    this.states.member = this.states.member.concat(["member"]);

    this.states.election = this.states.election || [];
    this.states.election = this.states.election.concat(["election"]);

    this.states.queueing = this.states.queueing || [];
    this.states.queueing = this.states.queueing.concat(["connecting", "election"]);

    this.activeStates = config.activeStates || {
        'leader': false,
        'member': false,
        'election': false,
        'queueing': true
    };

    this.changeState("connecting");


	// tracking the current leader
	this.leader=null;
	this.leaderPriority=null;

	this.participantType="leaderGroup";
	this.name=config.name;


    // Election Events
	this.on("startElection",function() {
        this.electionQueue=[];
	},this);
	
	this.on("becameLeader",function() {
        this.leader = this.address;
        this.leaderPriority = this.priority;
		this.electionQueue.forEach(function(p) {
			this.forwardToTarget(p);
		},this);
		this.electionQueue=[];
	},this);

	this.on("newLeader",function() {
		this.electionQueue=[];
	},this);

    this.toggleDrop = false;


    // Handle passing of state on unload
    var self=this;
	window.addEventListener("beforeunload",function() {
        //Priority has to be the minimum possible
        self.priority=-Number.MAX_VALUE;
        self.send = function(originalPacket,callback) {
            var packet=this.fixPacket(originalPacket);
            if(callback) {
                this.replyCallbacks[packet.msgId]=callback;
            }
            ozpIwc.Participant.prototype.send.call(this,packet);

            return packet;
        };

        if(self.activeStates.leader) {
            self.events.trigger("unloadState");
        }
	});


    // Connect Metrics
    ozpIwc.metrics.gauge('transport.leaderGroup.election').set(function() {
        var queue = self.getElectionQueue();
        return {'queue': queue ? queue.length : 0};
    });

    // Handle connection to router
	this.on("connectedToRouter",function() {
        this.router.registerMulticast(this,[this.electionAddress,this.name]);
        var self = this;
        ozpIwc.util.setImmediate(function(){
            self.startElection();
        });

    },this);

    this.on("receive",this.routePacket,this);
});

/**
 * Retrieve the election queue. Called by closures which need access to the
 * queue as it grows
 * @returns {Array} the election queue
 */
ozpIwc.LeaderGroupParticipant.prototype.getElectionQueue=function() {
    return this.electionQueue;
};


/**
 * Checks to see if the leadership group is in an election
 * @returns {Boolean} True if in an election state, otherwise false
 */
ozpIwc.LeaderGroupParticipant.prototype.inElection=function() {
    return !!this.electionTimer || this.activeStates.election;
};


/**
 * Checks to see if this instance is the leader of it's group.
 * @returns {Boolean}
 */
ozpIwc.LeaderGroupParticipant.prototype.isLeader=function() {
    return this.leader === this.address;
};


/**
 * Sends a message to the leadership group.
 * @private
 * @param {string} type - the type of message-- "election" or "victory"
 */
ozpIwc.LeaderGroupParticipant.prototype.sendElectionMessage=function(type, config) {
    config = config || {};
    var state = config.state || {};
    var previousLeader = config.previousLeader || this.leader;
    this.send({
		'src': this.address,
		'dst': this.electionAddress,
		'action': type,
		'entity': {
			'priority': this.priority,
            'state': state,
            'previousLeader': previousLeader,
            'now': ozpIwc.util.now()
		}
	});
};


/**
 * Sends a message to the leadership group stating victory in the current election. LeaderGroupParticipant.priority
 * included to allow rebuttal. Will only send if participant's current state is in one of the following state categories:
 *      <li>leader</li>
 *      <li>election</li>
 * @returns {ozpIwc.TransportPacket} Packet returned if valid request, else false.
 */
ozpIwc.LeaderGroupParticipant.prototype.sendVictoryMessage = function(){
    if(this.activeStates.leader || this.activeStates.election) {
        return this.send({
            'src': this.address,
            'dst': this.electionAddress,
            'action': 'victory',
            'entity': {
                'priority': this.priority
            }
        });
    } else {
        return false;
    }
}
/**
 * Attempt to start a new election.
 * @protected
 * @returns {undefined}
 * @fire ozpIwc.LeaderGroupParticipant#startElection
 * @fire ozpIwc.LeaderGroupParticipant#becameLeader
 */
ozpIwc.LeaderGroupParticipant.prototype.startElection=function(config) {
    config = config || {};
    var state = config.state || {};

	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
    this.events.trigger("startElection");
    this.toggleDrop = false;

	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimeout(function() {
		self.cancelElection();
        self.events.trigger("becameLeaderStep");
	},this.electionTimeout);

	this.sendElectionMessage("election", {state: state, previousLeader: this.leader});
};


/**
 * Cancels an in-progress election that we started.
 * @protected
 * @fire ozpIwc.LeaderGroupParticipant#endElection
 */
ozpIwc.LeaderGroupParticipant.prototype.cancelElection=function() {
	if(this.electionTimer) {
        window.clearTimeout(this.electionTimer);
        this.electionTimer=null;
        this.events.trigger("endElection");
	}
};


/**
 * Receives a packet on the election control group or forwards it to the target implementation
 * that of this leadership group.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {boolean}
 */
ozpIwc.LeaderGroupParticipant.prototype.routePacket=function(packetContext) {
	var packet=packetContext.packet;
	packetContext.leaderState=this.leaderState;
    if(packet.src === this.address) {
        // drop our own packets that found their way here
        return;
    }
    if(packet.dst === this.electionAddress) {
        if(packet.src === this.address) {
			// even if we see our own messages, we shouldn't act upon them
			return;
		} else if(packet.action === "election") {
			this.handleElectionMessage(packet);
		} else if(packet.action === "victory") {
			this.handleVictoryMessage(packet);
		}
    } else {
        this.forwardToTarget(packetContext);
	}		
};


ozpIwc.LeaderGroupParticipant.prototype.forwardToTarget=function(packetContext) {
    if(this.activeStates.queueing) {
		this.electionQueue.push(packetContext);
		return;
	}
	packetContext.leaderState=this.leaderState;
	this.events.trigger("receiveApiPacket",packetContext);
};
	
	
/**
 * Respond to someone else starting an election.
 * @private
 * @param {ozpIwc.TransportPacket} electionMessage
 * @returns {undefined}
 */
ozpIwc.LeaderGroupParticipant.prototype.handleElectionMessage=function(electionMessage) {
//    console.log(this.address, electionMessage.src, electionMessage.entity.priority, this.priority, electionMessage.entity.now);
    //If a state was received, store it case participant becomes the leader
    if(Object.keys(electionMessage.entity.state).length > 0){
        this.stateStore = electionMessage.entity.state;
        this.events.trigger("receivedState");
    }
    if(electionMessage.entity.previousLeader){
        if (electionMessage.entity.previousLeader !== this.address) {
            this.previousLeader = electionMessage.entity.previousLeader;
        }
    }


	// is the new election lower priority than us?
	if(this.priorityLessThan(electionMessage.entity.priority,this.priority)) {
        // Quell the rebellion!
        this.startElection();

    } else if(this.activeStates.leader) {
        this.sendElectionMessage("election", {previousLeader: true});

    } else {
        if(this.toggleDrop){
            this.events.trigger("newLeaderStep");
            this.toggleDrop = false;
        }
		// Abandon dreams of leadership
		this.cancelElection();
	}

};


/**
 * Handle someone else declaring victory.
 * @fire ozpIwc.LeaderGroupParticipant#newLeader
 * @param {ozpIwc.TransportPacket} victoryMessage
 */
ozpIwc.LeaderGroupParticipant.prototype.handleVictoryMessage=function(victoryMessage) {
	if(this.priorityLessThan(victoryMessage.entity.priority,this.priority)) {
		// someone usurped our leadership! start an election!
            this.startElection();
	} else {
		// submit to the bully
		this.leader=victoryMessage.src;
		this.leaderPriority=victoryMessage.entity.priority;
		this.cancelElection();
		this.events.trigger("newLeaderStep");
        this.stateStore = {};
	}
};

/**
 * Gets the current status of the LeaderGroupParticipant.
 * @returns {object} status - the status of the participant.
 * @returns {string} status.leaderState - The current state of the participant.
 * @returns {number} status.leaderPriority - The current priority of the participant group's leader.
 */
ozpIwc.LeaderGroupParticipant.prototype.heartbeatStatus=function() {
	var status= ozpIwc.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.leaderState=this.leaderState;
	status.leaderPriority=this.priority;
	return status;
};


/**
 * Changes the current state of the participant.
 * @param state
 * @returns {boolean}
 *      Will return true if a state transition occured.
 *      Will not change state and return false if:
 *      <li>the new state was the current state</li>
 *      <li>the new state is not a registered state @see ozpIwc.LeaderGroupParticipant</li>
 */
ozpIwc.LeaderGroupParticipant.prototype.changeState=function(state) {
    if(state !== this.leaderState){
//        console.log(this.address, this.leaderState, state, ozpIwc.util.now());
        if(this._validateState(state)){
            return true;
        }
    }
    return false;
};


/**
 *  Validates if the desired state transition is possible.
 *
 * @param state {string} The desired state to transition to.
 * @returns {boolean}
 *      Will return true if a state transition occured. </br>
 *      Will not change state and return false if:
 *      <li>the new state was the current state</li>
 *      <li>the new state is not a registered state</li>
 * @private
 */
ozpIwc.LeaderGroupParticipant.prototype._validateState = function(state){
    var newState = {};
    var validState = false;
    for(var x in this.states) {
        if(ozpIwc.util.arrayContainsAll(this.states[x], [state])){
            newState[x] = true;
            validState = true;
        } else {
            newState[x] = false;
        }
    }
    if(validState){
        this.activeStates = newState;
        this.leaderState = state;
    } else {
        console.error(this.address, this.name, "does not have state:", state);
        return false;
    }
};