describe("KV API Base class",function() {

	var kvApi;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		kvApi=new sibilant.KeyValueApi();
	});
	
	afterEach(function() {
		kvApi=null;
		router=null;
	});

	var nodePacket=function(resource,entity) {
		return {packet: {
			'resource': resource,
			'entity': entity
		}};
	};
	
	describe("operation as Leader", function() {
		it("responds to a get", function() {
			var r=kvApi.handleGetAsLeader(nodePacket("/node","bar"));
			
			expect(r[0].action).toEqual("success");
		});
		
		it("gets and puts data", function() {
			kvApi.handleSetAsLeader(nodePacket("/node",{foo:1}));

			var r=kvApi.handleGetAsLeader(nodePacket("/node"));
			expect(r[0].entity).toEqual({foo:1});
		});
		
		it("deletes data", function() {
			kvApi.handleSetAsLeader({packet:{
				resource: "/node",
				entity: {foo:1}
			}});
			kvApi.handleDeleteAsLeader({packet:{
				resource: "/node",
			}});

			var r=kvApi.handleGetAsLeader({packet:{
					resource: "/node"
			}});
			expect(r.entity).toBeUndefined();
		});
		
	});	
	
	describe("watch data",function() {
		var watchPacket=function(node,src,msgId) {
			return {packet: {
				'src': src,
				'resource' : node,
				'msgId' : msgId
			}};
		};
		
		beforeEach(function() {
			kvApi.handleSetAsLeader(nodePacket("/node",{foo:1}));
		});
		
		it("a watch applies to a node",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			expect(r[0].action).toEqual("changed");
			expect(r[0].dst).toEqual("1");
			expect(r[0].replyTo).toEqual(123);
			expect(r[0].resource).toEqual("/node");
			expect(r[0].entity.oldValue).toEqual({foo:1});
			expect(r[0].entity.newValue).toEqual({foo:2});
		});

		it("a watch triggers on delete",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handleDeleteAsLeader(nodePacket("/node"));
			
			expect(r[0].action).toEqual("changed");
			expect(r[0].dst).toEqual("1");
			expect(r[0].replyTo).toEqual(123);
			expect(r[0].resource).toEqual("/node");
			expect(r[0].entity.newValue).toBeUndefined();
			expect(r[0].entity.oldValue).toEqual({foo:1});
		});
	
		it("a watch on one node is isolated from other changes",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));

			kvApi.handleWatchAsLeader(watchPacket("/node2","2",321));
			
			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[0].action).toEqual("changed");
			expect(r[0].dst).toEqual("1");
			expect(r[0].replyTo).toEqual(123);
			expect(r[0].resource).toEqual("/node");
			expect(r[0].entity.oldValue).toEqual({foo:1});
			expect(r[0].entity.newValue).toEqual({foo:2});
			
			// check the second watcher & path
			r=kvApi.handleSetAsLeader(nodePacket("/node2",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[0].action).toEqual("changed");
			expect(r[0].dst).toEqual("2");
			expect(r[0].replyTo).toEqual(321);
			expect(r[0].resource).toEqual("/node2");
			expect(r[0].entity.oldValue).toBeUndefined();
			expect(r[0].entity.newValue).toEqual({foo:2});
		});
		
		it("can unregister a watch",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));

			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[0].action).toEqual("changed");
			expect(r[0].dst).toEqual("1");
			expect(r[0].replyTo).toEqual(123);
			expect(r[0].resource).toEqual("/node");
			expect(r[0].entity.oldValue).toEqual({foo:1});
			expect(r[0].entity.newValue).toEqual({foo:2});

			kvApi.handleUnwatchAsLeader({packet: {
					resource: "/node",
					src: "1",
					replyTo: 123
			}});
			
			
			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");

		});
	});
	
	describe("stacklike operations",function() {
		it("supports push on an empty array",function() {
			kvApi.handleSetAsLeader(nodePacket("/node",[]));
			
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			
			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.oldValue).toEqual([]);
			expect(r[0].entity.newValue).toEqual([{foo:2}]);
		});

		it("supports push on a pre-existing array",function() {
			kvApi.handleSetAsLeader(nodePacket("/node",[{foo:1},{foo:2}]));
			
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:3}));
			
			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.newValue).toEqual([{foo:1},{foo:2},{foo:3}]);
		});
		
		it("supports push on an empty value",function() {
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			
			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.oldValue).not.toBeDefined();
			expect(r[0].entity.newValue).toEqual([{foo:2}]);
		});
		
		it("pushes an array value as the last member, rather than concatenation",function() {
			kvApi.handleSetAsLeader(nodePacket("/node",[{foo:1},{foo:2}]));
			
			var r=kvApi.handlePushAsLeader(nodePacket("/node",[{foo:3}]));
			
			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.newValue).toEqual([{foo:1},{foo:2},[{foo:3}]]);
		});
		
		it("fails on a non-array value",function() {
			kvApi.handleSetAsLeader(nodePacket("/node",{foo:1}));
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			
			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("invalidOperation");
		});
		

		
	});
	
});