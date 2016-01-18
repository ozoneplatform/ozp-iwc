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
         * @property participant
         * @type {ozpIwc.transport.participant.Client|*}
         */
        this.participant = config.participant || new transport.participant.Client({
                'internal': true,
                'router': config.router,
                'authorization': config.authorization,
                'name': config.name
            });
        this.participant.on("receive", function (packetContext) {
            self.receivePacketContext(packetContext);
        });

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

        this.ajaxQueue = config.ajaxQueue;

        util.addEventListener("beforeunload", function () { self.shutdown(); });
        this.transitionToMemberReady();
        queueForCoordination(this, config.leaderPromise);
    };

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * A static utility method for the api to queue for leadership in the locks api.
     *
     * @method queueForCoordination
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Promise} [promise]
     */
    var queueForCoordination = function (apiBase, promise) {
        apiBase.participant.send({
            dst: "locks.api",
            resource: "/mutex/" + apiBase.name,
            action: "watch"
        }, function (reply) {
            handleLockChange(apiBase, reply);
        });


        apiBase.leaderPromise = promise || apiBase.participant.send({
                dst: "locks.api",
                resource: "/mutex/" + apiBase.name,
                action: "lock"
            });

        apiBase.leaderPromise.then(function (pkt) {
            log.info("[" + apiBase.name + "][" + apiBase.participant.address + "] Now operating");
            var resolve;

            // Delay loading for deathScreams to flow in.
            var delayed = new Promise(function (res, rej) {
                resolve = res;
            });

            window.setTimeout(function () {
                resolve();
            }, 1000);

            return delayed;
        }).then(function () {
            apiBase.transitionToLoading();
        });

        apiBase.leaderPromise.catch(function (e) {
            console.error("Error registering for leader mutex [address=" + apiBase.participant.address + ",api=" + apiBase.name + "]", e);
        });

    };

    /**
     * A static utility method for the api to handle a change in it's lock api mutex.
     *
     * @method handleLockChange
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} response
     */
    var handleLockChange = function (apiBase, response) {
        response = response || {};
        response.entity = response.entity || {};
        response.entity.oldValue = response.entity.oldValue || {};
        response.entity.newValue = response.entity.newValue || {};
        var prevOwner = response.entity.oldValue.owner || {};
        var newOwner = response.entity.newValue.owner || {};

        // If we are no longer the holder of the API lock get back in line to own it. This case only applies if the API
        // instance was pushed out. If the instance closes this code is not reached.
        if (prevOwner.src === apiBase.participant.address && newOwner.src !== apiBase.participant.address) {
            apiBase.broadcastDeathScream(apiBase.createDeathScream());
            apiBase.leaderState = "member";
            apiBase.transitionToMemberReady();
            queueForCoordination(apiBase);
        }
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

        watcherList.forEach(function (watcher) {
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
        util.object.eachEntry(apiBase.changeList, function (resource, snapshot) {
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
     * Handles packets received with a destination of "$bus.multicast".
     *
     * @method receiveBusPacket
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext
     * @return {*}
     */
    var receiveBusPacket = function (apiBase, packetContext) {
        var packet = packetContext.packet;
        switch (packet.action) {
            case "connect":
                apiBase.events.trigger("addressConnects", packet.entity.address, packet);
                break;
            case "disconnect":
                removeDeadWatchers(apiBase, packet.entity.address);
                apiBase.events.trigger("addressDisconnects", packet.entity.address, packet);
                break;
        }
        return Promise.resolve();
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
        util.object.eachEntry(apiBase.watchers, function (resource, array) {
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

//--------------------------------------------------
//          Public Methods
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

//===============================================================
// Default methods that can be overridden by subclasses
//===============================================================

    /**
     * A handler function for when a node is created. Can be overridden by inherited APIs.
     * @method createdHandler
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.createdHandler = function (node) {
        //Whenever a node is created update the collector's lists.
        this.updateCollections();
    };

    /**
     * A handler function called after a node is changed but before it's watchers are notified. Can be overridden by
     * inherited APIs.
     * @method changedHandler
     * @param {Object} node
     * @param {Object} entity
     * @param {Object} packetContext
     */
    Api.prototype.changedHandler = function (node, entity, packetContext) {
        //var culprit = packetContext.src;
        var lifespanFns = api.Lifespan.getLifespanFunctionality(node.lifespan);
        if (lifespanFns.shouldPersist() && this.ajaxQueue) {
            this.ajaxQueue.queueNode(this.name + "/" + node.resource, node);
        }
    };

    /**
     * A handler function called when an instance of this API has disconnected from the bus.Can be overridden by
     * inherited APIs.
     * @method disconnectHandler
     * @param {String} address
     */
    Api.prototype.disconnectHandler = function (address) {
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
        deathScream = deathScream || {watchers: {}, collectors: [], data: []};
        this.watchers = deathScream.watchers;
        this.collectors = deathScream.collectors;
        deathScream.data.forEach(function (packet) {
            var selfLink = packet.self || {};
            this.createNode({resource: packet.resource, contentType: selfLink.type}).deserializeLive(packet);
        }, this);

        this.updateCollections();
        if (this.endpoints) {
            var self = this;
            return Promise.all(this.endpoints.map(function (u) {
                var e = api.endpoint(u.link);
                return self.loadFromEndpoint(e, u.headers).catch(function (err) {
                    log.error(self.logPrefix, "load from endpoint failed. Reason: ", err);
                });
            }));
        } else {
            return Promise.resolve();
        }
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

//===============================================================
// Leader state management
//===============================================================

    /**
     * @method transitionToLoading
     * @private
     * @return {Promise} a promise that resolves when all data is loaded.
     */
    Api.prototype.transitionToLoading = function () {
        var self = this;
        if (this.leaderState !== "member") {
            log.error(this.logPrefix + "transition to loading called in an invalide state:", this.leaderState);
            return Promise.reject(this.logPrefix + "transition to loading called in an invalide state:", this.leaderState);
        }
        log.debug(this.logPrefix + "transitioning to loading");
        this.leaderState = "loading";
        return this.initializeData(this.deathScream)
            .then(function () {
                self.transitionToLeader();
            }, function (e) {
                log.error(self.logPrefix + "Failed to load data due to ", e);
                self.shutdown();
            });
    };

    /**
     * @method transitionToLeader
     * @private
     */
    Api.prototype.transitionToLeader = function () {
        if (this.leaderState !== "loading") {
            log.error(this.logPrefix + "transition to leader called in an invalid state:", this.leaderState);
            return;
        }
        log.debug(this.logPrefix + "transitioning to leader");
        this.leaderState = "leader";
        this.broadcastLeaderReady();
        this.deliverRequestQueue();

        this.on("createdNode", this.createdHandler, this);
        this.on("changed", this.changedHandler, this);
        this.on("addressDisconnects", this.disconnectHandler, this);

        log.info(this.logPrefix + " Now operating");
    };

    /**
     * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
     * @method shutdown
     * @return
     */
    Api.prototype.shutdown = function () {
        if (this.leaderState === "leader") {
            this.broadcastDeathScream(this.createDeathScream());
        }

        this.participant.send({
            dst: "locks.api",
            resource: "/mutex/" + this.name,
            action: "unlock"
        });
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
        this.off("createdNode", this.createdHandler);
        this.off("changed", this.changedHandler);
        this.off("addressDisconnects", this.disconnectHandler);
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
        this.deathScream = null;
        this.flushRequestQueue();
        return Promise.resolve();
    };

//===============================================================
// Data Management
//===============================================================

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


//===============================================================
// Watches
//===============================================================

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
                return watch.src === watcher.src && watch.replyTo === watcher.msgId;
            });
        }
    };


    /**
     * Adds the given node to the collector list. It's collection list will be updated on api data changes.
     * @method addCollector
     * @param {Object} node
     */
    Api.prototype.addCollector = function (resource) {
        var index = this.collectors.indexOf(resource);
        if (index < 0) {
            this.collectors.push(resource);
        }
        var node = this.data[resource];
        if (node) {
            updateCollectionNode(this, node);
        }
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


//===============================================================
// Packet Routing
//===============================================================
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
        if (packetContext.packet.src === this.participant.address) {
            // drop our own packets
            return Promise.resolve();
        }

        if (packetContext.packet.dst === this.coordinationAddress) {
            return receiveCoordinationPacket(this, packetContext);
        } else if (packetContext.packet.dst === "$bus.multicast") {
            return receiveBusPacket(this, packetContext);
        } else {
            return receiveRequestPacket(this, packetContext);
        }
    };

//===============================================================
// API Request Handling
//===============================================================


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
    Api.prototype.deliverRequestQueue = function () {
        this.isRequestQueueing = false;
        this.requestQueue.forEach(function (request) {
            receiveRequestPacket(this, request);
        }, this);
        this.requestQueue = [];
    };

    /**
     * Empties the queue of requests without processing and turns off queuing.
     * @method flushRequestQueue
     * @private
     */
    Api.prototype.flushRequestQueue = function () {
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


//===============================================================
// API Coordination Handling
//===============================================================
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


//===============================================================
// Load data from the server
//===============================================================


    /**
     * Recursive HAL resource parser.
     *
     * @method handleResource
     * @private
     * @static
     * @param {Api} api
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} resourceObj the body of the Resource
     */
    var handleResource = function (api, endpoint, resourceObj,headers) {
        resourceObj = resourceObj || {};
        resourceObj._links = resourceObj._links || {};
        resourceObj._embedded = resourceObj._embedded || {};
        resourceObj._embedded.item = util.ensureArray(resourceObj._embedded.item || []);
        var selfLink = resourceObj._links.self || {};
        var NodeType = api.findNodeType(selfLink.type);

        if (NodeType) {
            try {
                api.createNode({
                    serializedEntity: resourceObj,
                    contentType: selfLink.type
                }, NodeType);
            } catch (e) {
                log.info(api.logPrefix + "[" + selfLink.type + "] [" + selfLink.href + "] No node created from resource, reason: ", e.message);
            }
        } else {
            log.info(api.logPrefix + "[" + selfLink.type + "] [" + selfLink.href + "] No node created from resource, reason: no node type for this content-type.");
        }
        if (resourceObj._embedded.item.length) {
            log.info(api.logPrefix + "[" + selfLink.href + "] Processing " + resourceObj._embedded.item.length + " embedded items.");
        }

        return handleEmbedded(api, endpoint, resourceObj._embedded,headers).then(function () {
            return handleLinks(api, endpoint, resourceObj._links,headers);
        });
    };

    /**
     * Recursive HAL _links parser
     *
     * @method handleLinks
     * @private
     * @static
     * @param {Api} api
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} _links the _links object of the HAL resource
     */
    var handleLinks = function (api, endpoint, _links,headers) {
        var linkedItems = util.ensureArray((_links && _links.item) || []);
        var unknownLinks = linkedItems.filter(function (link) {
            return util.object.values(api.data, function (k, node) {
                    node.self = node.self || {};
                    return node.self.href === link.href;
                }).length === 0;
        });

        var linkGather = function (obj) {
            var hdrs = headers.slice(0);
            if(obj.type) {
                hdrs.push({'name': "Accept", 'value': obj.type});
            }
            return loadResource(api, endpoint, obj.href, hdrs).catch(function (err) {
                log.info("failed to gather link: ", obj.href, " reason: ", err);
            });
        };

        if (unknownLinks.length) {
            log.info(api.logPrefix + " Processing " + unknownLinks.length + " linked items.");
        }

        return Promise.all(unknownLinks.map(linkGather));
    };

    /**
     * Recursive HAL _embedded parser
     *
     * @method handleLinks
     * @private
     * @static
     * @param {Api} api
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} _embedded the _embedded object of the HAL resource
     */
    var handleEmbedded = function (api, endpoint, _embedded,headers) {
        var embeddedItems = util.ensureArray((_embedded && _embedded.item) || []);
        var embeddedGather = function (obj) {
            obj._links = obj._links || {};
            obj._links.self = obj._links.self || {};
            // We can only knowingly handle an embedded object if we know its type.
            if (obj._links.self.type) {
                return handleResource(api, endpoint, obj,headers);
            } else {
                return Promise.resolve();
            }
        };
        return Promise.all(embeddedItems.map(embeddedGather));
    };

    /**
     * Loads data from the provided endpoint.  The endpoint must point to a HAL JSON document
     * that embeds or links to all resources for this api.
     *
     * @method loadFromEndpoint
     * @param {ozpIwc.api.Endpoint} endpoint
     * @param {Array} headers
     * @return {Promise} resolved when all data has been loaded.
     */
    var loadResource = function (api, endpoint, path, headers) {
        log.info(api.logPrefix + "[" + endpoint.name + "] Headers:" +JSON.stringify(headers) + " Loading: " + path);

        return endpoint.get(path,headers).then(function (data) {
            data.response._embedded = data.response._embedded || {};
            data.response._links = data.response._links || {};
            data.response._links.self = data.response._links.self || {};
            data.response._links.self.type = data.response._links.self.type || data.header['Content-Type'];
            data.response._links.self.href = data.response._links.self.href || data.url;

            return handleResource(api, endpoint, data.response,headers);
        }).catch(function(err){
            log.error(api.logPrefix + "[" + endpoint.name + "] ["+ path +"] Failed to load: ", err.status);
        });
    };

    Api.prototype.loadFromEndpoint = function (endpoint, headers) {
        return loadResource(this, endpoint, "/", headers);
    };


//===============================================================
// Default Routes and Subclass Helpers
//===============================================================
    /**
     * Gathers the collection data for a node given its pattern only if it has a pattern.
     * @method getCollection
     * @param {String} pattern
     * @return {Array}
     */
    Api.prototype.getCollection = function (pattern) {
        if (pattern) {
            return this.matchingNodes(pattern).filter(function (node) {
                return !node.deleted;
            }).map(function (node) {
                return node.resource;
            });
        } else {
            return [];
        }
    };

    /**
     * A collection of default action handlers for an API.
     * @property defaultHandler
     * @static
     * @type {Object}
     */
    Api.defaultHandler = {
        "get": function (packet, context, pathParams) {
            var p = context.node.toPacket();
            p.collection = this.getCollection(p.pattern);
            return p;
        },
        "set": function (packet, context, pathParams) {
            context.node.set(packet);
            return {response: "ok"};
        },
        "delete": function (packet, context, pathParams) {
            if (context.node) {
                context.node.markAsDeleted(packet);
            }

            return {response: "ok"};
        },
        "list": function (packet, context, pathParams) {
            var entity = this.matchingNodes(packet.resource).filter(function (node) {
                return !node.deleted;
            }).map(function (node) {
                return node.resource;
            });
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
        "bulkGet": function (packet, context, pathParams) {
            var self = this;
            var entity = this.matchingNodes(packet.resource).map(function (node) {
                var p = node.toPacket();
                p.collection = self.getCollection(p.pattern);
                return p;
            });
            // TODO: roll up the permissions of the nodes, as well
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
        "watch": function (packet, context, pathParams) {
            this.addWatcher(packet.resource, {
                src: packet.src,
                replyTo: packet.msgId
            });

            //Only if the node has a pattern applied will it actually be added as a collector.
            this.addCollector(packet.resource);

            if (context.node) {
                var p = context.node.toPacket();
                p.collection = this.getCollection(p.pattern);
                return p;
            } else {
                return {response: "ok"};
            }
        },
        "unwatch": function (packet, context, pathParams) {
            this.removeWatcher(packet.resource, packet);

            //If no one is watching the resource any more, remove its collector if it has one to speed things up.
            if (this.watchers[packet.resource] && this.watchers[packet.resource].length === 0) {
                this.removeCollector(packet.resource);
            }

            return {response: "ok"};
        }
    };

    /**
     * A list of all of the default actions.
     * @property allActions
     * @static
     * @type {String[]}
     */
    Api.allActions = Object.keys(Api.defaultHandler);

    /**
     * Install the default handler and filters for the provided actions and resources.
     * @method useDefaultRoute
     * @static
     * @param {String | String[]} actions
     * @param {String} resource="{resource:.*}" The resource template to install the default handler on.
     */

    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.transport, ozpIwc.util));