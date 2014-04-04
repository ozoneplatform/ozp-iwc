var sibilant=sibilant || {};

sibilant.NamesAPI = function(config) {
	this.baseAPI=new sibilant.BaseAPI({
		name: "names",
		states: {
			member: {
				actionMapper: function(packet) { return packet.action+"AsMember";},
				target: this
			},
			leader: {
				actionMapper: function(packet) { return packet.action+"AsLeader";},
				target: this
			}
		}
	});
	
};
