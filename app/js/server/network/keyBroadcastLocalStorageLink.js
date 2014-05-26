/** @namespace **/
var ozpIwc = ozpIwc || {};

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
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {string} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 * @param {Number} [config.maxRetries] - Number of times packet transmission will retry if failed. Defaults to 0.
 * @param {Number} [config.retryTimeout] - Constant for exponential back off/retry. Defaults to 100ms.
 * 
 */
ozpIwc.KeyBroadcastLocalStorageLink = function(config) {
	config=config || {};

	this.prefix=config.prefix || 'ozpIwc';
	this.peer=config.peer || ozpIwc.defaultPeer;
	this.selfId=config.selfId || this.peer.selfId;
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds
  this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes
  this.maxRetries = config.maxRetries || 5;
  this.retryTimeout = config.retryTimeout || 100; // 1/10 second

  // Hook into the system
	var self=this;
	var packet;
	var receiveStorageEvent=function(event) {
		try {
			packet=JSON.parse(event.key);
		} catch(e) {
			console.log("Parse error on " + event.key );
			ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.parseError').inc();
			return;
		}
		self.peer.receive(self.linkId,packet);
		ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();

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
 * @param {ozpIwc.NetworkPacket} packet
 * @param {Number} [retryCount] - number of times attempted to send packet.  
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.send = function(packet, retryCount) {
  // If this is a retry send, apply an exponentially growing decay each time
  // the packet fails.
  var timeOut = 0;
  if (typeof retryCount !== 'undefined') {
    timeOut = Math.pow(2, retryCount) * 25; 
  } else {
    retryCount = 0;
  }
  
  var self = this;  
  // TODO: timeOut constant doesn't act as expected on paper, 70 ms should give
  //       5 attempts in the 5 second window (~4.5 seconds of timed out), but had to lower
  //       to 25 ms to see actual results
  window.setTimeout(function() {
    try {
      localStorage.setItem(JSON.stringify(packet),"");
      ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.sent').inc();
      localStorage.removeItem(JSON.stringify(packet),"");
    } catch (e) {
      // Call again but back off for an exponential amount of time.      
      if (retryCount <= self.maxRetries) {
        self.send(packet, ++retryCount);
      } else {
        console.log('failed to write in ' + self.maxRetries + ' attempts');
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.failed').inc();
        ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + e);
      }
    } 
  }, timeOut);
  
}

