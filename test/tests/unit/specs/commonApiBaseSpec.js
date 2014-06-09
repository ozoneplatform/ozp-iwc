describe("Common API Base class",function() {

	var apiBase;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		apiBase=new ozpIwc.CommonApiBase();
		apiBase.makeValue=function(packet) {
			return new ozpIwc.CommonApiValue({resource: packet.resource});
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
	
	it("responds to a get", function() {
		var r=apiBase.handleGet(nodePacket("/node","bar"));

		expect(r[0].action).toEqual("success");
	});

	it("gets and puts data", function() {
		apiBase.handleSet(nodePacket("/node",{foo:1}));

		var r=apiBase.handleGet(nodePacket("/node"));
		expect(r[0].entity).toEqual({foo:1});
	});

	it("deletes data", function() {
		apiBase.handleSet({packet:{
			resource: "/node",
			entity: {foo:1}
		}});
		apiBase.handleDelete({packet:{
			resource: "/node"
		}});

		var r=apiBase.handleGet({packet:{
				resource: "/node"
		}});
		expect(r.entity).toBeUndefined();
	});

	describe("watch data",function() {
		beforeEach(function() {
			apiBase.handleSet(nodePacket("/node",{foo:1}));
		});

		it("a watch applies to a node",function() {
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handleSet(nodePacket("/node",{foo:2}));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.oldValue.entity).toEqual({foo:1});
			expect(r[1].entity.newValue.entity).toEqual({foo:2});
		});

		it("a watch triggers on delete",function() {
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handleDelete(nodePacket("/node"));

			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.newValue).toBeUndefined();
			expect(r[1].entity.oldValue.entity).toEqual({foo:1});
		});

		it("a watch on one node is isolated from other changes",function() {
			apiBase.handleWatch(watchPacket("/node","1",123));

			apiBase.handleWatch(watchPacket("/node2","2",321));

			var r=apiBase.handleSet(nodePacket("/node",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.oldValue.entity).toEqual({foo:1});
			expect(r[1].entity.newValue.entity).toEqual({foo:2});

			// check the second watcher & path
			r=apiBase.handleSet(nodePacket("/node2",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("2");
			expect(r[1].replyTo).toEqual(321);
			expect(r[1].resource).toEqual("/node2");
			expect(r[1].entity.oldValue).toBeUndefined();
			expect(r[1].entity.newValue.entity).toEqual({foo:2});
		});

		it("can unregister a watch",function() {
			apiBase.handleWatch(watchPacket("/node","1",123));

			var r=apiBase.handleSet(nodePacket("/node",{foo:2}));

			// the change message and the confirmation of set
			expect(r.length).toEqual(2);
			expect(r[1].action).toEqual("changed");
			expect(r[1].dst).toEqual("1");
			expect(r[1].replyTo).toEqual(123);
			expect(r[1].resource).toEqual("/node");
			expect(r[1].entity.oldValue.entity).toEqual({foo:1});
			expect(r[1].entity.newValue.entity).toEqual({foo:2});

			apiBase.handleUnwatch({packet: {
					resource: "/node",
					src: "1",
					replyTo: 123
			}});


			var r=apiBase.handleSet(nodePacket("/node",{foo:2}));

			expect(r.length).toEqual(1);
			expect(r[0].action).toEqual("success");

		});
	});

});