var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.transport
 */

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 *
 * @class LeaderGroupParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.InternalParticipant
 * @constructor
 *
 * @param {Object} config
 * @param {String} config.name 
 *        The name of this API.
 * @param {String} [config.electionAddress=config.name+".election"]
 *        The multicast channel for running elections.  
 *        The leader will register to receive multicast on this channel.
 * @param {Number} [config.priority=Math.Random]
 *        How strongly this node feels it should be leader.
 * @param {Function} [config.priorityLessThan]
 *        Function that provides a strict total ordering on the priority.  Default is "<".
 * @param {Number} [config.electionTimeout=250]
 *        Number of milliseconds to wait before declaring victory on an election. 
 
 */
ozpIwc.LeaderGroupParticipant=ozpIwc.util.extend(ozpIwc.InternalParticipant,function(config) {
	ozpIwc.InternalParticipant.apply(this,arguments);

	if(!config.name) {
		throw "Config must contain a name value";
	}
	
	// Networking info
    /**
     * The name of the participant.
     * @property name
     * @type String
     * @default ""
     */
	this.name=config.name;

    /**
     * The election address for common LeaderGroupParticipant's on the IWC bus.
     * @property electionAddress
     * @type String
     * @default ".election"
     */
	this.electionAddress=config.electionAddress || (this.name + ".election");

	// Election times and how to score them
    /**
     * A numeric value to determine who the leader of the group should be.
     * @property priority
     * @type Number
     * @default {{#crossLink "ozpIwc.util/now:method"}}-ozpIwc.util.now(){{/crossLink}}
     */
	this.priority = config.priority || ozpIwc.defaultLeaderPriority || -ozpIwc.util.now();

    /**
     * Function to determine the lower value amongst two priorities.
     * @property priorityLessThan
     * @type Function
     * @default function( l, r) { return l < r };
     */
	this.priorityLessThan = config.priorityLessThan || function(l,r) { return l < r; };

    /**
     * How long a participant partakes in an election.
     * @property electionTimeout
     * @type Number
     * @default 250
     */
	this.electionTimeout=config.electionTimeout || 250; // quarter second

    /**
     * The current state of the participant.
     *
     * The leaderGroupParticipant has the following states:
     *   - connecting
     *   - election
     *   - leader
     *   - member
     *
     * @property leaderState
     * @type String
     * @default "connecting"
     */
	this.leaderState="connecting";

    /**
     * Packets received from the router that are not pertinent to the election. They will be processed post election
     * if this participant becomes the leader.
     * @property electionQueue
     * @type ozpIwc.NetworkPacket[]
     * @default []
     */
	this.electionQueue=[];
	
	// tracking the current leader
    /**
     * The address of the current leader.
     * @property leader
     * @type String
     * @default null
     */
	this.leader=null;

    /**
     * The priority of the current leader.
     * @property leaderPriority
     * @type Number
     * @default null
     */
	this.leaderPriority=null;

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     * @default "leaderGroup"
     */
	this.participantType="leaderGroup";

    /**
     * The name of the participant.
     * @property name
     * @type String
     * @default ""
     */
	this.name=config.name;

    /**
     * Fires when the participant enters an election.
     * @event startElection
     */
	this.on("startElection",function() {
			this.electionQueue=[];
	},this);

    /**
     * Fires when this participant becomes the leader.
     * @event #becameLeader
     *
     */
	this.on("becameLeader",function() {
		this.electionQueue.forEach(function(p) {
			this.forwardToTarget(p);
		},this);
		this.electionQueue=[];
	},this);

    /**
     * Fires when a leader has been assigned and this participant is not it.
     * @event #newLeader
     */
	this.on("newLeader",function() {
		this.electionQueue=[];
	},this);
	var self=this;
	
	// handoff when we shut down
	window.addEventListener("beforeunload",function() {
        //Priority has to be the minimum possible
        self.priority=-Number.MAX_VALUE;
        self.leaderPriority=-Number.MAX_VALUE;
        if(self.leaderState === "leader") {
            self.events.trigger("unloadState");
        }
	});

    ozpIwc.metrics.gauge('transport.leaderGroup.election').set(function() {
        var queue = self.getElectionQueue();
        return {'queue': queue ? queue.length : 0};
    });

    /**
     * Fires when the participant has connected to its router.
     * @event #connectedToRouter
     */
	this.on("connectedToRouter",function() {
        this.router.registerMulticast(this,[this.electionAddress,this.name]);
        this.startElection();
    },this);
    this.on("receive",this.routePacket,this);
});

/**
 * Retrieve the election queue. Called by closures which need access to the queue as it grows
 *
 * @method getElectionQueue
 *
 * @returns {Array} the election queue
 */
ozpIwc.LeaderGroupParticipant.prototype.getElectionQueue=function() {
    return this.electionQueue;
};


/**
 * Checks to see if the leadership group is in an election
 *
 * @method inElection
 *
 * @returns {Boolean} True if in an election state, otherwise false
 */
ozpIwc.LeaderGroupParticipant.prototype.inElection=function() {
	return !!this.electionTimer;
};

/**
 * Checks to see if this instance is the leader of it's group.
 *
 * @method isLeader
 *
 * @returns {Boolean} True if leader.
 */
ozpIwc.LeaderGroupParticipant.prototype.isLeader=function() {
	return this.leader === this.address;
};

/**
 * Sends an election message to the leadership group.
 *
 * @method sendElectionMessage
 * @private
 * @param {String} type The type of message -- "election" or "victory"
 */
ozpIwc.LeaderGroupParticipant.prototype.sendElectionMessage=function(type, config) {
    config = config || {};
    var state = config.state || {};
	this.send({
		'src': this.address,
		'dst': this.electionAddress,
		'action': type,
		'entity': {
			'priority': this.priority,
            'state': state
		}
	});
};

/**
 * Attempt to start a new election.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#startElection:event"}{{/crossLink}}
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#becameLeader:event"}{{/crossLink}}
 *
 * @method startElection
 * @protected
 *
 */
ozpIwc.LeaderGroupParticipant.prototype.startElection=function(config) {
    config = config || {};
    var state = config.state || {};

	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
	this.leaderState="election";
	this.events.trigger("startElection");

    this.victoryDebounce = null;
	
	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimeout(function() {
		self.cancelElection();
        self.leaderState = "leader";
        self.leader=self.address;
        self.leaderPriority=self.priority;
        self.events.trigger("becameLeader");

        self.sendElectionMessage("victory");

        // Debouncing before setting state.
        self.victoryDebounce = window.setTimeout(function(){
            if (self.leaderState === "leader") {
                if (self.stateStore && Object.keys(self.stateStore).length > 0) {
                    self.events.trigger("acquireState", self.stateStore);
                    self.stateStore = {};
                }
            }
        },100);
	},this.electionTimeout);

	this.sendElectionMessage("election", {state: state});
};

/**
 * Cancels participation in an in-progress election.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#endElection:event"}{{/crossLink}}
 *
 * @method cancelElection
 *
 * @protected
 */
ozpIwc.LeaderGroupParticipant.prototype.cancelElection=function() {
	if(this.electionTimer) {
        window.clearTimeout(this.electionTimer);
        this.electionTimer=null;
        window.clearTimeout(this.victoryDebounce);
        this.victoryDebounce=null;
        this.events.trigger("endElection");
	}
};

/**
 * Receives a packet on the election control group or forwards it to the target implementation of this leadership group.
 *
 * @method routePacket
 * @param {ozpIwc.TransportPacket} packetContext
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

/**
 * Forwards received packets to the target implementation of the participant. If currently in an election, messages
 * are queued.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#receiveApiPacket:event"}{{/crossLink}}
 *
 * @method forwardToTarget
 *
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.LeaderGroupParticipant.prototype.forwardToTarget=function(packetContext) {
	if(this.leaderState === "election" || this.leaderState === "connecting") {
		this.electionQueue.push(packetContext);
		return;
	}
	packetContext.leaderState=this.leaderState;
	this.events.trigger("receiveApiPacket",packetContext);
};
	
	
/**
 * Respond to someone else starting an election.
 *
 * @method handleElectionMessage
 *
 * @private
 * @param {ozpIwc.TransportPacket} electionMessage
 */
ozpIwc.LeaderGroupParticipant.prototype.handleElectionMessage=function(electionMessage) {
    //If a state was received, store it case participant becomes the leader
    if(Object.keys(electionMessage.entity.state).length > 0){
        this.stateStore = electionMessage.entity.state;
    }
	// is the new election lower priority than us?
	if(this.priorityLessThan(electionMessage.entity.priority,this.priority)) {
		// Quell the rebellion!
		this.startElection();
	} else {
		// Abandon dreams of leadership
		this.cancelElection();
	}
};

/**
 * Handle someone else declaring victory.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#newLeader:event"}{{/crossLink}}
 *
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
		this.leaderState="member";
		this.events.trigger("newLeader");
        this.stateStore = {};
	}
};

/**
 * Returns the status of the participant.
 *
 * @method heartbeatStatus
 * @returns {Object}
 */
ozpIwc.LeaderGroupParticipant.prototype.heartbeatStatus=function() {
	var status= ozpIwc.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.leaderState=this.leaderState;
	status.leaderPriority=this.priority;
	return status;
};