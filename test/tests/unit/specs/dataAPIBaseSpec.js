describe("Data API Base class",function() {

	var dataApi;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		dataApi=new sibilant.DataApiBase();
	});
	
	afterEach(function() {
		dataApi=null;
		router=null;
	});

	describe("operation as Leader", function() {
		it("responds to a get", function() {
			var r=dataApi.handleGetAsLeader({packet:{
				resource: "foo",
				entity: "bar"
			}});
			
			expect(r.action).toEqual("success");
		});
		
		it("gets and puts data", function() {
			dataApi.handleSetAsLeader({packet:{
				resource: "/node",
				entity: {foo:1}
			}});

			var r=dataApi.handleGetAsLeader({packet:{
					resource: "/node",
					entity: {}
				}});
			expect(r.entity).toEqual({foo:1});
		});
		
		it("deletes data", function() {
			dataApi.handleSetAsLeader({packet:{
				resource: "/node",
				entity: {foo:1}
			}});
			dataApi.handleDeleteAsLeader({packet:{
				resource: "/node",
			}});

			var r=dataApi.handleGetAsLeader({packet:{
					resource: "/node"
			}});
			expect(r.entity).toBeUndefined();
		});
		
	});	
	
	describe("watch data",function() {
		beforeEach(function() {
			dataApi.handleSetAsLeader({packet:{
				resource: "/node",
				entity: {foo:1}
			}});		
		});
		
		it("a watch applies to a node",function() {
			var called=0;
			dataApi.handleWatchAsLeader({
				packet: {resource:"/node"},
				reply: function(packet) {
					if(packet.action==="changed") {
						expect(packet.entity.newValue.foo).toEqual(called+2);
						called++;
					}
				}
			});
			
			dataApi.handleSetAsLeader({packet:{resource:"/node",entity:{foo:2}}});
			dataApi.handleSetAsLeader({packet:{resource:"/node",entity:{foo:3}}});
			dataApi.handleSetAsLeader({packet:{resource:"/node",entity:{foo:4}}});
			
			//var r=dataApi.handleGetAsLeader({packet:{resource:"/node"}});

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
				'replyTo': registrationPacket.msgId,
				'entity': {}
			});
			participant.sendDataApi("set","/node",{foo:13});
			participant.sendDataApi("set","/node",{foo:14});
			
			expect(called).toEqual(3);
		});
	});
	
});