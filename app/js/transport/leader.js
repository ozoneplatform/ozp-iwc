var sibilant=sibilant || {};

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 * @class
 * @param {object} config
 * @param {string} electionAddress - The multicast channel for running elections.
 * @param {string address - The participant address for this service.
 * @param {number} [config.priority] - How strongly this node feels it should be leader.
 * @param {function} [priorityLessThan] - Function that provides a strict total ordering on the priority.
 * @param {number} [electionTimeout=500] - Number of milliseconds to wait before declaring victory on an election.
 * @param {sibilant.Router} [router=sibilant.defaultRouter] - The router to use for communications.
 */
sibilant.Leader=function(config) {
	this.electionAddress=config.electionAddress;
	this.address=config.address;
	
	this.priority = config.priority || Math.random();
	this.priorityLessThan = config.priorityLessThan || function(l,r) { return l < r; };
	this.router= config.router || sibilant.defaultRouter;
	this.electionTimeout=config.electionTimeout || 250; // quarter second
	
	this.leader=null;
	this.leaderPriority=null;
	this.events=new sibilant.Event();
	this.events.mixinOnOff(this);
};

sibilant.Leader.prototype.inElection=function() {
	return !!this.electionTimer;
};

sibilant.Leader.prototype.isLeader=function() {
	return this.leader === this.address;
};

sibilant.Leader.prototype.sendMessage=function(type) {
	this.router.send(this.router.createMessage({
			dst: this.electionAddress,
			src: this.address,
			entity: {
				'type': type,
				'priority': this.priority
			}
	}));
}

/**
 * 
 * @returns {undefined}@fire sibilant.Leader#startElection
 * @fire sibilant.Leader#becameLeader
 */
sibilant.Leader.prototype.startElection=function() {
	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
	this.events.trigger("startElection");
	
	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimeout(function() {
		self.cancelElection();
		self.leader=self.address;
		self.leaderPriority=self.priority;
		self.sendMessage("victory");	
		self.events.trigger("becameLeader");
	},this.electionTimeout);

	this.sendMessage("election");
};

/**
 * @fire sibilant.Leader#endElection
 */
sibilant.Leader.prototype.cancelElection=function() {
	if(this.electionTimer) {	
		window.clearTimeout(this.electionTimer);
		this.electionTimer=null;
		this.events.trigger("endElection");
	}
};

sibilant.Leader.prototype.receive=function(packet) {
	if(packet.src === this.address) {
		// even if we see our own messages, we shouldn't act upon them
		return;
	}else if(packet.entity.type === "election") {
		this.handleElectionMessage(packet);
	} else if(packet.entity.type==="victory") {
		this.handleVictoryMessage(packet);
	}
};

sibilant.Leader.prototype.handleElectionMessage=function(electionMessage) {
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
 * @fire sibilant.Leader#newLeader
 */
sibilant.Leader.prototype.handleVictoryMessage=function(victoryMessage) {
	if(this.priorityLessThan(victoryMessage.entity.priority,this.priority)) {
		// someone usurped our leadership! start an election!
		this.startElection();
	} else {
		// submit to the bully
		this.leader=victoryMessage.src;
		this.leaderPriority=victoryMessage.entity.priority;
		this.cancelElection();
		this.events.trigger("newLeader");
	}
};
