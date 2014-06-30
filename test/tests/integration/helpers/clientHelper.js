// ID count for client iframe generation
var iframeId = iframeId || 0;

/** Creates clients in an iframe so that we can create multiple connections.
 *
 * @param clientUrl - {String} URL path to client.
 * @param callback - {Function(Client)} Passes reference of created client back to caller
 */
function createIframeShim (self) {
    return function() {
        self.iframe = document.createElement("iframe");
        self.iframe.id = self.id;
        self.iframe.src = self.clientUrl;
        self.iframe.height = 1;
        self.iframe.width = 1;
        self.iframe.style = "display:none !important;";
        document.body.appendChild(self.iframe);
        self.peer = self.iframe.contentWindow;

        self.onReady = function (client) {
            client.remove = function() {
                var rem = document.getElementById(client.frameElement.id);
                client.disconnect();
                document.body.removeChild(rem);
                client = null;
            };
            self.callback(client);
        };
    }
}

/** Factory function for creating clients for tests.
 *
 * @param {Object}clientObj - Specifies the hosting URL (clientUrl)
 * @param {Function({Array})} callback - returns the generated client.
 */
var generateClient = function (clientObj, callback) {
    var self = this;
    self.clientUrl = clientObj.clientUrl;
    self.callback = callback;
    self.id = iframeId++;

    var iframeFactory = createIframeShim(self);

    // need at least the body tag to be loaded, so wait until it's loaded
    if (document.readyState === 'complete') {
        iframeFactory();
    } else {
        window.addEventListener("load", iframeFactory, false);
    }
};