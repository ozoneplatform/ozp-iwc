var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

ozpIwc.Client = (function (util) {

    /**
     * This class will be heavily modified in the future.
     * @class Client
     * @namespace ozpIwc
     * @constructor
     * @uses ozpIwc.util.ApiPromiseMixin
     * @todo accept a list of peer URLs that are searched in order of preference
     * @param {Object} config
     * @param {String} config.peerUrl - Base URL of the peer server
     * @param {Object} config.params - Parameters that will be passed to the bus.
     * @param {String} config.params.log - The IWC bus logging level.  One of "NONE","DEFAULT","ERROR","INFO","DEBUG",
     *     or "ALL"
     * @param {Boolean} [config.autoConnect=true] - Whether to automatically find and connect to a peer
     */
    var Client = function (config) {
        config = config || {};

        if(config.enhancedTimers){
            util.enabledEnhancedTimers();
        }
        this.type = "default";

        util.addEventListener('beforeunload', this.disconnect);
        this.genPeerUrlCheck(config.peerUrl);
        util.ApiPromiseMixin(this, config.autoConnect);

        this.registerIntentChooser();
    };

    /**
     * Generates the Peer URL checking logic based on the data type received.
     * @method genPeerUrlCheck
     * @property {String|Array|Function} configUrl the url(s) to connect the client on. If function, the output of the
     *                                   function will be used.
     */
    Client.prototype.genPeerUrlCheck = function (configUrl) {
        if (typeof(configUrl) === "string") {
            this.peerUrlCheck = function (url) {
                if (typeof url !== 'undefined') {
                    return url;
                } else {
                    return configUrl;
                }

            };
        } else if (Array.isArray(configUrl)) {
            this.peerUrlCheck = function (url) {
                if (configUrl.indexOf(url) >= 0) {
                    return url;
                }
                return configUrl[0];
            };
        } else if (typeof(configUrl) === "function") {
            /**
             * @property peerUrlCheck
             * @type String
             */
            this.peerUrlCheck = configUrl;
        } else {
            throw new Error("PeerUrl must be a string, array of strings, or function");
        }
    };

    /**
     * Disconnects the client from the IWC bus.
     *
     * @method disconnect
     */
    Client.prototype.disconnect = function () {
        if (this.iframe) {
            this.iframe.src = "about:blank";
            var self = this;
            window.setTimeout(function () {
                self.iframe.remove();
                self.iframe = null;
            }, 0);
        }
    };


    /**
     * Connects the client from the IWC bus.
     * Fires: {{#crossLink "ozpIwc.Client/connected:event"}}{{/crossLink}}
     *
     * @method connect
     */
    Client.prototype.connect = function () {
        if (!this.connectPromise) {
            var self = this;

            /**
             * Promise to chain off of for client connection asynchronous actions.
             * @property connectPromise
             * @type Promise
             */
            this.connectPromise = util.prerender().then(function () {
                // now that we know the url to connect to, find a peer element
                // currently, this is only via creating an iframe.
                self.peerUrl = self.peerUrlCheck(self.launchParams.peer);
                self.peerOrigin = util.determineOrigin(self.peerUrl);
                return self.createIframePeer();
            }).then(function (message) {
                self.address = message.dst;

                /**
                 * Fired when the client receives its address.
                 * @event #gotAddress
                 */
                self.events.trigger("gotAddress", self);

                return self.afterConnected();
            });
        }
        return this.connectPromise;
    };

    /**
     * Creates an invisible iFrame Peer for IWC bus communication.
     *
     * @method createIframePeer
     */
    Client.prototype.createIframePeer = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            var createIframeShim = function () {
                self.iframe = document.createElement("iframe");
                self.iframe.addEventListener("load", function () {
                    resolve();
                });
                var url = self.peerUrl + "/iframe_peer.html";
                if (self.launchParams.log) {
                    url += "?log=" + self.launchParams.log;
                }
                if (self.type){
                    url += "?type="+ self.type;
                }
                self.iframe.src = url;
                self.iframe.height = 1;
                self.iframe.width = 1;
                self.iframe.setAttribute("area-hidden", true);
                self.iframe.setAttribute("hidden", true);
                self.iframe.style.setProperty("display", "none", "important");
                document.body.appendChild(self.iframe);
                self.peer = self.iframe.contentWindow;


            };
            // need at least the body tag to be loaded, so wait until it's loaded
            if (document.readyState === 'complete') {
                createIframeShim();
            } else {
                util.addEventListener("load", createIframeShim);
            }
        }).then(function () {
            // start listening to the bus and ask for an address
            self.postMessageHandler = function (event) {
                if (!self.peer || event.origin !== self.peerOrigin || event.source !== self.peer){
                    return;
                }
                try {
                    var message = event.data;
                    if (typeof(message) === 'string') {
                        message = JSON.parse(event.data);
                    }
                    // Calls APIPromiseMixin receive handler
                    self.receiveFromRouterImpl(message);
                    self.receivedBytes += (event.data.length * 2);
                    self.receivedPackets++;
                } catch (e) {
                    // ignore!
                }
            };
            // receive postmessage events
            util.addEventListener("message", self.postMessageHandler);
            return self.send({dst: "$transport", type: self.type});
        });
    };

    Client.prototype.sendImpl = function (packet) {
        util.safePostMessage(this.peer, packet, '*');
    };

    var sharedWorkerRegistrationData = {
        contentType: 'application/vnd.ozp-iwc-intent-handler-v1+json',
        entity: {
            label: 'SharedWorker\'s intent chooser'
        }
    };

    Client.prototype.registerIntentChooser= function (event) {
        if(window.SharedWorker) {
            var self = this;
            this.connect().then(function () {
                var sharedWorkerIntentChooser = function(data){
                    var cfg = data.entity.config || {};
                    util.openWindow(self.peerUrl + "/" + cfg.intentsChooserUri, {
                        "ozpIwc.peer": self.peerUrl,
                        "ozpIwc.intentSelection": cfg.intentSelection
                    }, cfg.intentChooserFeatures);
                };
                self.intents().register('/inFlightIntent/chooser/choose', sharedWorkerRegistrationData, sharedWorkerIntentChooser);
            });
        }
    };

    return Client;
}(ozpIwc.util));