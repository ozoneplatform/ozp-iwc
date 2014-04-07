
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
			receive: config.receive || function(msg){ this.packets.push(msg); return true;},
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
		participant=createParticipant({origin:"foo.com"});
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
	
	describe("multicast",function() {
		var registeredParticipant=function(config,multicastGroups) {
			var p=createParticipant(config);
			router.send(createMsg({
				src:"$nobody",
				dst:"$transport",
				entity: {
					multicast: multicastGroups
				}
			}),p);
			p.id=p.packets[0].dst;
			return p;		
		};
		
		beforeEach(function() {
			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant);
			participant.id=participant.packets[0].dst;
		});
		
		it("allows multicast registration",function() {
			router.send(createMsg({
				src:participant.id,
				dst:"$transport",
				entity: {
					multicast: ["m1"]
				}
			}),participant);
			
			expect(participant.packets[1]).toBeDefined();
		});
		it("allows multicast registration in the connection",function() {
			var p=registeredParticipant({origin:"bar.com"},["foo"]);
			
			expect(p.packets[0].multicastAdded[0]).toEqual("foo");
		});

		it("multicast works locally",function() {
			var p1=registeredParticipant({origin:"bar1.com"},["foo"]);
			var p2=registeredParticipant({origin:"bar2.com"},["foo"]);
			var p3=registeredParticipant({origin:"bar3.com"},["foo"]);
			var p4=registeredParticipant({origin:"bar4.com"},["foo"]);
			
			var msg=createMsg({src: p1.id,dst:"foo",entity: { a: 1}});
			router.send(msg,p1);
			
			expect(p2.packets[1].entity.a).toEqual(1);
			expect(p3.packets[1].entity.a).toEqual(1);
			expect(p4.packets[1].entity.a).toEqual(1);
		});

		it("multicast always forwards to peer",function() {
			var p1=registeredParticipant({origin:"bar1.com"},["foo"]);
			var p2=registeredParticipant({origin:"bar2.com"},["foo"]);
			var p3=registeredParticipant({origin:"bar3.com"},["foo"]);
			var p4=registeredParticipant({origin:"bar4.com"},["foo"]);
			
			var msg=createMsg({src: p1.id,dst:"foo",entity: { a: 1}});
			router.send(msg,p1);
			
			expect(fakePeer.packets.length).toEqual(1);
		});
		
		it("allows members to send as the multicast address",function() {
			var p1=registeredParticipant({origin:"bar1.com"},["foo"]);
			var p2=registeredParticipant({origin:"bar2.com"},["foo"]);
			
			var msg=createMsg({src: "foo",dst:p2.id,entity: { a: 1}});
			router.send(msg,p1);
			
			expect(p2.packets[1].entity.a).toEqual(1);
		});
		
		it("prevents non-members from sending as the multicast address",function() {
			var p1=registeredParticipant({origin:"bar1.com"});
			var p2=registeredParticipant({origin:"bar2.com"},["foo"]);
			
			var msg=createMsg({src: "foo",dst:p1.id,entity: { a: 1}});
			router.send(msg,p1);
			
			// just the registration packet
			expect(p2.packets.length).toEqual(1);
		});
		
	});
});
