var sibilant=sibilant || {};
/*
 * @class
 * @param {string} config.name - The name of this API.
 * @param {sibilant.Router} [config.router=sibilant.defaultRouter] 
 *        The router to use for communications.
 * @param {string} [config.address]
 *        Base address for this participant.  If supplied, the user is responsible for
 *        directing all election related packets to the route() function.  If not supplied, 
 *        the leader will register with the router, make that address available under the "address"
 *        property.
 * @param {string} [config.apiAddress=config.name+".api] 
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
sibilant.DataApiBase = function(config) {
	config.target=this;
	sibilant.LeaderApiBase.call(this,config);
	
	this.contentTree={
		data: {},
		metadata: {}
	};
	
	
};
sibilant.DataApiBase.prototype = Object.create(sibilant.LeaderApiBase.prototype); 
sibilant.DataApiBase.prototype.constructor = sibilant.DataApiBase;

sibilant.DataApiBase.prototype.findNode=function(pathString) {
	var path=pathString.split("/");
	var node={
		data: this.contentTree.data,
		metadata: this.contentTree.metadata
	};
	
	for(var i=0;i<path.length;++i) {
		node.data=node.data[path[i]];
		node.metadata=node.metadata[path[i]];
	}
	
};


/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleGetAsLeader=function(packet) {
	var node=this.getNode(packet.resource);
	
};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handlePutAsLeader=function(packet) {

};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handlePostAsLeader=function(packet) {

};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleDeleteAsLeader=function(packet) {

};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleWatchAsLeader=function(packet) {

};

/**
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.handleWatchAsLeader=function(packet) {

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
 * @param {sibilant.TransportPacket} packet
 */
sibilant.DataApiBase.prototype.receive=function(packet) {
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
		handler=this[checkdown[i]];
		if(typeof(handler) === 'function') {
			var evt=sibilant.CancelableEvent({
				'packet': packet,
				'handler' : checkdown[i],
				'dataApi' : this
			});
			this.events.trigger("receive",evt);
			if(!evt.canceled) {
				handler.call(this,packet);
			}
			return;
		}
	}
	
};