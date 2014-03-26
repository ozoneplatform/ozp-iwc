var sibilant=sibilant || {};

/**
 * @typedef {object} sibilant.ConcurrencyAPI.leaderGroup
 * @property {string} leader - Address of the leader
 * @property { [sibilant.ConcurrencyAPI.leaderGroupMember] } members - List of members sorted by priority, then address
 * 
 * @typedef {object} sibilant.ConcurrencyAPI.leaderGroupMember
 * @property {string} address - Address of the member.
 * @property {number} priority - Priority for this member being leader.
 */


/** 
 * @class
 * @property {sibilant.ConcurrencyAPI.leaderGroup} leaderGroups 
 */
sibilant.ConcurrencyAPI = function(config) {
	this.router = config.router || sibilant.defaultRouter;
	
	// Register with the peer
	this.address=this.router.registerParticipant(...);
	
	// set up config
	config.electionAddress=config.electionAddress || "election.leader.api";
	config.address=this.address;
	
	this.router.registerMulticast(this,[config.electionAddress,"leader.api"]);
	
	this.leader=new Leader(config);
	leader.on("startElection",function() {});
	leader.on("endElection",function() {});
	leader.on("becameLeader",function() {});
	leader.on("newLeader",function() {});
	
	// The leader groups we manage.
	this.leaderGroups={};
	
	this.packetRouter=new sibilant.PacketRouter(this,{
		defaultMapper: function(request) {
			return request.action + "Leader";
		}
	});
};


sibilant.ConcurrencyAPI.prototype.receive=function(packet) {
	
};

sibilant.ConcurrencyAPI.prototype.registerLeader=function(request) {
	var newMember={
		address: request.src,
		priority: request.entity.priority
	};
	var leaderGroup = this.leaderGroups[request.id] = this.leaderGroups[request.id] || { leader: null, members: []};
	
	leaderGroup.members.push(newMember);
	// sort with highest priority first
	leaderGroup.sort(function(a,b) {
		var byPriority=b.priority-a.priority;
		if(byPriority===0) { 
			return b.address.localeCompare(a.address);
		}
		return byPriority;
	});

	this.checkForLeaderChange(request.id);	
};

sibilant.ConcurrencyAPI.prototype.unregisterLeader=function(request) {
	var leaderGroup = this.leaderGroups[request.id] || { leader: null, members: []};
	
	this.leaderGroups[request.id]=leaderGroup.filter(function(e) {
		return e.address !== request.src;
	});

	this.checkForLeaderChange(request.id);	
};

sibilant.ConcurrencyAPI.prototype.checkForLeaderChange=function(groupName) {
	var leaderGroup = leaderGroups[groupName];
	if(!leaderGroup || leaderGroup.leader !== leaderGroup.members[0]) {
		// notify the old leader that it has been ousted
		
		// notify the new leader that it's in charge		
	
	}
};



