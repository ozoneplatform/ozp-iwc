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
sibilant.LeaderAPI=function(config) {
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

sibilant.LeaderAPI.prototype.inElection=function() {
	return !!this.electionTimer;
};

sibilant.LeaderAPI.prototype.isLeader=function() {
	return this.leader === this.address;
};

sibilant.LeaderAPI.prototype.sendMessage=function(type) {
	this.router.send(this.router.createMessage(
			dst: this.electionAddress,
			src: this.address,
			entity: {
				'type': type,
				'priority', this.priority
			}
	});
}

sibilant.LeaderAPI.prototype.startElection=function() {
	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
	this.events.trigger("startElection");
	
	this.sendMessage("election");
	
	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimer(function() {
		self.cancelElection();
		this.router.send("victory");	
	},this.electionTimeout);
};

sibilant.LeaderAPI.prototype.cancelElection=function() {
	if(this.electionTimer) {	
		window.clearTimer(this.electionTimer);
		this.electionTimer=null;
		this.events.trigger("endElection");
	}
};

sibilant.LeaderAPI.prototype.handleElectionMessage=function(electionMessage) {
	// is the new election higher priority than us?
	if(this.priorityLessThan(this.priority,electionMessage.entity.priority)) {
		// Abandon dreams of leadership
		this.cancelElection();
	} else {
		// Quell the rebellion!
		this.startElection();
	}
};

sibilant.LeaderAPI.prototype.handleVictoryMessage=function(victoryMessage) {
	if(this.priorityLessThan(this.priority,victoryMessage.entity.priority)) {
		// submit to the bully
		this.leader=victoryMessage.src;
		this.leaderPriority=victoryMessage.entity.priority;
		this.events.trigger("newLeader");
	} else {
		// someone usurped our leadership! start an election!
		this.startElection();
	}
};
