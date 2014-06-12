/** Creates clients in an iframe so that we can create multiple connections.
 *
 * @param clientUrl - {String} URL path to client.
 * @param cb - {Function(Client)} Passes reference of created client back to caller
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
		self.onReady = function (client) {
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
 *
 * @param {Object}clientObj - Specifies the number of clients to generate (clientCount) & the hosting URL (clientUrl)
 * @param {Function({Array})} callback - returns the array of generated clients when all asynchronous work is done.
 */
var generateClients = function (clientObj, callback) {
	var clientCount = clientObj.clientCount || 1;
	var clientUrl = clientObj.clientUrl || "http://localhost:14000/integration/additionalOrigin.html";
	var count = 0;
	var clients = [];
	for (var i = 0; i < clientCount; i++) {
		clientIframeShim(clientUrl, function (clientRef) {
			clients.push(clientRef);
			count++;
			if (count === clientCount) {
				callback(clients);
			}
		});
	}
};
