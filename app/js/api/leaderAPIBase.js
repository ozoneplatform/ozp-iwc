var sibilant=sibilant || {};

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 * @class
 * @param {object} config
 * @param {string} config.name 
 *        The name of this API.
 * @param {object} config.target
 *				The packet receiver that gets non-election messages.
 * @param {sibilant.Router} [config.router=sibilant.defaultRouter] 
 *        The router to use for communications.
 * @param {string} [config.address]
 *        Base address for this participant.  If supplied, the user is responsible for
 *        directing all election related packets to the route() function.  If not supplied, 
 *        the leader will register with the router, make that address available under the "address"
 *        property.
 * @param {string} [config.apiAddress=config.name+".api"] 
 *        The address of this API.  The leader will register to receive multicast on this channel.
 * @param {string} [config.electionAddress="election."+config.apiAddress] 
 *        The multicast channel for running elections.  
 *        The leader will register to receive multicast on this channel.
 * @param {string} [config.origin=""] 
 *        The origin for this participant.
 * @param {number} [config.priority=Math.Random] 
 *        How strongly this node feels it should be leader.
 * @param {function} [config.priorityLessThan] 
 *        Function that provides a strict total ordering on the priority.  Default is "<".
 * @param {number} [config.electionTimeout=500] 
 *        Number of milliseconds to wait before declaring victory on an election. 
 
 */
sibilant.LeaderApiBase=function(config) {
	if(!config.name) {
		throw "Config must contain a name value";
	}
	
	// Networking info
	this.name=config.name;
	this.target=config.target || { receive: function() {}};
	
	this.router= config.router || sibilant.defaultRouter;
	this.apiAddress=config.apiAddress || (this.name + ".api");
	this.electionAddress=config.electionAddress || ("election." + this.apiAddress);
	this.origin= config.origin || "";

	// Election times and how to score them
	this.priority = config.priority || Math.random();
	this.priorityLessThan = config.priorityLessThan || function(l,r) { return l < r; };
	this.electionTimeout=config.electionTimeout || 250; // quarter second
	this.leaderState="connecting";
	
	// tracking the current leader
	this.leader=null;
	this.leaderPriority=null;
	this.events=new sibilant.Event();
	this.events.mixinOnOff(this);
	
	// Register with the peer
	if("address" in config) {
		this.address=config.address;
	} else {
		this.address=this.router.registerParticipant({},this);
	}
	this.router.registerMulticast(this,[this.electionAddress,this.apiAddress]);
};

sibilant.LeaderApiBase.prototype.inElection=function() {
	return !!this.electionTimer;
};

sibilant.LeaderApiBase.prototype.isLeader=function() {
	return this.leader === this.address;
};

sibilant.LeaderApiBase.prototype.sendMessage=function(type) {
	this.router.send(this.router.createMessage({
			dst: this.electionAddress,
			src: this.address,
			action: type,
			entity: {
				'priority': this.priority
			}
	}));
};

/**
 * 
 * @returns {undefined}
 * @fire sibilant.LeaderApiBase#startElection
 * @fire sibilant.LeaderApiBase#becameLeader
 */
sibilant.LeaderApiBase.prototype.startElection=function() {
	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
	this.leaderState="election";
	this.events.trigger("startElection");
	
	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimeout(function() {
		self.cancelElection();
		self.leader=self.address;
		self.leaderPriority=self.priority;
		this.leaderState="leader";
		self.sendMessage("victory");	
		self.events.trigger("becameLeader");
	},this.electionTimeout);

	this.sendMessage("election");
};

/**
 * @fire sibilant.LeaderApiBase#endElection
 */
sibilant.LeaderApiBase.prototype.cancelElection=function() {
	if(this.electionTimer) {	
		window.clearTimeout(this.electionTimer);
		this.electionTimer=null;
		this.events.trigger("endElection");
	}
};

sibilant.LeaderApiBase.prototype.receive=function(packet) {
	// forward non-election packets to the current state
	if(packet.dst !== this.electionAddress) {
		this.target.receive(packet,this.leaderState);
	} else {
		if(packet.src === this.address) {
			// even if we see our own messages, we shouldn't act upon them
			return;
		}else if(packet.action === "election") {
			this.handleElectionMessage(packet);
		} else if(packet.action === "victory") {
			this.handleVictoryMessage(packet);
		}
	}
};

sibilant.LeaderApiBase.prototype.handleElectionMessage=function(electionMessage) {
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
 * @fire sibilant.LeaderApiBase#newLeader
 */
sibilant.LeaderApiBase.prototype.handleVictoryMessage=function(victoryMessage) {
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
	}
};
