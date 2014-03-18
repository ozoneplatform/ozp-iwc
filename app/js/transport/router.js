
var sibilant=sibilant || {};

sibilant.Router=function(config) {
	config=config || {};
	this.peer=config.peer || sibilant.defaultPeer;
	this.forwardAll=config.forwardAll || false;

	this.nobodyAddress="$nobody";
	this.routerControlAddress='$transport';
	
	var self=this;	
	
	// Stores all local addresses
	this.participants={};
	
	sibilant.metrics.gauge("transport.participants").set(function() {
		return Object.keys(self.participants).length;
	});
	
	var generateMsgId=function() {
		return new Date().getTime();
	};
	
	var checkFormat=function(message) {
		if(message.ver === 1 
				&& message.src 
				&& message.dst ) 
		{
			return true;
		} else {
			sibilant.log.log("Invalid packet: " + JSON.stringify(message));
			sibilant.metrics.counter("transport.packets.invalidFormat").inc();
			return false;
		}
	};
	
	var checkSenderOrigin=function(message,participant) {
		var knownParticipant=self.participants[message.src];
		if(knownParticipant && knownParticipant.origin !== participant.origin) {
			sibilant.metrics.counter("transport.packets.invalidOrigin").inc();
			return false;
		}
		return true;
	};
	
	var events=new sibilant.Event();
	events.mixinOnOff(this);
	events.on("preSend",checkFormat);
	events.on("preSend",checkSenderOrigin);

	events.on("preRoute",checkFormat);
	
	this.self_id=sibilant.util.generateId();
	
	this.createMessage=function(fields) {
		fields.ver = fields.ver || 1;
		fields.time = fields.time || new Date().getTime();
		fields.msg_id = fields.msg_id || generateMsgId();
		return fields;
	};
	this.createReply=function(message,fields) {
		fields=this.createMessage(fields);
		fields.reply_to=message.msg_id;
		fields.src=fields.src || message.dst;
		fields.dst=fields.dst || message.src;
		return fields;
	};
	/**
	 * Allows a listener to add a new participant.  
	 * @param {object} message The handshake requesting registration.
	 * @param {object} participant the participant object that contains a send() function.
	 * @returns {string} returns participant id
	 */
	this.registerParticipant=function(message,participant) {
		var participant_id;
		do {
				participant_id=sibilant.util.generateId() + "." + this.self_id;
		} while(this.participants.hasOwnProperty(participant_id));

		if(events.triggerForObjections("registerParticipant",participant, message))
		{
			// someone vetoed this participant
			sibilant.log.log("registeredParticipant[DENIED] origin:"+participant.origin);
			return null;
		}
		this.participants[participant_id]=participant;
		sibilant.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
		return participant_id;
	};
	
	this.deliverLocal=function(message) {
		// check if the recipient is local.  If so, don't bother broadcasting.
		var localParticipant=this.participants[message.dst];
		if(localParticipant) {
			// short-cutted local delivery is still a delivery...
			sibilant.metrics.counter("transport.packets.received").inc();
			localParticipant.send(message,localParticipant);
			return true;
		}
		return false;
	};
	
	/**
	 * Used by participant listeners to route a message to other participants.
	 * @param {object} message The packet to route.
	 * @param {object} participant Information about the participant that is attempting to send
	 *   the packet.
	 * @returns {undefined}
	 */
	this.send=function(message,participant) {
		// if this is the handshake, register the participant
		// TODO: if the participant sends 10 handshakes, it'll get ten different registrations.
		// should this be prevented?
		if(message.dst === this.routerControlAddress && message.src===this.nobodyAddress) {
			var participantId=this.registerParticipant(message,participant);
			var reply;
			if(participantId === null) {
				reply=this.createReply(message,
					{	dst: this.nobodyAddress,	entity: { status: "denied" } });
			} else {
				reply=this.createReply(message,
					{dst: participantId,	entity: { status: "ok"}	});
			}
			participant.send(reply,participant);
			return;
		}

		if(events.trigger("preSend",message,participant).some(sibilant.assert.are(false))) {
			sibilant.metrics.counter("transport.packets.rejected").inc();
			return false;
		}

		sibilant.metrics.counter("transport.packets.sent").inc();
		if(!this.deliverLocal(message) || this.forwardAll) {
			events.trigger("send",message);
			this.peer.send(message);
		}

	};
		
	/**
	 * Recieve a packet from the peer
	 * @param message {object} the packet to receive
	 */
	this.receiveFromPeer=function(message) {
		if(events.trigger("preRoute",message.data, message).some(sibilant.assert.are(false))){
			return;
		}
		this.deliverLocal(message.data);
	};

	// Wire up to the peer
	this.peer.on("receive",function(packet) {
		self.receiveFromPeer(packet);
	});
		
	// PostMessage listener is so fundamental, there's no point
	// in breaking it out.
	var sendPostMessage=function(message) {
		if(!message) { throw "CANNOT SEND NULL"; }
		this.sourceWindow.postMessage(message,this.origin);
	};
	window.addEventListener("message", function(event) {
		self.send(event.data,{
			origin: event.origin,
			sourceWindow: event.source,
			send: sendPostMessage
		});
	}, false);
};

//TODO: move autocreation elsewhere
sibilant.defaultRouter=new sibilant.Router();