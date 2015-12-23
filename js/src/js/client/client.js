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
    var Client = function (peerUrl, config) {

        var formattedConfig = formatConfig(peerUrl, config);

        if (formattedConfig.enhancedTimers) {
            util.enabledEnhancedTimers();
        }
        this.type = "default";

        var self = this;
        util.addEventListener('beforeunload', function () {
            self.disconnect();
        });
        genPeerUrlCheck(this, formattedConfig.peerUrl);
        util.ApiPromiseMixin(this, formattedConfig.autoConnect);

        if (util.globalScope.SharedWorker) {
            registerIntentHandlers(this);
        }
    };

    //----------------------------------------------------------
    // Private Properties
    //----------------------------------------------------------
    //

    /**
     * Takes in the various Client parameter options
     * ([string]),([object]),(string,[object]) and formats the config.
     * This is done to not break semver and force updated Client code.
     * @method formatConfig
     * @private
     * @static
     * @param  {[String|Object]} param1 Either the peer url to connect to ,the
     *                                    config object, or undefined to use
     *                                    default connection
     * @param  {[Object]} param2  If peer url string provided in param1, param2
     *                             is the optional config object. If param1 is the
     *                             config object param2 is ignored
     * @return {Object}         Formatted config object
     */
    var formatConfig = function(param1, param2){
        var newConfig = {};
        if(typeof param2 === "object"){
            newConfig = param2;
        }

        if(typeof param1 === "object"){
            //If the legacy style of config
            newConfig = param1;
            newConfig.peerUrl = newConfig.peerUrl || util.scriptDomain;
        } else if(typeof param1 === "string") {
            // let the config object override the string url
            newConfig.peerUrl = newConfig.peerUrl || param1;
        } else {
            // default to assigning script's domain as IWC domain.
            newConfig.peerUrl = util.scriptDomain;
        }
        return newConfig;
    };
    /**
     * A utility method for handshaking the client's connection to the bus.
     * Resolves an external promise.
     * @method initPing
     * @private
     * @static
     * @param {Client} client
     * @param {Promise.resolve} resolve
     * @param {Promise.rej} reject
     */
    var initPing = function (client, resolve, reject) {
        client.send({dst: "$transport", type: client.type}).then(function (response) {
            resolve(response);
        }).catch(function (err) {
            reject(err);
        });
    };

    /**
     * A handler function generator. Creates the post message event "message" handler for the client for its Iframe.
     * Requires an external promise resolve/reject reference to call when the client's postMessage handler has connected
     * to the bus.
     *
     * @method genPostMessageHandler
     * @private
     * @static
     * @param {Client} client
     * @param {Promise.resolve} resolve
     * @param {Promise.rej} reject
     * @returns {Function}
     */
    var genPostMessageHandler = function (client, resolve, reject) {

        return function (event) {
            if (!client.peer || event.origin !== client.peerOrigin || event.source !== client.peer) {
                return;
            }
            try {
                var message = event.data;
                if (typeof(message) === 'string') {
                    message = JSON.parse(event.data);
                }
                // Calls APIPromiseMixin receive handler
                if (message.iwcInit && client.address === "$nobody") {
                    initPing(client, resolve, reject);
                } else {
                    client.receiveFromRouterImpl(message);
                    client.receivedBytes += (event.data.length * 2);
                    client.receivedPackets++;
                }
            } catch (e) {
                // ignore!
            }
        };
    };

    /**
     * Generates the Iframe for the client for IWC bus-domain communication.
     * Due to race condition issues with Chrome, this is an asynchronous task with a slight delay to prevent
     * broken bus connections with Chrome/SharedWorker.
     *
     * @method createIframeShim
     * @private
     * @static
     * @properties {Client} client
     */
    var createIframeShim = function (client, resolve, reject) {

        client.postMessageHandler = genPostMessageHandler(client, resolve, reject);
        util.addEventListener("message", client.postMessageHandler);

        setTimeout(function () {
            client.iframe = document.createElement("iframe");
            var url = client.peerUrl + "/iframe_peer.html";
            if (client.launchParams.log) {
                url += "?log=" + client.launchParams.log;
            }
            if (client.type) {
                url += "?type=" + client.type;
            }
            client.iframe.src = url;
            client.iframe.height = 1;
            client.iframe.width = 1;
            client.iframe.setAttribute("area-hidden", true);
            client.iframe.setAttribute("hidden", true);
            client.iframe.style.setProperty("display", "none", "important");
            document.body.appendChild(client.iframe);
            client.peer = client.iframe.contentWindow;

            if (!util.globalScope.SharedWorker) {
                client.iframe.addEventListener("load", function () {
                    initPing(client, resolve, reject);
                });
            }
        }, 200);
    };

    /**
     * Generates the Peer URL checking logic based on the data type received.
     * @method genPeerUrlCheck
     * @private
     * @static
     * @param {Client} client
     * @param {String|Array|Function} configUrl the url(s) to connect the client on. If function, the output of the
     *                                   function will be used.
     */
    var genPeerUrlCheck = function (client, configUrl) {
        if (typeof(configUrl) === "string") {
            client.peerUrlCheck = function (url) {
                if (typeof url !== 'undefined') {
                    return url;
                } else {
                    return configUrl;
                }

            };
        } else if (Array.isArray(configUrl)) {
            client.peerUrlCheck = function (url) {
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
            client.peerUrlCheck = configUrl;
        } else {
            throw new Error("PeerUrl must be a string, array of strings, or function");
        }
    };

    /**
     * Meta-data for registration to function with SharedWorkers.
     * @private
     * @static
     * @property sharedWorkerRegistrationData
     * @type {{contentType: string, entity: {label: string}}}
     */
    var sharedWorkerRegistrationData = {
        entity: {
            label: 'SharedWorker\'s intent handler'
        }
    };

    /**
     * A utility method for Clients to register to handle application & intent-chooser launching.
     * @method registerIntentHandlers
     * @private
     * @static
     * @param {Client} client
     */
    var registerIntentHandlers = function (client) {
        client.connect().then(function () {
            //-----------------------------------------
            // Intent Chooser Opening Intent Handler
            //-----------------------------------------
            var sharedWorkerIntentChooser = function (data) {
                var cfg = data.entity.config || {};
                util.openWindow(client.peerUrl + "/" + cfg.intentsChooserUri, {
                    "ozpIwc.peer": client.peerUrl,
                    "ozpIwc.intentSelection": cfg.intentSelection
                }, cfg.intentChooserFeatures);
            };
            var intentChooserResource = '/inFlightIntent/chooser/choose/' + client.address;
            client.intents().register(intentChooserResource, sharedWorkerRegistrationData, sharedWorkerIntentChooser);

            //-----------------------------------------
            // Application Launching Intent Handler
            //-----------------------------------------
            var sharedWorkerLauncher = function (data, inFlightIntent) {
                var cfg = data.entity || {};
                util.openWindow(cfg.url, {
                    "ozpIwc.peer": client.peerUrl,
                    "ozpIwc.inFlightIntent": inFlightIntent.resource
                });
                return {intentIncomplete: true};
            };
            var launcherResource = '/application/vnd.ozp-iwc-launch-data-v1+json/run/' + client.address;
            client.intents().register(launcherResource, sharedWorkerRegistrationData, sharedWorkerLauncher);

        });
    };

    //----------------------------------------------------------
    // Public Properties
    //----------------------------------------------------------

    /**
     * Disconnects the client from the IWC bus.
     *
     * @method disconnect
     */
    Client.prototype.disconnect = function () {
        var resolve, reject;
        var retPromise = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        if (this.iframe) {
            this.iframe.src = "about:blank";
            var self = this;
            setTimeout(function () {
                self.iframe.remove();
                self.iframe = null;
                resolve();
            }, 0);
        } else {
            reject();
        }

        return retPromise;
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
                return self.afterConnected();
            });
        }
        return this.connectPromise;
    };

    /**
     * Creates an invisible iFrame Peer for IWC bus communication. Resolves when iFrame communication has been
     * initialized.
     *
     * @method createIframePeer
     * @returns {Promise}
     */
    Client.prototype.createIframePeer = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            // start listening to the bus and ask for an address

            // need at least the body tag to be loaded, so wait until it's loaded
            if (document.readyState === 'complete') {
                createIframeShim(self, resolve, reject);
            } else {
                util.addEventListener("load", function () {
                    createIframeShim(self, resolve, reject);
                });
            }
        });
    };

    /**
     * Client to Bus sending implementation. Not to be used directly.
     * @private
     * @method sendImpl
     * @param {ozpIwc.TransportPacket} packet
     */
    Client.prototype.sendImpl = function (packet) {
        util.safePostMessage(this.peer, packet, '*');
    };

    /**
     * Gathers the launch data passed to the opened application. Launch data can be passed as a query parameter, inside
     * window.name, or inside window.hash as long as it's key is "launchData".
     *
     * Promise resolve with the launchData object.
     *
     * @method getLaunchData
     * @returns {Promise}
     */
    Client.prototype.getLaunchData = function () {
        var self = this;
        return this.connect().then(function () {
            return self.launchParams.launchData;
        });
    };

    return Client;
}(ozpIwc.util));
