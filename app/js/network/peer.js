
var sibilant=sibilant || {};

/**
* @typedef sibilant.NetworkPacket
* @property {string} src_peer - The id of the peer who broadcast this packet.
* @property {string} sequence - A monotonically increasing, unique identifier for this packet
* @property {object} data - The payload of this packet.
*/

/**
 * @event sibilant.Peer#preSend
 * @property {sibilant.NetworkPacket} packet
 * @property {boolean} reject
 * @property {string} rejectReason
*/

/**
 * @event sibilant.Peer#receive
 * @property {sibilant.NetworkPacket} packet
 * @property {string} linkId
 */

/**
 * @event sibilant.Peer#send
 * @property {sibilant.NetworkPacket} packet
 */

/**
 * @event sibilant.Peer#beforeShutdown
 */


sibilant.Peer=function() {
	
	// generate a random 4 byte id
	var self_id=sibilant.util.generateId();
	
	// unique ids for all packets sent by this peer
	var sequenceCounter=0;

	// track which packetss are seen from each peer
	// key is the name of the peer
	// value is an array that contains the last 50 ids seen
	var packetsSeen={};
	
	var events=new sibilant.Event();
	events.mixinOnOff(this);

	// Helper to determine if we've seen this packet before
	var haveSeen=function(packet) {
		// don't forward our own packets
		if(packet.src_peer===self_id) {
			sibilant.metrics.counter('network.packets.droppedOwnPacket').inc();
			return true;
		}
		var seen=packetsSeen[packet.src_peer] || [];
		var id=packet.sequence;
		
		
		// abort if we've seen the packet before
		if(seen.some(sibilant.assert.are(id))) {
			return true;
		}
		
		seen.push(id);
		packetsSeen[packet.src_peer]=seen;
		return false;
	};
		
	this.selfId=function() { return self_id; };
		
	/**
	 * Sends a message to network
	 * @fires sibilant.Peer#preSend
	 * @fires sibilant.Peer#send
	 * @param {object} packet
	 */
	this.send= function(packet) {
		sibilant.metrics.counter('network.packets.sent').inc();
		var packet={
				src_peer: self_id,
				sequence: sequenceCounter++,
				data: packet
		};
		// as long as none of the handers returned the boolean false, send it out
		var preSendEvent={
			'packet': packet,
			'reject': true,
			'rejectReason' : ""
		};
		
		events.trigger("preSend",preSendEvent);
		if(preSendEvent.reject) {
			events.trigger("send",{'packet':packet});
		}
	};

	/**
	 * Called by the links when a new packet is recieved.
	 * @fires sibilant.Peer#receive
	 * @param {string} linkId
	 * @param {sibilant.NetworkPacket} packet
	 * @returns {unresolved}
	 */
	this.receive=function(linkId,packet) {
		// drop it if we've seen it before
		if(haveSeen(packet)) {
			sibilant.metrics.counter('network.packets.dropped').inc();
			return;
		}
		sibilant.metrics.counter('network.packets.received').inc();

		events.trigger("receive",{'packet':packet,'linkId': linkId});
	};

	// Shutdown handling
	var self=this;
	var unloadListener=function() {
		self.shutdown();
	};
	window.addEventListener('beforeunload',unloadListener);

	 /**
	  * @fires sibilant.Peer#send
	  */
	this.shutdown=function() {
		events.trigger("beforeShutdown");
		window.removeEventListener('beforeunload',unloadListener);
	};

};
// TODO: move autocreation to a different file
sibilant.defaultPeer=new sibilant.Peer();
			