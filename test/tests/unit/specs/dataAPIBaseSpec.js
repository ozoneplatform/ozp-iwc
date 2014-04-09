describe("Data API Base class",function() {

	var router;
	var dataApi;
	var participant;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		router=new sibilant.Router({peer:new FakePeer()});
		
		dataApi=new sibilant.DataApiBase({
			'name': 'testData',
			'router': router
		});
		
		participant=new TestParticipant({'router':router});
		
		participant.sendDataApi=function(action,path,entity,callback) {
			if(typeof(entity) === 'function') {
				callback=entity;
				entity={};
			}
			
			return participant.send({
				'dst' : "testData.api",
				'action' : action,
				'resource' : path,
				'entity': entity
			},callback);
		};
	});
	
	afterEach(function() {
		dataApi=null;
		router=null;
	});

	describe("operation as Leader", function() {
		beforeEach(function() {
			dataApi.leaderState="Leader";
		});
		
		it("responds to a get", function() {
			var called=0;
			participant.sendDataApi("get","/node",function(value) {
				called++;
				expect(value).toBeDefined();
				expect(value.src).toEqual("testData.api");
			});
			
			expect(called).toEqual(1);
			
		});
		
		it("gets and puts data", function() {
			var called=0;
			participant.sendDataApi("set","/node",{foo:1});

			participant.sendDataApi("get","/node",function(value) {
				expect(value.entity).toBeDefined();
				expect(value.entity).toEqual({foo:1});
				called++;
			});
			expect(called).toEqual(1);
		});
		
		it("deletes data", function() {
			participant.sendDataApi("set","/node",{foo:1});
			participant.sendDataApi("delete","/node");

			participant.sendDataApi("get","/node",function(value) {
				expect(value.entity).toBeUndefined();
			});
		});
		
	});	
	
	describe("watch data",function() {
		beforeEach(function() {
			dataApi.leaderState="Leader";
			participant.sendDataApi("set","/node",{foo:1});
		});
		
		it("a watch applies to a node",function() {
			var called=0;
			participant.sendDataApi("watch","/node",function(packet) {
				if(packet.action==="changed") {
					expect(packet.entity.newValue.foo).toEqual(called+2);
					called++;
				}
			});
			
			participant.sendDataApi("set","/node",{foo:2});
			participant.sendDataApi("set","/node",{foo:3});
			participant.sendDataApi("set","/node",{foo:4});
			
			expect(called).toEqual(3);
		});

		it("a watch triggers on delete",function() {
			var called=0;
			participant.sendDataApi("watch","/node",function(packet) {
				if(packet.action==="changed") {
					expect(packet.entity.newValue).toBeUndefined();
					expect(packet.entity.oldValue.foo).toEqual(1);
					called++;
				}
			});
			
			participant.sendDataApi("delete","/node");
			
			expect(called).toEqual(1);
		});
	
		it("a watch on one node is isolated from other changes",function() {
			var nodeCalled=0,node2Called=0;
			participant.sendDataApi("watch","/node",function(packet) {
				if(packet.action==="changed") {
					expect(packet.entity.newValue.foo).toEqual(nodeCalled+2);
					nodeCalled++;
				}
			});
			
			participant.sendDataApi("watch","/node2",function(packet) {
				if(packet.action==="changed") {
					expect(packet.entity.newValue.foo).toEqual(node2Called+2);
					node2Called++;
				}
			});
			
			participant.sendDataApi("set","/node",{foo:2});
			participant.sendDataApi("set","/node",{foo:3});
			participant.sendDataApi("set","/node",{foo:4});

			participant.sendDataApi("set","/node2",{foo:2});
			participant.sendDataApi("set","/node2",{foo:3});

			expect(nodeCalled).toEqual(3);
			expect(node2Called).toEqual(2);
		});
		
		it("can unregister a watch",function() {
			var called=0;
			var registrationPacket=participant.sendDataApi("watch","/node",function(packet) {
				if(packet.action==="changed") {
					expect(packet.entity.newValue.foo).toEqual(called+2);
					called++;
				}
			});
			
			participant.sendDataApi("set","/node",{foo:2});
			participant.sendDataApi("set","/node",{foo:3});
			participant.sendDataApi("set","/node",{foo:4});
			
			participant.send({
				'dst' : "testData.api",
				'action': "unwatch",
				'resource': "/node",
				'reply_to': registrationPacket.msg_id,
				'entity': {}
			});
			participant.sendDataApi("set","/node",{foo:13});
			participant.sendDataApi("set","/node",{foo:14});
			
			expect(called).toEqual(3);
		});
	});
	
});