
describe("Router",function() {
	var createMsg=function(config) {
		return {
				ver: 1,
				src: config.src || "$nobody",
				dst: config.dst,
				msgId: config.msgId || new Date().getTime(),
				time: new Date().getTime(),
				entity: config.entity || {}
			};
	};
	
	var FakeParticipant=sibilant.util.extend(sibilant.Participant,function(config) {
		sibilant.Participant.apply(this,arguments);
		this.origin = config.origin || "foo.com";
		this.receiveFromRouter = config.receiveFromRouter || function(msg){ this.packets.push(msg.packet); return true;};
		this.packets =[];
	});
	
	var createParticipant=function(config) {
		return new FakeParticipant(config);
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
		var participantId=router.registerParticipant(participant,{});
		expect(participantId).toBeDefined();
	});
	
	it("calls registration handlers",function() {
		// events.trigger("registerParticipant",participant, message)
		var called=false;
		router.on("preRegisterParticipant",function(event) {
			expect(event.participant).toEqual(participant);
			called=true;
		});
		router.registerParticipant(participant,{});
		expect(called).toEqual(true);
	});

	it("registration handlers can block a participant",function() {
		router.on("preRegisterParticipant",function(event) { 
			if(event.participant.origin === "badguy.com") {
				event.cancel("badguy");
			}
		});
		var badParticipant=createParticipant({origin: "badguy.com"});

		router.registerParticipant(participant,{});
		router.registerParticipant(badParticipant,{});

		expect(participant.address).not.toBeNull("ok");
		expect(badParticipant.address).toBeUndefined();
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
	});

	describe("Sending packets",function() {
		var participant2;
		
		beforeEach(function() {
			participant2=createParticipant({origin:"bar.com"});

			router.registerParticipant(participant);
			router.registerParticipant(participant2);
		});
		
		it("forwards to peer",function() {
			var msg=createMsg({src: participant.address,dst:"fakeName"});
			router.send(msg,participant);
			expect(fakePeer.packets[0]).toEqual(msg);
		});
		
		it("routes locally", function() {
			var msg=createMsg({src: participant.address,dst:participant2.address});
			router.send(msg,participant);
			expect(participant2.packets[0]).toEqual(msg);
		});
		
		it("doesn't send to peer when routing locally", function() {
			var msg=createMsg({src: participant.address,dst:participant2.address});
			router.send(msg,participant);
			expect(fakePeer.packets.length).toEqual(0);
		});
		
		it("sends to peer when routing locally and forwardAll is true ", function() {
			var msg=createMsg({src: participant.address,dst:participant2.address});
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
			p.address=p.packets[0].dst;
			return p;		
		};
		
		beforeEach(function() {
			router.send(createMsg({src:"$nobody",dst:"$transport"}),participant);
			participant.address=participant.packets[0].dst;
		});
		
		it("allows multicast registration",function() {
			router.send(createMsg({
				src:participant.address,
				dst:"$transport",
				entity: {
					multicast: ["m1"]
				}
			}),participant);
			
			expect(participant.packets[0]).toBeDefined();
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
			
			var msg=createMsg({src: p1.address,dst:"foo",entity: { a: 1}});
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
			
			var msg=createMsg({src: p1.address,dst:"foo",entity: { a: 1}});
			router.send(msg,p1);
			
			expect(fakePeer.packets.length).toEqual(1);
		});
		
		it("allows members to send as the multicast address",function() {
			var p1=registeredParticipant({origin:"bar1.com"},["foo"]);
			var p2=registeredParticipant({origin:"bar2.com"},["foo"]);
			
			var msg=createMsg({src: "foo",dst:p2.address,entity: { a: 1}});
			router.send(msg,p1);
			
			expect(p2.packets[1].entity.a).toEqual(1);
		});
		
		it("prevents non-members from sending as the multicast address",function() {
			var p1=registeredParticipant({origin:"bar1.com"});
			var p2=registeredParticipant({origin:"bar2.com"},["foo"]);
			
			var msg=createMsg({src: "foo",dst:p1.address,entity: { a: 1}});
			router.send(msg,p1);
			
			// just the registration packet
			expect(p2.packets.length).toEqual(1);
		});
		
	});
});
