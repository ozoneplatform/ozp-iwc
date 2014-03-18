
var sibilant = sibilant || {};
sibilant.links = sibilant.links || {};

/**
 * @class
 * @param {sibilant.peer} [config.peer=sibilant.peer] - The peer to connect to.
 * @param {Object} [config] - Configuration for this link
 * @param {Number} [config.myKeysTimeout=5000] - Milliseconds to wait before deleting this link's keys.
 * @param {Number} [config.otherKeysTimeout=120000] - Milliseconds to wait before cleaning up other link's keys
 * @param {string} [config.prefix='sibilant'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 * @returns {undefined}
 */
sibilant.LocalStorageLink = function(config) {
	config=config || {};

	this.prefix=config.prefix || 'sibilant';
	this.peer=config.peer || sibilant.defaultPeer;
	this.selfId=config.selfId || this.peer.selfId();
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
			}
		}
	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	this.peer.on("send",this.send,this);
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
			var oldKeyTime = new Date().getTime() - this.myKeysTimeout;

			stats.used+=size;
			
			var key=self.splitKey(k);
			if(key) {
				stats.peerUsage[stats.id] = stats.peerUsage[stats.id]?(stats.peerUsage[stats.id]+size):size;
				stats.peerPackets[stats.id] = stats.peerPackets[stats.id]?(stats.peerPackets[stats.id]+1):1;
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
 * @returns {string} a new key
 */
sibilant.LocalStorageLink.prototype.makeKey=function() { 
	return [this.prefix,this.selfId,new Date().getTime()].join('|');
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
 * Returns the time since epoch in milliseconds.  Only exists so that
 * it can be overriden in the unit tests to check expiration.
 * @returns {Number}
 */
sibilant.LocalStorageLink.prototype.getNow=function() {
	return new Date().getTime();
};

/**
 * Goes through localStorage and looks for expired packets.  Packets owned
 * by this link are removed if they are older than myKeysTimeout.  Other
 * keys are cleaned if they are older than otherKeysTimeout.
 * @returns {undefined}
 */
sibilant.LocalStorageLink.prototype.cleanKeys=function() {
	var now=this.getNow();
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
 * @param {type} packet
 * @returns {undefined}
 */
sibilant.LocalStorageLink.prototype.send=function(packet) { 
	localStorage.setItem(this.makeKey(),JSON.stringify(packet));
	sibilant.metrics.counter('links.localStorage.packets.sent').inc();
	var self=this;
	window.setTimeout(function() {self.cleanKeys();},this.myKeysTimeout); 

};

sibilant.links.localStorage=new sibilant.LocalStorageLink();	
