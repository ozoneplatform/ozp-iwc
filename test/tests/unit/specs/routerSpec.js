
describe("Router",function() {
	var createMsg=function(config) {
		var msg={
				ver: 1,
				src: "$nobody",
				dst: config.dst,
				msgId: sibilant.util.now(),
				time: sibilant.util.now(),
				entity: {}
			};
		for(var k in config) {
			msg[k]=config[k];
		}
		return msg;
	};
	
	var router;
	var fakePeer;
	
	beforeEach(function() {	
		sendCount=receiveCount=0;
		
		fakePeer=new sibilant.Event();
		fakePeer.packets=[];
		fakePeer.send=function(packet) {
			fakePeer.packets.push(packet);
		};
		
		router=new sibilant.Router({peer: fakePeer});
	});
	
	afterEach(function() {
		router=null;
		fakePeer=null;
	});
	
	describe("Participant registration", function() {
		var participant;
		beforeEach(function() {
			participant=new TestParticipant({origin:"foo.com"});
		});
		
		it("returns and assigns a participant id", function() {
			var participantId=router.registerParticipant(participant,{});
			expect(participantId).toBeDefined();
			expect(participant.address).toEqual(participantId);
		});
		
		it("assigns a participant id derived from the router id", function() {
			var participantId=router.registerParticipant(participant,{});

			expect(participantId).toMatch(new RegExp("(.*)\."+router.self_id));
		});

		it("calls registration handlers",function() {
			var called=false;

			router.on("preRegisterParticipant",function(event) {
				expect(event.participant).toEqual(participant);
				called=true;
			});
			
			router.registerParticipant(participant,{});
			expect(called).toEqual(true);
		});

		it("blocks a participant if the handler cancels",function() {
			router.on("preRegisterParticipant",function(event) { 
				if(event.participant.origin === "badguy.com") {
					event.cancel("badguy");
				}
			});

			var badParticipant=new TestParticipant({origin: "badguy.com"});

			router.registerParticipant(participant,{});
			router.registerParticipant(badParticipant,{});

			expect(participant.address).not.toBeNull();
			expect(badParticipant.address).toBeUndefined();
		});
	});
	
	describe("Sending packets",function() {
		var participant;
		var participant2;

		beforeEach(function() {
			participant=new TestParticipant({origin:"foo.com"});
			participant2=new TestParticipant({origin:"bar.com"});

			router.registerParticipant(participant);
			router.registerParticipant(participant2);
		});
		
		it("forwards to peer",function() {
			var msg=participant.send({dst:"fakeName"});
			router.send(msg,participant);
			expect(fakePeer.packets[0]).toEqual(msg);
		});
		
		it("routes locally", function() {
			var msg=participant.send({dst:participant2.address});
			router.send(msg,participant);
			expect(participant2.packets[0].packet).toEqual(msg);
			expect(participant2.packets[0].srcParticipant).toBe(participant);
			expect(participant2.packets[0].dstParticipant).toBe(participant2);
		});
	});
	
	describe("Secure routing",function() {
		var participant;
		var participant2;

		beforeEach(function() {
			participant=new TestParticipant({origin:"foo.com"});
			participant2=new TestParticipant({origin:"bar.com"});

			router.registerParticipant(participant);
			router.registerParticipant(participant2);
			
			sibilant.authorization.grant("participant:"+participant.address,["perm:shared","color:blue"]);
			sibilant.authorization.grant("participant:"+participant2.address,["perm:shared","color:red"]);
		});
		
		it("allows receipt of shared permissions",function() {
			var packet=participant.send({
				dst:participant2.address,
				permissions: ["perm:shared"],
				entity: { foo: "bar" }
			});
			
			expect(participant2.packets[0].packet).toEqual(packet);
		});

		it("denies receipt of unshared permissions",function() {
			participant.send({
				dst:participant2.address,
				permissions: ["color:blue"],
				entity: { foo: "bar" }
			});
			
			expect(participant2.packets.length).toEqual(0);
		});
		
		it("denies if the recipient doesn't have all permissions",function() {
			participant.send({
				dst:participant2.address,
				permissions: ["perm:shared","color:blue"],
				entity: { foo: "bar" }
			});
			
			expect(participant2.packets.length).toEqual(0);
		});
		
		it("allows a participant to send a packet to require permissions that it doesn't have, itself",function() {
			var packet=participant.send({
				dst:participant2.address,
				permissions: ["color:red"],
				entity: { foo: "bar" }
			});
			
			expect(participant2.packets[0].packet).toEqual(packet);
		});
		
	});

});
