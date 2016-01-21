var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */

ozpIwc.api.base = ozpIwc.api.base || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 */

ozpIwc.api.base.Api = (function (api, log, transport, util) {
    /**
     * The base class for APIs. Use {{#crossLink "ozpIwc.api.createApi"}}{{/crossLink}} to subclass
     * this.
     *
     * Leader State Management
     * =======================
     * The base API uses locks.api to always have a single leader at a time.  An api instance goes
     * through a linear series of states:  member -> loading -> leader
     * * __member__ does not service requests
     * * __loading__ is a transitory state between acquiring the leader lock and being ready to serve requests
     * * __leader__ actively serves requests and broadcasts a death scream upon shutdown
     *
     * The member state has two substates-- ready and dormant
     *  * __ready__ queues requests in case it has to become leader.  switches back to dormant on discovering a leader
     *  * __dormant__ silently drops requests.  Upon hearing a deathScream, it switches to ready.
     * @class Api
     * @namespace ozpIwc.api.base
     * @uses ozpIwc.util.Event
     * @constructor
     * @param {Object} config
     * @param {String} config.name The api address (e.g. "names.api")
     * @param {ozpIwc.transport.participant.Client} [config.participant= new ozpIwc.transport.participant.Client()] The
     *     connection to use for communication
     * @param {ozpIwc.policyAuth.PDP} config.authorization The authorization component for this module.
     * @param {ozpIwc.transport.Router} config.router The router to connect to
     */
    var Api = function (config) {
        var self = this;

        if (!config.name) {
            throw Error("API must be configured with a name");
        }
        if (!config.router) {
            throw Error("API must be configured with a router");
        }
        if (!config.authorization) {
            throw Error("API must be configured with an authorization module");
        }

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * @property name
         * @type {String}
         */
        this.name = config.name;

        /**
         * @property coordinationAddress
         * @type {String}
         */
        this.coordinationAddress = "coord." + this.name;


        /**
         * @property events
         * @type {ozpIwc.util.Event}
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        /**
         * @property endpoints
         * @type {Array}
         */
        this.endpoints = [];

        /**
         * @property data
         * @type {Object}
         */
        this.data = {};

        /**
         * @property watchers
         * @type {Object}
         */
        this.watchers = {};

        /**
         * @property collectors
         * @type {Array}
         */
        this.collectors = [];

        /**
         * @property changeList
         * @type {Object}
         */
        this.changeList = {};

        /**
         * @property leaderState
         * @type {String}
         */
        this.leaderState = "member";

        /**
         * @property participant
         * @type {ozpIwc.transport.participant.Client|*}
         */
        this.participant = config.participant || new transport.participant.MutexClient({
                'internal': true,
                'router': config.router,
                'authorization': config.authorization,
                'name': config.name,
                'onLock': function () {
                    //@TODO wanted to have state passed on lock resolution but race conditions arose.
                    self.onLock();
                },
                'onRelease': function () {
                    self.onRelease();
                }

            });
        this.participant.on("receive", this.receivePacketContext, this);
        this.participant.on("shutdown", this.shutdown, this);

        /**
         * @property router
         * @type {ozpIwc.transport.Router}
         */
        this.router = config.router;
        this.router.registerMulticast(this.participant, [this.name, this.coordinationAddress]);

        /**
         * @property logPrefix
         * @type {String}
         */
        this.logPrefix = "[" + this.name + "/" + this.participant.address + "] ";

        /**
         * @property ajaxQueue
         * @type {ozpIwc.util.AjaxPersistenceQueue}
         */
        this.ajaxQueue = config.ajaxQueue;


        //The API is initialized into a ready state waiting for the lock's api to grant it control.
        this.transitionToMemberReady();
    };
//--------------------------------------------------
//          Public Methods
//--------------------------------------------------

//--------------------------------------------------
// API state initialization methods
//--------------------------------------------------
    /**
     * Called when the API has become the leader, but before it starts
     * serving data.  Receives the deathScream of the previous leader
     * if available, otherwise undefined.
     *
     * __Intended to be overridden by subclasses__
     *
     * Subsclasses can override this to load data from the server.
     *
     * @method initializeData
     * @param {object} deathScream
     * @return {Promise} a promise that resolves when all data is loaded.
     */
    Api.prototype.initializeData = function (deathScream) {
        var getEndpoints = !deathScream;


        deathScream = deathScream || {watchers: {}, collectors: [], data: []};
        this.watchers = deathScream.watchers;
        this.collectors = deathScream.collectors;
        deathScream.data.forEach(function (packet) {
            var selfLink = packet.self || {};
            this.createNode({resource: packet.resource, contentType: selfLink.type}).deserializeLive(packet);
        }, this);

        this.updateCollections();
        if (getEndpoints && this.endpoints) {

            var self = this;
            var onResource = function (resource) {
                self.loadedResourceHandler(resource);
            };
            return Promise.all(this.endpoints.map(function (u) {
                return util.halLoader.load(u.link, u.headers, onResource).catch(function (err) {
                    log.error(self.logPrefix, "load from endpoint failed. Reason: ", err);
                });
            }));
        } else {
            return Promise.resolve();
        }
    };

    /**
     * A handler method for the API to process a resource loaded from an endpoint.
     * Extracts the type field of the resources self link (HAL) to determine the type of node to create and store
     * in the api's data object.
     *
     * @method loadedResourceHandler
     * @param {Object} resource
     */
    Api.prototype.loadedResourceHandler = function (resource) {
        resource = resource || {};
        resource._links = resource._links || {};
        var selfLink = resource._links.self || {};
        var NodeType = this.findNodeType(selfLink.type);
        if (NodeType) {
            try {
                this.createNode({
                    serializedEntity: resource,
                    contentType: selfLink.type
                }, NodeType);
            } catch (e) {
                log.info(this.logPrefix + "[" + selfLink.type + "] [" + selfLink.href + "] No node created from resource, reason: ", e.message);
            }
        } else {
            log.info(this.logPrefix + "[" + selfLink.type + "] [" + selfLink.href + "] No node created from resource, reason: no node type for this content-type.");
        }
    };

//--------------------------------------------------
// API state relinquishing methods
//--------------------------------------------------

    /**
     * Create the data that needs to be handed off to the new leader.
     *
     * __Intended to be overridden by subclasses__
     *
     * Subsclasses can override this if they need to add additional
     * handoff data.  This MUST be a synchronous call that returns immediately.
     *
     * @method createDeathScream
     * @return {Object} the data that will be passed to the new leader
     */
    Api.prototype.createDeathScream = function () {
        return {
            watchers: this.watchers,
            collectors: this.collectors,
            data: util.object.eachEntry(this.data, function (k, v) {
                return v.serializeLive();
            }),
            timestamp: util.now()
        };
    };

    /**
     * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
     * @method shutdown
     * @return
     */
    Api.prototype.shutdown = function () {
        if (this.leaderState === "leader") {
            this.broadcastDeathScream(this.createDeathScream());
        } else if (this.leaderState === "member" && this.deathScream) {
            this.broadcastDeathScream(this.deathScream);
        }

        //@TODO: The api deathscream would be included with the unlock but race conditions caused this to not be
        // completed yet.
        this.participant.send({
            dst: "locks.api",
            resource: "/mutex/" + this.name,
            action: "unlock"
            //entity: { state: (this.leaderState === "leader") ? this.createDeathScream() : undefined}
        });
    };

//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------

    /**
     * Generates a unique key with the given prefix.
     * @param {String} prefix
     * @return {String}
     */
    Api.prototype.createKey = function (prefix) {
        prefix = prefix || "";
        var key;
        do {
            key = prefix + util.generateId();
        } while (key in this.data);
        return key;
    };

    /**
     * A handler function for when a node is created. Can be overridden by inherited APIs.
     * @method onNodeCreated
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.onNodeCreated = function (node) {
        //Whenever a node is created update the collector's lists.
        this.updateCollections();
    };

    /**
     * A handler function called after a node is changed but before it's watchers are notified. Can be overridden by
     * inherited APIs.
     * @method onNodeChanged
     * @param {Object} node
     * @param {Object} entity
     * @param {Object} packetContext
     */
    Api.prototype.onNodeChanged = function (node, entity, packetContext) {
        //var culprit = packetContext.src;
        var lifespanFns = api.Lifespan.getLifespanFunctionality(node.lifespan);
        if (lifespanFns.shouldPersist() && this.ajaxQueue) {
            this.ajaxQueue.queueNode(this.name + "/" + node.resource, node);
        }
    };

    /**
     * Gathers the desired preference from the data API.
     * @method getPreference
     * @param {String} prefName
     * @return {Promise}
     */
    Api.prototype.getPreference = function (prefName) {
        return this.participant.send({
            dst: "data.api",
            resource: "/ozp/iwc/" + this.name + "/" + prefName,
            action: "get"
        }).then(function (reply) {
            return reply.entity;
        });
    };


    /**
     * Maps a content-type to an IWC Node type. Overriden in APIs.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentTypeObj) {
        return undefined;
    };

    /**
     * Creates a node appropriate for the given config, puts it into this.data,
     * and fires off the right events.
     *
     * @method createNode
     * @param {Object} config The node configuration.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNode = function (config, NodeType) {
        NodeType = NodeType || this.findNodeType(config.contentType);

        var n = this.createNodeObject(config, NodeType);
        if (n) {
            this.data[n.resource] = n;
            this.events.trigger("createdNode", n);
            return n;
        }
    };


    /**
     * Creates a node appropriate for the given config.  This does
     * NOT add the node to this.data.  Default implementation returns
     * a plain ozpIwc.api.base.Node.
     *
     * __Intended to be overridden by subclasses__
     *
     * Subsclasses can override this for custom node types that may vary
     * from resource to resource.
     *
     * @method createNodeObject
     * @param {Object} config The node configuration configuration.
     * @param {Function} NodeType The contructor call for the given node type to be created.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        } else {
            return new api.base.Node(config);
        }
    };
//--------------------------------------------------
// Distributed Computing: Mutex lock on handling API requests/holding active state
//--------------------------------------------------

    /**
     * A handler method for the API's acquisition of the mutex.
     *  * An api will initialize any state passed on from the last leader (received as a broadcasted deathscream).
     *  * If no initial state passed and backend connnectivity is configured, the backend will be reached for
     * persistent state.
     *  * Handle any requests during the transition to being the active API.
     *  * Call the API's onStart method to handle any custom API init functionality.
     * @method onLock
     */
    Api.prototype.onLock = function () {
        this.transitionToLoading()
            .then(this.transitionToLeader.bind(this))
            .then(this.onStart.bind(this))
            .catch(function (e) {
                log.error("Error registering for leader mutex [address=" + this.participant.address +
                    ",api=" + this.name + "]", e);
                this.shutdown();
            });
    };

    /**
     * A handler method for the API's release of the mutex.
     * @method onRelease
     */
    Api.prototype.onRelease = function () {
        this.onStop();
        this.transitionFromLeader();
        this.participant.relock();
    };

    /**
     * Called when the API begins operation as leader. To be overriden by inherited APIs.
     * @method onStart
     */
    Api.prototype.onStart = function () {
        //overridden
    };

    /**
     * Called when the API ends operation as leader. To be overriden by inherited APIs.
     * @method onStart
     */
    Api.prototype.onStop = function () {
        //overridden
    };
//--------------------------------------------------
// Distributed Computing: Leadership management state machine
//--------------------------------------------------

    /**
     * @method transitionToLoading
     * @private
     * @return {Promise} a promise that resolves when all data is loaded.
     */
    Api.prototype.transitionToLoading = function () {
        if (this.leaderState !== "member") {
            return Promise.reject(this.logPrefix + "transition to loading called in an invalid state:", this.leaderState);
        }
        log.debug(this.logPrefix + "transitioning to loading");

        this.leaderState = "loading";
        return this.initializeData(this.deathScream);
    };

    /**
     * @method transitionToLeader
     * @private
     */
    Api.prototype.transitionToLeader = function () {
        if (this.leaderState !== "loading") {
            return Promise.reject(this.logPrefix + "transition to loading called in an invalid state:", this.leaderState);
        }
        log.debug(this.logPrefix + "transitioning to leader");

        this.deathScream = undefined;
        this.leaderState = "leader";
        this.broadcastLeaderReady();
        this.deliverRequestQueue();
        enableHandlers(this);
        log.info(this.logPrefix + " Now operating");

        return Promise.resolve();
    };

    /**
     * @method transitionFromLeader
     */
    Api.prototype.transitionFromLeader = function () {
        if (this.leaderState !== "leader") {
            return Promise.reject(this.logPrefix + "transition to loading called in an invalid state:", this.leaderState);
        }
        log.debug(this.logPrefix + "relinquishing leadership.");

        var deathScream = this.createDeathScream();
        this.broadcastDeathScream(deathScream);
        this.leaderState = "member";
        return this.transitionToMemberReady(deathScream);
    };

    /**
     * @method transitionToMemberReady
     * @private
     * @param {Object} deathScream
     * @return {Promise}
     */
    Api.prototype.transitionToMemberReady = function (deathScream) {
        if (this.leaderState !== "member") {
            return;
        }
        this.deathScream = deathScream;
        disableHandlers(this);
        this.enableRequestQueue();
        return Promise.resolve();
    };

    /**
     * @method transitionToMemberDormant
     * @private
     * @return {Promise}
     */
    Api.prototype.transitionToMemberDormant = function () {
        if (this.leaderState !== "member") {
            return;
        }
        this.deathScream = undefined;
        this.flushRequestQueue();
        return Promise.resolve();
    };

//--------------------------------------------------
// Distributed computing: leadership state broadcasting
//--------------------------------------------------

    /**
     * Broadcasts to other instances of this API on the bus that it is ready to lead.
     * @method broadcastLeaderReady
     */
    Api.prototype.broadcastLeaderReady = function () {
        this.participant.send({
            dst: this.coordinationAddress,
            action: "announceLeader"
        });
    };

    /**
     * Broadcasts to other instances of this API on the bus this APIs state.
     * @method broadcastDeathScream
     * @param {Object} deathScream the state data to pass on.
     */
    Api.prototype.broadcastDeathScream = function (deathScream) {
        this.participant.send({
            dst: this.coordinationAddress,
            action: "deathScream",
            entity: deathScream
        });
    };


//--------------------------------------------------
// Data Management Utils
//--------------------------------------------------

    /**
     * Authorize the request for the given node.
     *
     * @method checkAuthorization
     * @param {ozpIwc.api.base.Node} node
     * @param {Object} context
     * @param {ozpIwc.packet.Transport} packet
     * @param {String} action
     * @return {undefined}
     */
    Api.prototype.checkAuthorization = function (node, context, packet, action) {
        //@TODO: actually implement checking the authorization...
        return true;
    };

    /**
     * Returns a list of nodes that start with the given prefix.
     *
     * @method matchingNodes
     * @param {String} prefix
     * @return {ozpIwc.api.base.Node[]} a promise that resolves when all data is loaded.
     */
    Api.prototype.matchingNodes = function (prefix) {
        return util.object.values(this.data, function (k, node) {
            return node.resource.indexOf(prefix) === 0 && !node.deleted;
        });
    };

    /**
     * Gathers the collection resource data for a node given its pattern only
     * if it is in the collectors list
     * @method getCollectionResources
     * @param {Object} node
     * @return {Array}
     */
    Api.prototype.getCollectionResources = function (node) {
        return this.getCollectionData(node).map(function (matchedNode) {
            return matchedNode.resource;
        });
    };

    Api.prototype.getCollectionData = function (node) {
        if (this.collectors.indexOf(node.resource) > -1) {
            return this.matchingNodes(node.pattern).filter(function (matchedNode) {
                // ignore deleted nodes
                return !matchedNode.deleted;
            });
        } else {
            return [];
        }
    };
//--------------------------------------------------
// Watch Functionality
//--------------------------------------------------

    /**
     * Marks that a node has changed and that change notices may need to
     * be sent out after the request completes.
     *
     * @method markForChange
     * @param {ozpIwc.api.base.Node} nodes...
     */
    Api.prototype.markForChange = function (/*varargs*/) {
        for (var i = 0; i < arguments.length; ++i) {
            if (Array.isArray(arguments[i])) {
                this.markForChange(arguments[i]);
            } else {
                var resource = arguments[i].resource || "" + arguments[i];
                // if it's already marked, skip it
                if (this.changeList.hasOwnProperty(resource)) {
                    continue;
                }

                var n = this.data[resource];

                this.changeList[resource] = n ? n.snapshot() : {};
            }
        }
    };

    /**
     * Marks that a node has changed and that change notices may need to
     * be sent out after the request completes.
     *
     * @method addWatcher
     * @param {String} resource name of the resource to watch
     * @param {Object} watcher
     * @param {String} watcher.resource name of the resource to watch
     * @param {String} watcher.src Address of the watcher
     * @param {String | Number} watcher.replyTo The conversation id that change notices will go to
     */
    Api.prototype.addWatcher = function (resource, watcher) {
        var watchList = this.watchers[resource];
        if (!Array.isArray(watchList)) {
            watchList = this.watchers[resource] = [];
        }

        watchList.push(watcher);
    };

    /**
     * Removes mark that a node has changed and that change notices may need to
     * be sent out after the request completes.
     *
     * @method removeWatcher
     * @param {String} resource name of the resource to unwatch
     * @param {Object} watcher
     * @param {String} watcher.src Address of the watcher
     * @param {String | Number} watcher.replyTo The conversation id that change notices will go to
     */
    Api.prototype.removeWatcher = function (resource, watcher) {
        var watchList = this.watchers[resource];
        if (watchList) {
            this.watchers[resource] = watchList.filter(function (watch) {
                return !(watch.src === watcher.src && watch.replyTo === watcher.msgId);
            });
        }
    };


    /**
     * Adds the given node to the collector list. It's collection list will be updated on api data changes.
     * @method addCollector
     * @param {Object} node
     */
    Api.prototype.addCollector = function (node) {
        var index = this.collectors.indexOf(node.resource);
        if (index < 0) {
            this.collectors.push(node.resource);
        }
        updateCollectionNode(this, node);
   };


    /**
     * Removes the given node from the collector list. It's collection list will no longer be updated on api data
     * changes.
     * @method removeCollector
     * @param {Object} node
     */
    Api.prototype.removeCollector = function (node) {
        var index = this.collectors.indexOf(node.resource);
        if (index > -1) {
            this.collectors.splice(index, 1);
        }
    };


    /**
     * Itterates over all collectors of the API for updates
     * @method updateCollections
     */
    Api.prototype.updateCollections = function () {
        for (var i in this.collectors) {
            var collectorNode = this.data[this.collectors[i]];
            updateCollectionNode(this, collectorNode);
        }
    };


//--------------------------------------------------
// Bus Packet Routing
//--------------------------------------------------
    /**
     * Sends packets of data from this API to other parts of the IWC bus.
     *
     * @param {Object} fragment
     * @return {Promise}
     */
    Api.prototype.send = function (fragment) {
        fragment.src = this.name;
        return this.participant.send(fragment);
    };

    /**
     * Routes a packet received from the participant.
     *
     * @method receivePacketContext
     * @property {Object} packetContext
     * @private
     */
    Api.prototype.receivePacketContext = function (packetContext) {
        if (packetContext.packet.dst === this.coordinationAddress) {
            return receiveCoordinationPacket(this, packetContext);
        } else {
            return receiveRequestPacket(this, packetContext);
        }
    };

//--------------------------------------------------
// API Request Handling (routes loaded from routes.js)
//--------------------------------------------------


    /**
     * Any request packet that does not match a route ends up here.  By default,
     * it replies with BadAction, BadResource, or BadRequest, as appropriate.
     *
     * @method receivePacketContext
     * @param {ozpIwc.packet.Transport} packet
     * @param {ozpIwc.transport.PacketContext} context
     */
    Api.prototype.defaultRoute = function (packet, context) {
        switch (context.defaultRouteCause) {
            case "nonRoutablePacket": // packet doesn't have an action/resource, so ignore it
                return;
            case "noAction":
                throw new api.error.BadActionError(packet);
            case "noResource":
                throw new api.error.BadResourceError(packet);
            default:
                throw new api.error.BadRequestError(packet);
        }
    };

    /**
     * Enables the API's request queue, all requests will be held until deliverRequestQueue or flushRequestQueue is
     * called.
     * @method enableRequestQueue
     * @private
     */
    Api.prototype.enableRequestQueue = function () {
        this.isRequestQueueing = true;
        this.requestQueue = [];
    };

    /**
     * Routes all queued packets and turns off request queueing.
     * @method deliverRequestQueue
     * @private
     */
    Api.prototype.deliverRequestQueue = function (after) {
        after = after || 0;
        this.isRequestQueueing = false;
        console.log("DELIVERING QUEUE:", this.name, this.requestQueue);
        this.requestQueue.forEach(function quededHandler (request) {
            if (request.packet.time > after) {
                receiveRequestPacket(this, request);
            }
        }, this);
        this.requestQueue = [];
    };

    /**
     * Empties the queue of requests without processing and turns off queuing.
     * @method flushRequestQueue
     * @private
     */
    Api.prototype.flushRequestQueue = function () {
        console.log("FLUSHING QUEUE:", this.name, this.requestQueue);
        this.isRequestQueueing = false;
        this.requestQueue = [];
    };

    /**
     * Enables API's sending queue. This is to prevent an API from communicating given some state (Used for consensus
     * initialization).
     *
     * @method enableSendQueue
     * @private
     */
    Api.prototype.enableSendQueue = function () {
        this.isSendQueueing = true;
        this.sendQueue = [];
    };

    /**
     * Delivers and disables API's sending queue.
     *
     * @method deliverSendQueue
     * @private
     */
    Api.prototype.deliverSendQueue = function () {
        this.isSendQueueing = false;
        this.sendQueue.forEach(this.participant.send, this.participant);
        this.sendQueue = [];
    };

    /**
     * Empties and disables API's sending queue.
     *
     * @method flushSendQueue
     * @private
     */
    Api.prototype.flushSendQueue = function () {
        this.isSendQueueing = false;
        this.sendQueue = [];
    };


//--------------------------------------------------
// Bus event handlers
//--------------------------------------------------
    /**
     * A handler function called when a participant has disconnected from the bus.
     * Each node in the API is checked to see if its lifespan was tied to said participant, and if the lifespan deems
     * necessary, removes the node.
     * Can be overridden by inherited APIs.
     * @method onClientDisconnect
     * @param {String} address
     */
    Api.prototype.onClientDisconnect = function (address) {
        removeDeadWatchers(this, address);

        var self = this;
        util.object.eachEntry(self.data, function (resource, node) {
            var lifespanFns = api.Lifespan.getLifespanFunctionality(node.lifespan);
            if (lifespanFns.shouldDelete(node.lifespan, address)) {
                self.markForChange(node);
                node.markAsDeleted();
            }
        });
        resolveChangedNodes(this);
    };
    /**
     * A handler function called when a participant connects to the bus. Intended to be overridden by inheriting APIs.
     * @param address
     */
    Api.prototype.onClientConnect = function (address) {
        //Does nothing should be overridden by inherited APIs
    };


//--------------------------------------------------
//          Private Methods
//--------------------------------------------------

    var enableHandlers = function (apiBase) {
        apiBase.on("createdNode", apiBase.onNodeCreated, apiBase);
        apiBase.on("changed", apiBase.onNodeChanged, apiBase);
        apiBase.participant.on("addressDisconnects", apiBase.onClientDisconnect, apiBase);
        apiBase.participant.on("addressConnects", apiBase.onClientConnect, apiBase);
    };

    var disableHandlers = function (apiBase) {
        apiBase.off("createdNode", apiBase.onNodeCreated);
        apiBase.off("changed", apiBase.onNodeChanged);
        apiBase.participant.off("addressDisconnects", apiBase.onClientDisconnect);
        apiBase.participant.off("addressConnects", apiBase.onClientConnect);
    };

    /**
     * A static utility method that notifies watchers of changes of the resource since the given snapshot.
     * @method resolveChangedNode
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {String} resource
     * @param {Object} snapshot
     * @param {Object} packetContext
     */
    var resolveChangedNode = function (apiBase, resource, snapshot, packetContext) {
        var node = apiBase.data[resource];
        var watcherList = apiBase.watchers[resource] || [];

        if (!node) {
            return;
        }

        var changes = node.changesSince(snapshot);
        if (!changes) {
            return;
        }

        var permissions = apiBase.authorization.pip.attributeUnion(
            changes.oldValue.permissions,
            changes.newValue.permissions
        );

        var entity = {
            oldValue: changes.oldValue.entity,
            newValue: changes.newValue.entity,
            oldCollection: changes.oldValue.collection,
            newCollection: changes.newValue.collection,
            deleted: node.deleted
        };

        apiBase.events.trigger("changed", node, entity, packetContext);

        watcherList.forEach(function notifyWatcher (watcher) {
            // @TODO allow watchers to changes notifications if they have permission to either the old or new, not just
            // both
            apiBase.participant.send({
                'src': apiBase.participant.name,
                'dst': watcher.src,
                'replyTo': watcher.replyTo,
                'response': 'changed',
                'respondOn': 'none',
                'resource': node.resource,
                'permissions': permissions,
                'contentType': node.contentType,
                'entity': entity
            });
        });
    };

    /**
     * A static utility method called after an api request is complete to send out change notifications.
     *
     * @method resolveChangedNodes
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext the packet that caused this change.
     */
    var resolveChangedNodes = function (apiBase, packetContext) {
        apiBase.updateCollections();
        util.object.eachEntry(apiBase.changeList, function resolveChange (resource, snapshot) {
            resolveChangedNode(apiBase, resource, snapshot, packetContext);
        });
        apiBase.changeList = {};
    };

    /**
     * A static utility method that removes the collector node from the collectors list if deleted.
     * Removes references to nodes in the given collectors collection property if said referenced node is deleted.
     * Adds newly created nodes to the collection property if said node's resource matches the collection nodes pattern
     * property.
     *
     * @method updateCollectionNode
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} cNode the collector node to update
     */
    var updateCollectionNode = function (apiBase, cNode) {
        if (!cNode) {
            return;
        }
        //If the collection node is deleted, stop collecting for it.
        if (cNode.deleted) {
            apiBase.removeCollector(cNode.resource);
            return;
        }


        var updatedCollection = apiBase.matchingNodes(cNode.pattern).filter(function (node) {
            return !node.deleted;
        }).map(function (node) {
            return node.resource;
        });

        cNode.collection = cNode.collection || [];
        if (!util.arrayContainsAll(cNode.collection, updatedCollection) || !util.arrayContainsAll(updatedCollection, cNode.collection)) {
            apiBase.markForChange(cNode);
            cNode.collection = updatedCollection;
            cNode.version++;
        }
    };


    /**
     * If the the given address is watching a resource, it will be removed from the watch list. Router addresses will
     * remove all of its participants watch registrations.
     *
     * @method removeDeadWatchers
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {String} address
     */
    var removeDeadWatchers = function (apiBase, address) {
        var len = address.length;
        util.object.eachEntry(apiBase.watchers, function removeDead (resource, array) {
            for (var i in array) {
                if (array[i].src.substr(-len) === address) {
                    array.splice(i, 1);
                }
            }
        });
    };

    /**
     * Handles packets received regarding leadership actions.
     * @method receiveCoordinationPacket
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext
     * @return {Promise}
     */
    var receiveCoordinationPacket = function (apiBase, packetContext) {
        var packet = packetContext.packet;
        switch (packet.action) {
            case "announceLeader":
                return apiBase.transitionToMemberDormant();
            case "deathScream":
                return apiBase.transitionToMemberReady(packet.entity);
            default:
                log.error("Unknown coordination packet: ", packet);
                return Promise.reject(new Error("Unknown action: " + packet.action + " in " + JSON.stringify(packetContext)));
        }
    };

    /**
     * Routes a request to the proper handler and takes care of overhead
     * such as change requests.
     *
     * @method receivePacketContext
     * @private
     * @static
     * @property {ozpIwc.api.base.Api} apiBase
     * @property {Object} packetContext
     */
    var receiveRequestPacket = function (apiBase, packetContext) {
        var packet = packetContext.packet;

        if (apiBase.isRequestQueueing) {
            apiBase.requestQueue.push(packetContext);
            return;
        }
        if (apiBase.leaderState !== "leader") {
            return;
        }

        try {
            packetContext.node = apiBase.data[packet.resource];
            var packetFragment = apiBase.routePacket(packet, packetContext);
            if (packetFragment) {
                packetFragment.response = packetFragment.response || "ok";
                packetContext.replyTo(packetFragment);
            }
            resolveChangedNodes(apiBase, packetContext);
        } catch (e) {
            if (!e || !e.errorAction) {
                log.error(apiBase.logPrefix, "Unexpected error: ", e, " packet= ", packet);
            }
            var errorFragment = {
                'src': apiBase.name,
                'response': e.errorAction || "errorUnknown",
                'entity': e.message
            };
            packetContext.replyTo(errorFragment);
        }

    };

    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.transport, ozpIwc.util));
