/** Creates clients in an iframe so that we can create multiple connections.
 *
 * @param clientUrl - {String} URL path to client.
 * @param callback - {Function(Client)} Passes reference of created client back to caller
 */
var clientIframeShim = function (clientUrl, callback) {
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
            client.testCallbacks = [];

            client.getTestBus = function(callback){
                client.testCallbacks.push(callback);
            };

            callback(client);
		};
	};

	// need at least the body tag to be loaded, so wait until it's loaded
	if (document.readyState === 'complete') {
		createIframeShim();
	} else {
		window.addEventListener("load", createIframeShim, false);
	}
};

/** Factory function for creating clients for tests. Clients have injected test capabilities as do their peer
 *  counterparts.
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
            clientRef.window.addEventListener("message", function(event){
                if(event.data.type === "client.test.response"){
                    for (var i = clientRef.testCallbacks.length - 1; i >=0 ; i--) {
                        var persist = clientRef.testCallbacks[i](event);
                        if (!persist) {
                            clientRef.testCallbacks.splice(i,1);
                        }
                    }
                } else {
                    clientRef.postMessageHandler(event);
                }
            },false);

            clientRef.window.removeEventListener("message",clientRef.postMessageHandler, false);

			clients.push(clientRef);
			count++;
			if (count === clientCount) {
				callback(clients);
			}
		});
	}
};