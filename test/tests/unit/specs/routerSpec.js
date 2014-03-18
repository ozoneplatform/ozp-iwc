
describe("Router",function() {
	var createMsg=function(config) {
		return {
				ver: 1,
				src: config.src || "$nobody",
				dst: config.dst,
				msg_id: config.msg_id || new Date().getTime(),
				time: new Date().getTime(),
				entity: config.entity || {}
			};
	};
	
	var createParticipant=function(config) {
		return {
			origin: config.origin || "foo.com", 
			send: config.send || function(msg){ this.packets.push(msg);},
			packets: []
		};
	};
	
	var router;
	var fakePeer;
	var participant;
	
	beforeEach(function() {	
		sendCount=receiveCount=0;
		
		fakePeer=new sibilant.Event();
		fakePeer.packets=[];
		fakePeer.send=function(packet) {
			fakePeer.packets.push(packet);
		};
		
		router=new sibilant.Router({peer: fakePeer});
		participant=createParticipant("foo.com");
	});
	
	afterEach(function() {
		router=null;
		fakePeer=null;
		participant=null;
	});
	
	it("accepts a participant registration", function() {
		var participantId=router.registerParticipant({},participant);
		expect(participantId).toBeDefined();
	});
	

	
	describe("Participant registration via send", function() {
		it("sends a registration response to a new participant", function() {

			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant);
			var reply=participant.packets[0];
			
			expect(reply).toBeDefined();
			expect(reply.src).toEqual("$transport");
			expect(reply.dst).not.toEqual("$nobody");
			expect(reply.entity.status).toEqual("ok");
		});	
		
		it("calls registration handlers",function() {
			// events.trigger("registerParticipant",participant, message)
			var called=false;
			router.on("preRegisterParticipant",function(event) {
				expect(event.participant).toEqual(participant);
				expect(event.packet.src).toEqual("$nobody");
				expect(event.packet.dst).toEqual("$transport");
				called=true;
			});
			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant);
			expect(called).toEqual(true);
		});

		it("registration handlers can block a participant",function() {
			router.on("preRegisterParticipant",function(event) { 
				if(event.participant.origin === "badguy.com") {
					event.cancel("badguy");
				}
			});
			var badParticipant=createParticipant({origin: "badguy.com"});
			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant);
			router.send(createMsg({src:"$nobody",dst:"$transport"}),badParticipant);
			
			expect(participant.packets[0].entity.status).toEqual("ok");
			expect(badParticipant.packets[0].entity.status).toEqual("denied");
		});
	});

	describe("Sending packets",function() {
		var participant2;
		
		beforeEach(function() {
			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant);
			participant.id=participant.packets[0].dst;
			
			participant2=createParticipant({origin:"bar.com"});
			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant2);
			participant2.id=participant2.packets[0].dst;
		});
		
		it("forwards to peer",function() {
			var msg=createMsg({src: participant.id,dst:"fakeName"});
			router.send(msg,participant);
			expect(fakePeer.packets[0]).toEqual(msg);
		});
		
		it("routes locally", function() {
			var msg=createMsg({src: participant.id,dst:participant2.id});
			router.send(msg,participant);
			expect(participant2.packets[1]).toEqual(msg);
		});
		
		it("doesn't send to peer when routing locally", function() {
			var msg=createMsg({src: participant.id,dst:participant2.id});
			router.send(msg,participant);
			expect(fakePeer.packets.length).toEqual(0);
		});
		
		it("sends to peer when routing locally and forwardAll is true ", function() {
			var msg=createMsg({src: participant.id,dst:participant2.id});
			router.forwardAll=true;
			router.send(msg,participant);
			expect(fakePeer.packets.length).toEqual(1);
		});		
		
	});
});
