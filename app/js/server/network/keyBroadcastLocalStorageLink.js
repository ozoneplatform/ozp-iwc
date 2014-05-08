/** @namespace **/
var sibilant = sibilant || {};

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It handles cleaning up
 * the buffer, depduplication of sends, and other trivia.
 * 
 * <p>Individual local storage operations are atomic, but there are no consistency
 * gaurantees between multiple calls.  This means a read, modify, write operation may
 * create race conditions.  The KeyBroadcastLocalStorageLink addresses the concurrency problem without
 * locks by only allowing creation, read, and delete operations.
 * 
 * <p>Each packet is written to it's own key/value pair in local storage.  The key is the
 * of the form "${prefix}|${selfId}|${timestamp}".  Each KeyBroadcastLocalStorageLink owns the lifecycle
 * of packets it creates.
 * 
 * For senders:
 * <ol>
 *   <li> Write a new packet.
 *   <li> Wait config.myKeysTimeout milliseconds.
 *   <li> Delete own packets where the timestamp is expired.
 * </ol>
 * 
 * For receivers:
 * <ol>
 *   <li> Receive a "storage" event containing the new key.
 *   <li> Reads the packets from local storage.
 * </ol>
 * 
 * <p>The potential race condition is if the packet is deleted before the receiver
 * can read it.  In this case, the packet is simply considered lost, but no inconsistent
 * data will be read.
 * 
 * <p>Links are responsible for their own packets, but each will clean up other link's packets
 * on a much larger expiration window (config.otherKeysTimeout).  Race conditions between
 * multiple links interleaving the lockless "list keys" and "delete item" sequence generates
 * a consistent postcondition-- the key will not exist.
 * 
 * @class
 * @param {Object} [config] - Configuration for this link
 * @param {sibilant.Peer} [config.peer=sibilant.defaultPeer] - The peer to connect to.
 * @param {Number} [config.myKeysTimeout=5000] - Milliseconds to wait before deleting this link's keys.
 * @param {Number} [config.otherKeysTimeout=120000] - Milliseconds to wait before cleaning up other link's keys
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
	var packet=JSON.stringify(packet);
	localStorage.setItem(packet,"");
	sibilant.metrics.counter('links.localStorage.packets.sent').inc();
	window.setTimeout(function() {
		localStorage.removeItem(packet);
	},2);
};

