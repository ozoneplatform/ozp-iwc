/**
 * Multi-peer example.
 *
 */

/** Creates clients in an iframe so that we can create multiple connections.
 * @TODO consider changing the onReady callback (called by iFrame) to something more straight forward.
 * @param clientUrl
 * @param cb
 */
var clientIframeShim = function (clientUrl, cb) {
	var self = this;
	var createIframeShim = function () {
		self.iframe = document.createElement("iframe");
		self.iframe.src = clientUrl;
		self.iframe.height = 1;
		self.iframe.width = 1;
		self.iframe.style = "display:none !important;";
		document.body.appendChild(self.iframe);
		self.peer = self.iframe.contentWindow;
		self.onReady = function(client) {
			cb(client);
		};

	};
	// need at least the body tag to be loaded, so wait until it's loaded
	if (document.readyState === 'complete') {
		createIframeShim();
	} else {
		window.addEventListener("load", createIframeShim, false);
	}
};

/**
 * @TODO consider finding a cleaner way than chained callbacks to prepare the clients.
 */
describe('Participant Integration', function () {
	var clientA, clientB;

	var setPacket = {
		dst:"keyValue.api",
		action:"set",
		resource:"/test",
		entity:"test works"
	};

	var watchPacket = {
		dst:"keyValue.api",
		action:"watch",
		resource:"/test"
	};

	beforeEach(function(done){
		clientIframeShim("http://localhost:14000/integration/additionalOrigin.html", function(client) {
			clientA = client;
			clientIframeShim("http://localhost:14000/integration/additionalOrigin.html", function(client) {
				clientB = client;
				done();
			});
		});
	});

	it('can send from iframe', function(done){
		var called = false;
		clientB.send(watchPacket, function(reply){
			if (reply.action === 'changed' && !called) {
				called = true;
				expect(reply.action).toEqual('changed');
				expect(reply.entity.newValue).toEqual(setPacket.entity);
				done();
			};
		});

		clientA.send(setPacket);
	});


	it('can cancel callbacks', function() {
		var sentWatchPacket = clientA.send(watchPacket, function(reply){
			expect(false).toEqual(true);
		});

		delete clientA.replyCallbacks[sentWatchPacket.msgId];
		clientB.send(setPacket);
	})

});
