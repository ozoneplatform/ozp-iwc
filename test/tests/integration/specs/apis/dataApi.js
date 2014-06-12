/**
 * Network Integration
 */


describe("data.api integration", function () {
	var client;

	beforeEach(function (done) {
		// current version of jasmine breaks if done() is called multiple times
		// use the called flag to prevent this
		var called = false;

        var clientGen = {
            clientCount: 1,
            clientUrl: "http://localhost:14000/integration/additionalOrigin.html"
        };

        generateClients(clientGen, function (clientRefs) {
            if (!called) {
                called = true;
                client = clientRefs[0];
                done();
            }
        });
	});

	afterEach(function () {
		if (client) {
			client.disconnect();
			client = null;
		}
	});


	describe('Common Actions', function () {

		var deletePacket = {
			dst: "keyValue.api",
			action: "delete",
			resource: "/test"
		};
		var setPacket = {
			dst: "keyValue.api",
			action: "set",
			resource: "/test",
			entity: "testData"
		};
		var getPacket = {
			dst: "keyValue.api",
			action: "get",
			resource: "/test"
		};

		beforeEach(function () {

		});

		afterEach(function (done) {
			var called = false;
			client.send(deletePacket, function (reply) {
				if (!called) {
					console.log(reply);
					called = true;
					done();
				}
			});
		});


		it('Client sets values', function () {
			var called = false;
			var sentPacket;

			var setCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentPacket.msgId);
					expect(reply.action).toEqual('success');

					done();
				}
			};

			sentPacket = client.send(setPacket, setCallback);
		});


		it('Client gets values', function (done) {
			var called = false;
			var sentSetPacket, sentGetPacket;
			var getCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentGetPacket.msgId);
					expect(reply.entity).toEqual(sentSetPacket.entity);

					done();
				}
			};

			sentSetPacket = client.send(setPacket, function (reply) {
				sentGetPacket = client.send(getPacket, getCallback);
			});
		});

		it('Client deletes values', function (done) {
			var called = false;
			var sentDeletePacket;
			var deleteCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentDeletePacket.msgId);
					expect(reply.action).toEqual('success');

					done();
				}
			};

			sentDeletePacket = client.send(deletePacket, deleteCallback);
		});


		it('Client watches & un-watches keys', function (done) {
			var called = false;
			var sentWatchPacket, sentUnwatchPacket, sentSetPacket;

			var watchPacket = {
				dst: "keyValue.api",
				action: "watch",
				resource: "/test"
			};

			var unwatchPacket = {
				dst: "keyValue.api",
				action: "unwatch",
				resource: "/test"
			};

			var unwatchCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentUnwatchPacket.msgId);
					expect(reply.action).toEqual('success');

					done();
				}
			};

			var watchCallback = function (reply) {
				if (reply.action === "changed") {

					expect(reply.replyTo).toEqual(sentWatchPacket.msgId);
					expect(reply.entity.newValue).toEqual(sentSetPacket.entity);

					sentUnwatchPacket = client.send(unwatchPacket, unwatchCallback);
				}
			};

			sentWatchPacket = client.send(watchPacket, watchCallback);
			sentSetPacket = client.send(setPacket);
		});
	});

	describe('Collection-like Actions', function () {

		var deletePacket = {
			dst: "keyValue.api",
			action: "delete",
			resource: "/test"
		};
		var listPacket = {
			dst: "keyValue.api",
			action: "list",
			resource: "/test"
		};

		var pushPacket = {
			dst: "keyValue.api",
			action: "push",
			resource: "/test",
			entity: 'testData'
		};

		beforeEach(function () {

		});

		afterEach(function (done) {
			var called = false;
			client.send(deletePacket, function (reply) {
				if (!called) {
					called = true;
					done();
				}
			});
		});


		it('Client pushes values', function (done) {
			var called = false;
			var sentPushPacket;

			var pushCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentPushPacket.msgId);
					expect(reply.action).toEqual('success');

					done();
				}
			};

			sentPushPacket = client.send(pushPacket, pushCallback);
		});


		it('Client pops values', function (done) {
			var called = false;
			var sentPopPacket, sentPushPacket;

			var pushPacket = {
				dst: "keyValue.api",
				action: "push",
				resource: "/test",
				entity: 'testData'
			};
			var popPacket = {
				dst: "keyValue.api",
				action: "pop",
				resource: "/test"
			};

			var popCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentPopPacket.msgId);
					expect(reply.action).toEqual('success');
					expect(reply.entity).toEqual(sentPushPacket.entity);

					done();
				}
			};

			var pushCallback = function(reply) {
				console.log(reply);
				sentPopPacket = client.send(popPacket, popCallback);
			};

			sentPushPacket = client.send(pushPacket, pushCallback);

		});


		it('Client lists values', function (done) {
			var called = false;
			var sentListPacket;

			var listCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentListPacket.msgId);
					expect(reply.action).toEqual('success');

					done();
				}
			};

			sentListPacket = client.send(listPacket, listCallback);
		});


		it('Client unshifts values', function () {
			var called = false;
			var sentUnshiftPacket;

			var unshiftPacket = {
				dst: "keyValue.api",
				action: "unshift",
				resource: "/test"
			};

			var unshiftCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentUnshiftPacket.msgId);
					expect(reply.action).toEqual('success');

					done();
				}
			};

			sentUnshiftPacket = client.send(unshiftPacket, unshiftCallback);
		});


		it('shifts values', function () {
			var called = false;
			var sentShiftPacket;

			var shiftPacket = {
				dst: "keyValue.api",
				action: "shift",
				resource: "/test"

			};

			var shiftCallback = function (reply) {
				if (!called) {
					called = true;

					expect(reply.replyTo).toEqual(sentShiftPacket.msgId);
					expect(reply.action).toEqual('success');
					expect(reply.entity).toEqual('Need to write push first to compare');

					done();
				}
			};

			sentShiftPacket = client.send(shiftPacket, shiftCallback);
		});

	});
});