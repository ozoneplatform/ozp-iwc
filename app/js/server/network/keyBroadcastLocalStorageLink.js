/** @namespace **/
var sibilant = sibilant || {};

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of
 * the localStorageLink that bypasses most of the garbage collection issues.
 * 
 * <p> When a packet is sent, this link turns it to a string, creates a key with that value, and
 * immediately deletes it.  This still sends the storage event containing the packet as the key.
 * This completely eliminates the need to garbage collect the localstorage space, with the associated
 * mutex contention and full-buffer issues.
 * 
 * @todo Fragment the packet if it's more than storage can handle.
 * @todo Compress the key
 * 
 * @class
 * @param {Object} [config] - Configuration for this link
 * @param {sibilant.Peer} [config.peer=sibilant.defaultPeer] - The peer to connect to.
 * @param {string} [config.prefix='sibilant'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 */
sibilant.KeyBroadcastLocalStorageLink = function(config) {
	config=config || {};

	this.prefix=config.prefix || 'sibilant';
	this.peer=config.peer || sibilant.defaultPeer;
	this.selfId=config.selfId || this.peer.selfId;
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds
	this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes

  // Hook into the system
	var self=this;
	
	var receiveStorageEvent=function(event) {
		try {
			var packet=JSON.parse(event.key);
			self.peer.receive(self.linkId,packet);
			sibilant.metrics.counter('links.localStorage.packets.received').inc();
		} catch(e) {
			sibilant.metrics.counter('links.localStorage.packets.parseError').inc();
		}
	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	this.peer.on("send",function(event) { 
		self.send(event.packet); 
	});
	
	this.peer.on("beforeShutdown",function() {
		window.removeEventListener('storage',receiveStorageEvent);
	},this);

};

/**
 * Publishes a packet to other peers.
 * @todo Handle local storage being full.
 * @param {sibilant.NetworkPacket} packet
 */
sibilant.KeyBroadcastLocalStorageLink.prototype.send=function(packet) { 
	try {
		localStorage.setItem(packet,"");
		sibilant.metrics.counter('links.localStorage.packets.sent').inc();
		localStorage.removeItem(packet,"");
	} catch (e) {
		sibilant.metrics.counter('links.localStorage.packets.failed').inc();
		sibilant.log.error("Failed to write packet(len=" + packet.length + "):" + e);
	 }
};

