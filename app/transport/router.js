
var Sibilant=Sibilant || {};

(function() {
	
	var routerControlAddress='$transport';
	
	// Stores all local addresses
	var participants={};
	
	Sibilant.Metrics.external(["transport","participants"], function() {
		return Object.keys(participants).length;
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
			Sibilant.Metrics.counter(["transport","packets","invalidFormat"]).inc();
			return false;
		}
	};
	
	var checkSenderOrigin=function(message,participant) {
		var knownParticipant=participants[message.src];
		if(knownParticipant && knownParticipant.origin !== participant.origin) {
			Sibilant.Metrics.counter(["transport","packets","invalidOrigin"]).inc();
			return false;
		}
		return true;
	};
	
	var event=new Sibilant.Event();
	event.on("preSend",checkFormat);
	event.on("preSend",checkSenderOrigin);

	event.on("preRoute",checkFormat);
	
	var self_id=Sibilant.util.generateId();
	
	Sibilant.router={
		createMessage: function(fields) {
			fields.ver = fields.ver || 1;
			fields.time = fields.time || new Date().getTime();
			fields.msg_id = fields.msg_id || generateMsgId();
			return fields;
		},
		createReply: function(message,fields) {
			fields=Sibilant.router.createMessage(fields);
			fields.reply_to=message.msg_id;
			fields.src=fields.src || message.dst;
			fields.dst=fields.dst || message.src;
			return fields;
		},
		
		/**
		 * Used by participant listeners to route a message to other participants.
		 * @param {object} message The packet to route.
		 * @param {object} participant Information about the participant that is attempting to send
		 *   the packet.
		 * @returns {undefined}
		 */
		send: function(message,participant) {
			// if this is the handshake, register the participant
			// TODO: if the participant sends 10 handshakes, it'll get ten different registrations.
			// should this be prevented?
			if(message.dst === routerControlAddress && message.src==="$nobody") {
				Sibilant.router.registerParticipant(message,participant);
			}
			
			if(event.trigger("preSend",message,participant).some(Sibilant.assert.are(false))) {
				Sibilant.Metrics.counter(["transport","packets","rejected"]).inc();
				return false;
			}

			Sibilant.Metrics.counter(["transport","packets","sent"]).inc();

			// check if the recipient is local.  If so, don't bother broadcasting.
			var localParticipant=participants[message.dst];
			if(localParticipant) {
				// short-cutted local delivery is still a delivery...
				Sibilant.Metrics.counter(["transport","packets","received"]).inc();
				localParticipant.send(message,localParticipant);
			} else {
				// otherwise send to the network
				Sibilant.peer.send(message);
			}
		},
		
		/**
		 * Allows a listener to add a new participant.  
		 * @param {object} message The handshake requesting registration.
		 * @param {object} participant the participant object that contains a send() function.
		 * @returns {string} returns participant id
		 */
		registerParticipant: function(message,participant) {
			var participant_id;
			do {
					participant_id=Sibilant.util.generateId() + "." + self_id;
			} while(participants.hasOwnProperty(participant_id));
			
			participants[participant_id]=participant;

			Sibilant.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
			participant.send(Sibilant.router.createReply(message,{
				dst: participant_id,
				entity: { status: "ok", id: participant_id }
			}),participant);
			return participant_id;
		},
		/**
		 * Register a local name participant.
		 * @param {string} name The requested name.
		 * @param {object} participant the participant object that contains a send() function.
		 * @returns {string} returns participant id
		 */
		registerAPI: function(name,participant) {
			if(participants.hasOwnProperty(name)) {
				throw "NAME_ALREADY_REGISTERED";
			}
			
			participants[participant_id]=participant;

			Sibilant.log.log("registeredAPI["+name+"]");
			return true;
		},
		// Could inherit, but meh
		on: function(event,callback) { 
			events.on(event,callback);
		},
		off: function(event,callback) { 
			events.off(event,callback);
		}
	};
	
	Sibilant.peer.on("receive",function(packet) {
		if(event.trigger("preRoute",packet.data, packet)
							.some(Sibilant.assert.are(false))
			) {
			return;
		}
		// only do something if it's one of our participants
		var localParticipant=participants[packet.dst];
		if(localParticipant) {
			Sibilant.Metrics.counter(["transport","packets","received"]).inc();
			localParticipant.send(packet,localParticipant);
		}
		
	});
	
	// PostMessage listener is so fundamental, there's no point
	// in breaking it out.
	var sendPostMessage=function(message,participant) {
		if(!message) {
			throw "CANNOT SEND NULL";
		}
		participant.sourceWindow.postMessage(message,participant.origin);
	};
		
	window.addEventListener("message", function(event) {
		Sibilant.router.send(event.data,{
			origin: event.origin,
			sourceWindow: event.source,
			send: sendPostMessage
		});
	}, false);
})();