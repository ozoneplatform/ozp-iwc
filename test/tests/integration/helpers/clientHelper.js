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
            client.testCallbacks = [];
            client.getPeer = function(callback){
                client.testCallbacks.push(callback);
                client.peer.postMessage({type:"client.test.request"}, "http://localhost:14002");
            };
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
            clientRef.window.addEventListener("message",function(event){
                if(event.data.type === "client.test.response"){
                    if(clientRef.testCallbacks.length > 0) {
                        for (var i = 0; i < clientRef.testCallbacks.length; i++) {
                            if(clientRef.testCallbacks[i]) {
                                var persist = clientRef.testCallbacks[i](event);
                                if (!persist) {
                                    delete clientRef.testCallbacks[i];
                                }
                            }
                        }
                    }
                } else {
                    clientRef.postMessageHandler(event);
                }
            },false);
            clientRef.window.removeEventListener("message",clientRef.postMessageHandler,false);

			clients.push(clientRef);
			count++;
			if (count === clientCount) {
				callback(clients);
			}
		});
	}
};