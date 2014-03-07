
var Sibilant=Sibilant || {};

(function() {
	
	// generate a random 4 byte id
	var self_id=Sibilant.util.generateId();
	
	// unique ids for all packets sent by this peer
	var sequenceCounter=0;

	// the different link mechanisms for talking between peers
	// the key is the mechanism ID, the value is an object with fields
	//    send - handler to send to
	//    stats - stats on this handler
	var links={};

	// track which packetss are seen from each peer
	// key is the name of the peer
	// value is an array that contains the last 50 ids seen
	var packetsSeen={};

	// Helper to determine if we've seen this packet before
	var haveSeen=function(packet) {
		// don't forward our own packets
		if(packet.src_peer===self_id) {
			Sibilant.Metrics.counter(['packets','droppedOwnPacket']).inc();
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
	
	var eachLink=function(func) {
		for(var k in links) {
			func(k,links[k]);
		}
	};
	var events=new Sibilant.Event();
	Sibilant.peer={
		
		selfId: function() { return self_id; },
		
		/**
		 * Sends a message to network
		 * Events:
		 *   "presend" => function(packet)
		 *			Called before sending a packet.  The callback can return
		 *			false to prevent the sending of the packet.
		 * @param {type} message
		 * @returns {undefined}
		 */
		send: function(message) {
      Sibilant.Metrics.counter(['packets','sent']).inc();
			var packet={
					src_peer: self_id,
					sequence: sequenceCounter++,
					data: message
			};
			var results=events.trigger("presend",packet);
			// as long as none of the handers returned the boolean false, send it out
			
			if(results.every(Sibilant.assert.isNot(false))) {
				eachLink(function(id,link) {
					link.send(packet);
				});
			}
		},
						
		/**
		 *  Called by the links when a new packet is recieved.
		 *  Events:
		 *   "receive" -- whenever is received from another peer
		 *     Signature: function(packet)
		 * @param {type} linkId
		 * @param {type} packet
		 * @returns {unresolved}
		 */
		receive: function(linkId,packet) {
			// drop it if we've seen it before
			if(haveSeen(packet)) {
				Sibilant.Metrics.counter(['packets','dropped']).inc();
				return;
			}
			Sibilant.Metrics.counter(['packets','received']).inc();
			
			events.trigger("receive",packet);
		},
						
		/**
		 * Register a new link type to send/receive packets
		 * @param {type} id
		 * @param {object} handler
		 * @returns {undefined}
		 */
		addLink: function(id,handler) {
			links[id]= handler;
		},

		
		// Could inherit, but meh
		on: function(event,callback) { 
			events.on(event,callback);
		},
		off: function(event,callback) { 
			events.off(event,callback);
		}
		
		
	};
	/**
	 * Give the links a chance to shut down gracefully
	 */
	window.addEventListener('beforeunload',function() {
		eachLink(function(id,link) {
			link.shutdown();
		});
	});
})();