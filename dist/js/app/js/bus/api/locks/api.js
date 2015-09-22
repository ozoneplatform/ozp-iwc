var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.locks = ozpIwc.api.locks || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.locks
 */

ozpIwc.api.locks.Api = (function (ozpIwc) {

    /**
     * The Locks Api. Treats each node as an individual mutex, creating a queue to access/own the resource.
     * Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}. Utilizes the
     * {{#crossLink "ozpIwc.api.locks.Node"}}{{/crossLink}} which subclasses the
     * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.locks
     * @extends ozpIwc.api.base.Api
     * @uses ozpIwc.util.PacketRouter, ozpIwc.util.Event
     * @constructor
     *
     * @type {Function}
     */
    var Api = ozpIwc.util.extend(ozpIwc.api.base.Api, function (config) {
        if (!config.router) {
            throw Error("API must be configured with a router.");
        }
        this.name = "locks.api";
        this.coordinationAddress = "coord." + this.name;
        this.events = new ozpIwc.util.Event();
        this.events.mixinOnOff(this);
        this.router = config.router;
        this.endpoints = [];
        this.data = {};
        this.watchers = {};
        this.collectors = [];
        this.changeList = {};

        //Start queueing and queue until either:
        // (1) state comes in a victor message or
        // (2) become leader. whichever is first
        this.enableRequestQueue();
        this.enableSendQueue();

        consensusConfiguration(this, config.consensusMember);
        participantConfiguration(this);
        this.on("addressDisconnects", this.unlockAll, this);

        this.logPrefix = "[" + this.name + "/" + this.participant.address + "] ";

        //This is poor form, but the apiBase behavior for locks should let everyone write.
        this.leaderState = "loading";
        this.transitionToLeader();

        var self = this;
        ozpIwc.util.addEventListener("beforeunload", function () {
            self.shutdown();
        });
    });
    ozpIwc.util.PacketRouter.mixin(Api);

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * The Locks Api uses the Bully Consensus module to determine leadership.
     *
     * @method consensusConfiguration
     * @private
     * @static
     * @param {ozpIwc.api.locks.Api} api
     * @param {Object} [consensusMember]
     */
    var consensusConfiguration = function (api, consensusMember) {
        api.consensusMember = consensusMember || new ozpIwc.transport.consensus.Bully({
                'name': api.name,
                'router': api.router,
                'gatherLogs': function () {
                    return api.createDeathScream();
                }
            });
        api.consensusMember.on("receivedLogs", handleLogs, api);
        api.consensusMember.on("changedState", handleConsensusState, api);
    };

    /**
     * For Api call handling, the Locks Api uses a clientParticipant.
     *
     * @method participantConfiguration
     * @private
     * @static
     * @param {ozpIwc.api.locks.Api} api
     */
    var participantConfiguration = function (api) {
        api.participant = new ozpIwc.transport.participant.Client({
            'internal': true,
            'router': api.router,
            'name': api.name
        });
        api.participant.on("receive", function (packetContext) {
            api.receivePacketContext(packetContext);
        });
        api.router.registerMulticast(api.participant, [api.name]);
        if (api.consensusMember.state === "coordinator") {
            api.deliverRequestQueue();
        }
    };

    /**
     * If the Locks Api object has not been initialized, it will initialize with the data passed in to the handleLogs
     * function.
     *
     * @method handleLogs
     * @private
     * @param {Object}data
     */
    var handleLogs = function (data) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        var logTimestamp = data.timestamp;
        this.initializeData(data);
        this.deliverRequestQueue(logTimestamp);
    };

    /**
     * When the Consensus Module changes state, the Locks Api behaves differently. It's participant will only send
     * outbound messages if it is the "Coordinator".
     *
     * @method handleConsensusState
     * @private
     * @param {String} state
     */
    var handleConsensusState = function (state) {
        ozpIwc.log.debug("[" + this.participant.address + "] State: ", state);
        switch (state) {
            case "coordinator":
                this.deliverRequestQueue();
                this.deliverSendQueue();
                break;
            default:
                this.participant.sendingBlocked = true;
                this.flushSendQueue();
                break;
        }
    };

//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * Transitions the Lock Api's leader state to leader if its state currently is "loading". Broadcasts leader ready
     * event.
     * @method transitionToLeader
     */
    Api.prototype.transitionToLeader = function () {
        if (this.leaderState !== "loading") {
            ozpIwc.log.error(this.logPrefix + "transition to leader called in an invalid state:", this.leaderState);
            return;
        }
        ozpIwc.log.debug(this.logPrefix + "transitioning to leader");
        this.leaderState = "leader";
        this.broadcastLeaderReady();
    };

    /**
     * Unlocks All queued locks for the given address in the Locks Api.
     *
     * @TODO: Right now cycles through Every node, keep a map of addresses to nodes to unlock.
     *
     * @method unlockAll
     * @param {String} address
     */
    Api.prototype.unlockAll = function (address) {
        var self = this;
        ozpIwc.util.object.eachEntry(this.data, function (k, v) {
            self.updateLock(v, v.unlock({
                src: address
            }));
        });
    };

    /**
     * Iterates over all node's and cleans out any rouge locks queue'd for no-longer/non-existent addresses.
     *
     * @method cleanup
     */
    Api.prototype.cleanup = function () {
        var addrMap = {};
        ozpIwc.util.object.eachEntry(this.data, function (k, v) {
            var queue = v.entity.queue || [];
            queue.forEach(function (entry) {
                addrMap[entry.src] = true;
            });
        });

        var self = this;
        this.participant.names().bulkGet("/address").then(function (reply) {
            reply.entity.forEach(function (node) {
                if (node.entity.time && node.entity.time + ozpIwc.config.heartBeatFrequency > ozpIwc.util.now()) {
                    addrMap[node.entity.address] = false;
                }
            });
        }).then(function () {
            ozpIwc.util.object.eachEntry(addrMap, function (k, v) {
                if (v) {
                    self.unlockAll(k);
                }
            });
        });
    };

    /**
     * Override the default node type to be a Locks Api Value.
     *
     * @override
     * @method createNodeObject
     * @param {type} config
     * @return {ozpIwc.api.data.node}
     */
    Api.prototype.createNodeObject = function (config) {
        return new ozpIwc.api.locks.Node(config);
    };


    /**
     * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
     *
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

//====================================================================
// Default Route
//====================================================================
    Api.useDefaultRoute = function (actions, resource) {
        resource = resource || "{resource:.*}";
        actions = ozpIwc.util.ensureArray(actions);
        var self = this;
        actions.forEach(function (a) {
            var filterFunc = ozpIwc.api.filter.standard.forAction(a);
            self.declareRoute({
                    action: a,
                    resource: resource,
                    filters: (filterFunc ? filterFunc() : [])
                }, ozpIwc.api.base.Api.defaultHandler[a]
            );
        });
    };

    Api.useDefaultRoute(["bulkGet", "list", "get", "watch", "unwatch"]);
//====================================================================
// Bulk Send
//====================================================================
    Api.declareRoute({
        action: ["bulkSend"],
        resource: "{resource:.*}",
        filters: []
    }, function (packet, context, pathParams) {
        var messages = packet.entity || [];
        var self = this;

        messages.forEach(function (message) {
            var packetContext = new ozpIwc.transport.PacketContext({
                'packet': message.packet,
                'router': self.router,
                'srcParticipant': message.packet.src,
                'dstParticipant': self.address
            });
            self.receiveRequestPacket(packetContext);
        });
        return {response: "ok"};
    });

//====================================================================
// Lock
//====================================================================
    Api.declareRoute({
        action: "lock",
        resource: "/mutex/{name}",
        filters: ozpIwc.api.filter.standard.setFilters(ozpIwc.api.locks.Node)
    }, function (packet, context, pathParams) {
        if (context.node) {
            this.updateLock(context.node, context.node.lock({
                src: packet.src,
                msgId: packet.msgId
            }));
        }
    });

//====================================================================
// Unlock
//====================================================================
    Api.declareRoute({
        action: "unlock",
        resource: "/mutex/{name}",
        filters: ozpIwc.api.filter.standard.setFilters(ozpIwc.api.locks.Node)
    }, function (packet, context, pathParams) {
        packet.entity = packet.entity || {};
        ozpIwc.log.debug("[locks.api" + context.node.resource + "][UNLOCK]: ", packet.src);
        if (context.node) {
            this.updateLock(context.node, context.node.unlock({
                src: packet.entity.src || packet.src,
                msgId: packet.entity.msgId || packet.msgId
            }));
        }
    });


//====================================================================
// Lock/Unlock Utility
//====================================================================
    /**
     * Notifies the owner of the node's lock/unlock.
     *
     * @method updateLock
     * @param {ozpIwc.ApiValue} node
     * @param {Object} newOwner
     */
    Api.prototype.updateLock = function (node, newOwner) {
        if (newOwner) {
            ozpIwc.log.debug("[locks.api" + node.resource + "][NEW LEADER]", newOwner);
            var pkt = {
                'dst': newOwner.src,
                'src': this.participant.name,
                'replyTo': newOwner.msgId,
                'response': 'ok',
                'resource': node.resource
            };

            if (this.isSendQueueing) {
                this.sendQueue.push(pkt);
            } else {
                this.participant.send(pkt);
            }
        }
    };

    return Api;
}(ozpIwc));