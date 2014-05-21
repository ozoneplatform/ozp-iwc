describe("KV API Base class",function() {

	var kvApi;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		kvApi=new ozpIwc.KeyValueApi();
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
			var watchPacket=function(node,src,msgId) {
			return {packet: {
				'src': src,
				'resource' : node,
				'msgId' : msgId
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
		beforeEach(function() {
			kvApi.handleSetAsLeader(nodePacket("/node",{foo:1}));
		});
		
		it("a watch applies to a node",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.oldValue).toEqual({foo:1});
			expect(r[1].entity.newValue).toEqual({foo:2});
		});

		it("a watch triggers on delete",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handleDeleteAsLeader(nodePacket("/node"));
			
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.newValue).toBeUndefined();
			expect(r[1].entity.oldValue).toEqual({foo:1});
		});
	
		it("a watch on one node is isolated from other changes",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));

			kvApi.handleWatchAsLeader(watchPacket("/node2","2",321));
			
			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.oldValue).toEqual({foo:1});
			expect(r[1].entity.newValue).toEqual({foo:2});
			
			// check the second watcher & path
			r=kvApi.handleSetAsLeader(nodePacket("/node2",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("2");
			expect(r[1].replyTo).toEqual(321);
			expect(r[1].resource).toEqual("/node2");
			expect(r[1].entity.oldValue).toBeUndefined();
			expect(r[1].entity.newValue).toEqual({foo:2});
		});
		
		it("can unregister a watch",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));

			var r=kvApi.handleSetAsLeader(nodePacket("/node",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.oldValue).toEqual({foo:1});
			expect(r[1].entity.newValue).toEqual({foo:2});

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
		it("supports push on a node",function() {
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			
			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.resource).toMatch(/node\/[^\/]*/);
		});
		
		it("stores the value of the push",function() {
			kvApi.handleSetAsLeader(nodePacket("/node",[]));
			
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			var r2=kvApi.handleGetAsLeader(nodePacket(r[0].entity.resource));

			expect(r2[0].entity).toEqual({foo:2});
		});
		
		it("pops an element from the list in order",function() {
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:1}));
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:3}));
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:4}));

			expect(kvApi.handlePopAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:4});
			expect(kvApi.handlePopAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:3});
			expect(kvApi.handlePopAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:2});
			expect(kvApi.handlePopAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:1});
		});
		
		it("pops an error if the node has no children",function() {
			expect(kvApi.handlePopAsLeader(nodePacket("/node"))[0].action).toEqual("noChild");
		});
		
		it("shifts an element from the list in FIFO order",function() {
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:1}));
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:3}));
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:4}));

			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:1});
			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:2});
			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:3});
			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:4});
		});		
		it("unshifts an element onto the head of the list",function() {
			kvApi.handleUnshiftAsLeader(nodePacket("/node",{foo:1}));
			kvApi.handleUnshiftAsLeader(nodePacket("/node",{foo:2}));
			kvApi.handleUnshiftAsLeader(nodePacket("/node",{foo:3}));
			kvApi.handleUnshiftAsLeader(nodePacket("/node",{foo:4}));

			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:4});
			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:3});
			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:2});
			expect(kvApi.handleShiftAsLeader(nodePacket("/node"))[0].entity).toEqual({foo:1});
		});		
		
		it("lists the child elements",function() {
			var nodes=[];
			nodes.push(kvApi.handlePushAsLeader(nodePacket("/node",{foo:1}))[0].entity.resource);
			nodes.push(kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}))[0].entity.resource);
			nodes.push(kvApi.handlePushAsLeader(nodePacket("/node",{foo:3}))[0].entity.resource);
			nodes.push(kvApi.handlePushAsLeader(nodePacket("/node",{foo:4}))[0].entity.resource);

			var r=kvApi.handleListAsLeader(nodePacket("/node"));
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.length).toEqual(4);
			expect(r[0].entity).toEqual(nodes);
		});
	});
	
	describe("watch children",function() {
		it("notifies on push a child",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.addChild).toMatch(/\/node\/[^\/]+/);
		});
		it("notifies on unshifting a child",function() {
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handleUnshiftAsLeader(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.addChild).toMatch(/\/node\/[^\/]+/);
		});
		
		it("notifies on popping a child",function() {
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handlePopAsLeader(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.removeChild).toMatch(/\/node\/[^\/]+/);
		});
		it("notifies on shifting a child",function() {
			kvApi.handlePushAsLeader(nodePacket("/node",{foo:2}));
			kvApi.handleWatchAsLeader(watchPacket("/node","1",123));
			
			var r=kvApi.handleShiftAsLeader(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.removeChild).toMatch(/\/node\/[^\/]+/);
		});
		
	});
});