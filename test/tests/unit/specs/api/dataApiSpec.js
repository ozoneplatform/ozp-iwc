describe("KV API Base class",function() {

	var apiBase;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		apiBase=new ozpIwc.CommonApiBase();
		apiBase.makeValue=function(packet) {
			return new ozpIwc.CommonApiValue();
		};
	});
	
	afterEach(function() {
		apiBase=null;
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
	

	describe("stacklike operations",function() {
		it("supports push on a node",function() {
			var r=apiBase.handlePush(nodePacket("/node",{foo:2}));

			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.resource).toMatch(/node\/[^\/]*/);
		});

		it("stores the value of the push",function() {
			apiBase.handleSet(nodePacket("/node",[]));

			var r=apiBase.handlePush(nodePacket("/node",{foo:2}));
			var r2=apiBase.handleGet(nodePacket(r[0].entity.resource));

			expect(r2[0].entity).toEqual({foo:2});
		});

		it("pops an element from the list in order",function() {
			apiBase.handlePush(nodePacket("/node",{foo:1}));
			apiBase.handlePush(nodePacket("/node",{foo:2}));
			apiBase.handlePush(nodePacket("/node",{foo:3}));
			apiBase.handlePush(nodePacket("/node",{foo:4}));

			expect(apiBase.handlePop(nodePacket("/node"))[0].entity).toEqual({foo:4});
			expect(apiBase.handlePop(nodePacket("/node"))[0].entity).toEqual({foo:3});
			expect(apiBase.handlePop(nodePacket("/node"))[0].entity).toEqual({foo:2});
			expect(apiBase.handlePop(nodePacket("/node"))[0].entity).toEqual({foo:1});
		});

		it("pops an error if the node has no children",function() {
			expect(apiBase.handlePop(nodePacket("/node"))[0].action).toEqual("noChild");
		});

		it("shifts an element from the list in FIFO order",function() {
			apiBase.handlePush(nodePacket("/node",{foo:1}));
			apiBase.handlePush(nodePacket("/node",{foo:2}));
			apiBase.handlePush(nodePacket("/node",{foo:3}));
			apiBase.handlePush(nodePacket("/node",{foo:4}));

			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:1});
			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:2});
			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:3});
			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:4});
		});		
		it("unshifts an element onto the head of the list",function() {
			apiBase.handleUnshift(nodePacket("/node",{foo:1}));
			apiBase.handleUnshift(nodePacket("/node",{foo:2}));
			apiBase.handleUnshift(nodePacket("/node",{foo:3}));
			apiBase.handleUnshift(nodePacket("/node",{foo:4}));

			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:4});
			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:3});
			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:2});
			expect(apiBase.handleShift(nodePacket("/node"))[0].entity).toEqual({foo:1});
		});		

		it("lists the child elements",function() {
			var nodes=[];
			nodes.push(apiBase.handlePush(nodePacket("/node",{foo:1}))[0].entity.resource);
			nodes.push(apiBase.handlePush(nodePacket("/node",{foo:2}))[0].entity.resource);
			nodes.push(apiBase.handlePush(nodePacket("/node",{foo:3}))[0].entity.resource);
			nodes.push(apiBase.handlePush(nodePacket("/node",{foo:4}))[0].entity.resource);

			var r=apiBase.handleList(nodePacket("/node"));
			expect(r[0].action).toEqual("success");
			expect(r[0].entity.length).toEqual(4);
			expect(r[0].entity).toEqual(nodes);
		});
	});

	describe("watch children",function() {
		it("notifies on push a child",function() {
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handlePush(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.addChild).toMatch(/\/node\/[^\/]+/);
		});
		it("notifies on unshifting a child",function() {
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handleUnshift(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.addChild).toMatch(/\/node\/[^\/]+/);
		});

		it("notifies on popping a child",function() {
			apiBase.handlePush(nodePacket("/node",{foo:2}));
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handlePop(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.removeChild).toMatch(/\/node\/[^\/]+/);
		});
		it("notifies on shifting a child",function() {
			apiBase.handlePush(nodePacket("/node",{foo:2}));
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handleShift(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.removeChild).toMatch(/\/node\/[^\/]+/);
		});
	});
});