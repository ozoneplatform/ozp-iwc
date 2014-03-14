
var Sibilant=Sibilant || {};
Sibilant.impl=Sibilant.impl || {};

Sibilant.impl.Router=function(config) {
	config=config || {};
	this.peer=config.peer || Sibilant.peer;
	this.forwardAll=config.forwardAll || false;

	this.nobodyAddress="$nobody";
	this.routerControlAddress='$transport';
	
	var self=this;	
	
	// Stores all local addresses
	this.participants={};
	
	Sibilant.Metrics.gauge("transport.participants").set(function() {
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
			Sibilant.log.log("Invalid packet: " + JSON.stringify(message));
			Sibilant.Metrics.counter("transport.packets.invalidFormat").inc();
			return false;
		}
	};
	
	var checkSenderOrigin=function(message,participant) {
		var knownParticipant=self.participants[message.src];
		if(knownParticipant && knownParticipant.origin !== participant.origin) {
			Sibilant.Metrics.counter("transport.packets.invalidOrigin").inc();
			return false;
		}
		return true;
	};
	
	var events=new Sibilant.Event();
	events.on("preSend",checkFormat);
	events.on("preSend",checkSenderOrigin);

	events.on("preRoute",checkFormat);
	
	this.self_id=Sibilant.util.generateId();
	
	this.createMessage=function(fields) {
		fields.ver = fields.ver || 1;
		fields.time = fields.time || new Date().getTime();
		fields.msg_id = fields.msg_id || generateMsgId();
		return fields;
	};
	this.createReply=function(message,fields) {
		fields=Sibilant.router.createMessage(fields);
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
				participant_id=Sibilant.util.generateId() + "." + this.self_id;
		} while(this.participants.hasOwnProperty(participant_id));

		if(events.trigger("registerParticipant",participant, message)
						.some(Sibilant.assert.are(false)))
		{
			// someone vetoed this participant
			Sibilant.log.log("registeredParticipant[DENIED] origin:"+participant.origin);

			participant.send(Sibilant.router.createReply(message,{
				dst: this.nobodyAddress,
				entity: { status: "denied" }
			}),participant);
			return null;
		}

		this.participants[participant_id]=participant;

		participant.send(Sibilant.router.createReply(message,{
			dst: participant_id,
			entity: { status: "ok", id: participant_id }
		}),participant);

		Sibilant.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
		
		return participant_id;
	};
	
	this.deliverLocal=function(message) {
		// check if the recipient is local.  If so, don't bother broadcasting.
		var localParticipant=this.participants[message.dst];
		if(localParticipant) {
			// short-cutted local delivery is still a delivery...
			Sibilant.Metrics.counter("transport.packets.received").inc();
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
			Sibilant.router.registerParticipant(message,participant);
			return;
		}

		if(events.trigger("preSend",message,participant).some(Sibilant.assert.are(false))) {
			Sibilant.Metrics.counter("transport.packets.rejected").inc();
			return false;
		}

		Sibilant.Metrics.counter("transport.packets.sent").inc();
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
		if(events.trigger("preRoute",message.data, message).some(Sibilant.assert.are(false))){
			return;
		}
		this.deliverLocal(message.data);
	};

	
	this.on=function(e,callback) { 
			events.on(e,callback);
	};
	
	this.off=function(e,callback) { 
			events.off(e,callback);
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

Sibilant.router=new Sibilant.impl.Router();