/** @namespace **/
var sibilant = sibilant || {};

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It handles cleaning up
 * the buffer, depduplication of sends, and other trivia.
 * 
 * <p>Individual local storage operations are atomic, but there are no consistency
 * gaurantees between multiple calls.  This means a read, modify, write operation may
 * create race conditions.  The LocalStorageLink addresses the concurrency problem without
 * locks by only allowing creation, read, and delete operations.
 * 
 * <p>Each packet is written to it's own key/value pair in local storage.  The key is the
 * of the form "${prefix}|${selfId}|${timestamp}".  Each LocalStorageLink owns the lifecycle
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
sibilant.LocalStorageLink = function(config) {
	config=config || {};

	this.prefix=config.prefix || 'sibilant';
	this.peer=config.peer || sibilant.defaultPeer;
	this.selfId=config.selfId || this.peer.selfId;
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds
	this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes
	
  // Hook into the system
	var self=this;
	
	var receiveStorageEvent=function(event) {
		var key=self.splitKey(event.key);
		if(key) {
			var packet=JSON.parse(localStorage.getItem(event.key));

			if(packet && typeof(packet) === "object") {
				sibilant.metrics.counter('links.localStorage.packets.receive').inc();
				self.peer.receive(self.linkId,packet);
			} else {
				sibilant.metrics.counter('links.localStorage.packets.timedOut').inc();
			}
		}
	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	this.peer.on("send",function(event) { 
		self.send(event.packet); 
	});
	
	this.peer.on("beforeShutdown",function() {
		self.cleanKeys();
		window.removeEventListener('storage',receiveStorageEvent);
	},this);
	

	// METRICS
	sibilant.metrics.gauge('links.localStorage.buffer').set(function() {
		var	stats= {
					used: 0,
					max: 5 *1024 * 1024,
					bufferLen: 0,
					peerUsage: {},
					peerPackets: {}
					
		};
		for(var i=0; i < localStorage.length;++i) {
			var k=localStorage.key(i);
			var v=localStorage.getItem(k);
			
			var size=v.length*2;
			var oldKeyTime = sibilant.util.now() - this.myKeysTimeout;

			stats.used+=size;
			
			var key=self.splitKey(k);
			if(key) {
				stats.peerUsage[key.id] = stats.peerUsage[key.id]?(stats.peerUsage[key.id]+size):size;
				stats.peerPackets[key.id] = stats.peerPackets[key.id]?(stats.peerPackets[key.id]+1):1;
				stats.bufferLen++;
				if(key.createdAt < oldKeyTime) {
					stats.oldKeysCount++;
					stats.oldKeysSize+=size;
				}
			}
		}
			
		return stats;
	});
};

/**
 * Creates a key for the message in localStorage
 * @todo Is timestamp granular enough that no two packets can come in at the same time?
 * @returns {string} a new key
 */
sibilant.LocalStorageLink.prototype.makeKey=function() { 
	return [this.prefix,this.selfId,sibilant.util.now()].join('|');
};

/**
 * If it's a key for a buffered message, split it into the id of the 
 * link that put it here and the time it was created at.
 * @param {type} k The key to split
 * @returns {object} The id and createdAt for the key if it's valid, otherwise null.
 */
sibilant.LocalStorageLink.prototype.splitKey=function(k) { 
	var parts=k.split("|");
	if(parts.length===3 && parts[0]===this.prefix) {
		return { id: parts[1], createdAt: parseInt(parts[2]) };
	}	
	return null;
};

/**
 * Goes through localStorage and looks for expired packets.  Packets owned
 * by this link are removed if they are older than myKeysTimeout.  Other
 * keys are cleaned if they are older than otherKeysTimeout.
 * @todo Coordinate expiration windows.
 * @returns {undefined}
 */
sibilant.LocalStorageLink.prototype.cleanKeys=function() {
	var now=sibilant.util.now();
	var myKeyExpiration = now - this.myKeysTimeout;
	var otherKeyExpiration = now - this.otherKeysTimeout;

	for(var i=0; i < localStorage.length;++i) {
		var keyName=localStorage.key(i);
		var k=this.splitKey(keyName);
		if(k) {
			if((k.id===this.selfId && k.createdAt <= myKeyExpiration) 
					|| (k.createdAt <= otherKeyExpiration)) {
				localStorage.removeItem(keyName);
			}				
		}
	};


};
/**
 * Publishes a packet to other peers.
 * @todo Handle local storage being full.
 * @param {sibilant.NetworkPacket} packet
 */
sibilant.LocalStorageLink.prototype.send=function(packet) { 
	localStorage.setItem(this.makeKey(),JSON.stringify(packet));
	sibilant.metrics.counter('links.localStorage.packets.sent').inc();
	var self=this;
	window.setTimeout(function() {self.cleanKeys();},this.myKeysTimeout); 

};

sibilant.links = sibilant.links || {};
sibilant.links.localStorage=new sibilant.LocalStorageLink();	
