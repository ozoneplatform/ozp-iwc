var sibilant=sibilant || {};

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 * @class
 * @param {object} config
 * @param {String} config.name 
 *        The name of this API.
 * @param {Object} config.target
 *				The packet receiver that gets non-election messages.
 * @param {string} [config.electionAddress=config.name+".election"] 
 *        The multicast channel for running elections.  
 *        The leader will register to receive multicast on this channel.
 * @param {number} [config.priority=Math.Random] 
 *        How strongly this node feels it should be leader.
 * @param {function} [config.priorityLessThan] 
 *        Function that provides a strict total ordering on the priority.  Default is "<".
 * @param {number} [config.electionTimeout=250] 
 *        Number of milliseconds to wait before declaring victory on an election. 
 
 */
sibilant.LeaderGroupParticipant=sibilant.util.extend(sibilant.Participant,function(config) {
	sibilant.Participant.apply(this,arguments);

	if(!config.name) {
		throw "Config must contain a name value";
	}
	
	// Networking info
	this.name=config.name;
	this.target=config.target || { receive: function() {}};
	
	this.electionAddress=config.electionAddress || (this.name + ".election");

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
});

sibilant.LeaderGroupParticipant.prototype.connectToRouter=function(router,address) {
	sibilant.Participant.prototype.connectToRouter.apply(this,arguments);
	this.router.registerMulticast(this,[this.electionAddress]);
};

/**
 * Checks to see if the leadership group is in an election
 * @returns {Boolean} True if in an election state, otherwise false
 */
sibilant.LeaderGroupParticipant.prototype.inElection=function() {
	return !!this.electionTimer;
};

/**
 * Checks to see if this instance is the leader of it's group.
 * @returns {Boolean}
 */
sibilant.LeaderGroupParticipant.prototype.isLeader=function() {
	return this.leader === this.address;
};

/**
 * Sends a message to the leadership group.
 * @private
 * @param {string} type - the type of message-- "election" or "victory"
 */
sibilant.LeaderGroupParticipant.prototype.sendElectionMessage=function(type) {
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
 * Attempt to start a new election.
 * @protected
 * @returns {undefined}
 * @fire sibilant.LeaderGroupParticipant#startElection
 * @fire sibilant.LeaderGroupParticipant#becameLeader
 */
sibilant.LeaderGroupParticipant.prototype.startElection=function() {
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
		self.sendElectionMessage("victory");	
		self.events.trigger("becameLeader");
	},this.electionTimeout);

	this.sendElectionMessage("election");
};

/**
 * Cancels an in-progress election that we started.
 * @protected
 * @fire sibilant.LeaderGroupParticipant#endElection
 */
sibilant.LeaderGroupParticipant.prototype.cancelElection=function() {
	if(this.electionTimer) {	
		window.clearTimeout(this.electionTimer);
		this.electionTimer=null;
		this.events.trigger("endElection");
	}
};

/**
 * Receives a packet on the election control group or forwards it to the target implementation
 * that of this leadership group.
 * @param {sibilant.TransportPacket} packet
 * @returns {boolean}
 */
sibilant.LeaderGroupParticipant.prototype.receiveFromRouter=function(packetContext) {
	var packet=packetContext.packet;
	packetContext.leaderState=this.leaderState;
	// forward non-election packets to the current state
	if(packet.dst !== this.electionAddress) {
		this.forwardToTarget(packetContext);
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
/**
 * Convention based routing.  Routes to a functions in order of
 * <ol>
 *   <li>handle${action}As${leaderState}</li>
 *   <li>handle${action}</li>
 *   <li>defaultHandlerAs${leaderState}</li>
 *   <li>defaultHandler</li>
 * </ol>
 * The variable action is the packet's action and leaderstate is the current leadership state.
 * If there's no packet action, then the handle* functions will not be invoked.
 * @param {sibilant.TransportPacketContext} packetContext
 */
sibilant.LeaderGroupParticipant.prototype.forwardToTarget=function(packetContext) {
	var packet=packetContext.packet;
	var handler="handle";
	var stateSuffix="As" + this.leaderState.charAt(0).toUpperCase() + this.leaderState.slice(1).toLowerCase();
	var checkdown=[];
	
	if(packet.action) {
		var handler="handle" + packet.action.charAt(0).toUpperCase() + packet.action.slice(1).toLowerCase();
		checkdown.push(handler+stateSuffix);
		checkdown.push(handler);
	}
	checkdown.push("defaultHandler" + stateSuffix);
	checkdown.push("defaultHandler");
	
	for(var i=0; i< checkdown.length; ++i) {
		handler=this.target[checkdown[i]];
		if(typeof(handler) === 'function') {
			handler.call(this.target,packetContext);
		}
	}
};
/**
 * Respond to someone else starting an election.
 * @private
 * @param {sibilant.TransportPacket} electionMessage
 * @returns {undefined}
 */
sibilant.LeaderGroupParticipant.prototype.handleElectionMessage=function(electionMessage) {
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
 * @fire sibilant.LeaderGroupParticipant#newLeader
 */
sibilant.LeaderGroupParticipant.prototype.handleVictoryMessage=function(victoryMessage) {
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
