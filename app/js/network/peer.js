
var Sibilant=Sibilant || {};
Sibilant.impl=Sibilant.impl || {};

Sibilant.impl.Peer=function() {
	
	// generate a random 4 byte id
	var self_id=Sibilant.util.generateId();
	
	// unique ids for all packets sent by this peer
	var sequenceCounter=0;

	// track which packetss are seen from each peer
	// key is the name of the peer
	// value is an array that contains the last 50 ids seen
	var packetsSeen={};
	
	var events=new Sibilant.Event();

	// Helper to determine if we've seen this packet before
	var haveSeen=function(packet) {
		// don't forward our own packets
		if(packet.src_peer===self_id) {
			Sibilant.Metrics.counter('network.packets.droppedOwnPacket').inc();
			return true;
		}
		var seen=packetsSeen[packet.src_peer] || [];
		var id=packet.sequence;
		
		
		// abort if we've seen the packet before
		if(seen.some(Sibilant.assert.are(id))) {
			return true;
		}
		
		seen.push(id);
		packetsSeen[packet.src_peer]=seen;
		return false;
	};
		
	this.selfId=function() { return self_id; };
		
	/**
	 * Sends a message to network
	 * Events:
	 *   "presend" => function(packet)
	 *			Called before sending a packet.  The callback can return
	 *			false to prevent the sending of the packet.
	 * @param {type} message
	 * @returns {undefined}
	 */
	this.send= function(message) {
		Sibilant.Metrics.counter('network.packets.sent').inc();
		var packet={
				src_peer: self_id,
				sequence: sequenceCounter++,
				data: message
		};
		var results=events.trigger("presend",packet);
		// as long as none of the handers returned the boolean false, send it out

		if(results.every(Sibilant.assert.isNot(false))) {
			events.trigger("send",packet);
		}
	};

	/**
	 *  Called by the links when a new packet is recieved.
	 *  Events:
	 *   "receive" -- whenever is received from another peer
	 *     Signature: function(packet)
	 * @param {type} linkId
	 * @param {type} packet
	 * @returns {unresolved}
	 */
	this.receive=function(linkId,packet) {
		// drop it if we've seen it before
		if(haveSeen(packet)) {
			Sibilant.Metrics.counter('network.packets.dropped').inc();
			return;
		}
		Sibilant.Metrics.counter('network.packets.received').inc();

		events.trigger("receive",packet,linkId);
	};

	// Could inherit, but meh
	this.on=function(event,callback) { 
		events.on(event,callback);
	};
	this.off=function(event,callback) { 
		events.off(event,callback);
	};


	// Shutdown handling
	var self=this;
	var unloadListener=function() {
		self.shutdown();
	};
	window.addEventListener('beforeunload',unloadListener);

	this.shutdown=function() {
		events.trigger("beforeShutdown");
		window.removeEventListener('beforeunload',unloadListener)
	}

};

Sibilant.peer=new Sibilant.impl.Peer();
			