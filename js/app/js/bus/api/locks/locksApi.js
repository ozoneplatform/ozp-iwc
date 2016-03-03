/**
 * @submodule bus.api.Type
 */

/**
 * The Locks Api. Treats each node as an individual mutex, creating a queue to access/own the resource.
 * Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the
 * {{#crossLink "ozpIwc.LocksNode"}}{{/crossLink}} which subclasses the
 * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
 *
 * @class LocksApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.LocksApi =ozpIwc.util.extend(ozpIwc.ApiBase,function(config) {
    if(!config.name) {throw Error("API must be configured with a name");}
    this.name = "locks.api";
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    this.router=config.router || ozpIwc.defaultRouter;
    this.endpoints=[];
    this.data={};
    this.watchers={};
    this.collectors=[];
    this.changeList={};

    //Start queueing and queue until either:
    // (1) state comes in a victor message or
    // (2) become leader. whichever is first
    this.enableRequestQueue();
    this.enableSendQueue();

    this.consensusConfiguration(config);
    this.participantConfiguration(config);
    this.on("addressDisconnects",this.unlockAll,this);

    this.logPrefix="[" + this.name + "/" + this.participant.address +"] ";
    //This is poor form, but the apiBase behavior for locks should let everyone write.
    this.leaderState="loading";
    this.transitionToLeader();

    var self = this;
    ozpIwc.util.addEventListener("beforeunload",function(){
        self.shutdown();
    });
});
ozpIwc.PacketRouter.mixin(ozpIwc.LocksApi);


ozpIwc.LocksApi.prototype.transitionToLeader = function(){
    if(this.leaderState !== "loading") {
        ozpIwc.log.error(this.logPrefix+"transition to leader called in an invalid state:",this.leaderState);
        return;
    }
    ozpIwc.log.debug(this.logPrefix+"transitioning to leader");
    this.leaderState = "leader";
    this.broadcastLeaderReady();
};

/**
 * The Locks Api uses the Bully Consensus module to determine leadership.
 *
 * @method consensusConfiguration
 * @param {Object} config
 */
ozpIwc.LocksApi.prototype.consensusConfiguration = function(config){
    this.consensusMember = config.consensusMember || new ozpIwc.consensus.Bully({
        'name': this.name,
        'router': this.router,
        'gatherLogs': function(){
            return self.createDeathScream();
        }
    });
    var self = this;
    this.consensusMember.on("receivedLogs",this.handleLogs,this);
    this.consensusMember.on("changedState",this.handleConsensusState,this);
};

/**
 * For Api call handling, the Locks Api uses a clientParticipant.
 *
 * @method participantConfiguration
 * @param {Object} config
 */
ozpIwc.LocksApi.prototype.participantConfiguration = function(config){
    this.participant =  new ozpIwc.ClientParticipant({internal:true});
    this.participant.on("receive",function(packetContext) {
        this.receivePacketContext(packetContext);
    },this);
    this.router.registerMulticast(this.participant,[this.name]);
    if(this.consensusMember.state === "coordinator"){
        this.deliverRequestQueue();
    }
};

/**
 * Unlocks All queued locks for the given address in the Locks Api.
 *
 * @TODO: Right now cycles through Every node, keep a map of addresses to nodes to unlock.
 *
 * @method unlockAll
 * @param {String} address
 */
ozpIwc.LocksApi.prototype.unlockAll = function(address){
    var self = this;
    ozpIwc.object.eachEntry(this.data,function(k,v) {
        self.updateLock(v,v.unlock({
            src: address
        }));
    });
};

/**
 * Iterates over all node's and cleans out any rouge locks queue'd for no-longer/non-existent addresses.
 *
 * @method cleanup
 */
ozpIwc.LocksApi.prototype.cleanup = function(){
    var addrMap = {};
    ozpIwc.object.eachEntry(this.data,function(k,v){
        var queue = v.entity.queue || [];
        queue.forEach(function(entry){
            addrMap[entry.src] = true;
        });
    });

    var self = this;
    this.participant.names().bulkGet("/address").then(function(reply){
        reply.entity.forEach(function(node){
            if(node.entity.time && node.entity.time + ozpIwc.heartBeatFrequency > ozpIwc.util.now()){
                addrMap[node.entity.address] = false;
            }
        });
    }).then(function(){
        ozpIwc.object.eachEntry(addrMap,function(k,v){
            if(v) {
                self.unlockAll(k);
            }
        });
    });
};

/**
 * When the Consensus Module changes state, the Locks Api behaves differently. It's participant will only send outbound
 * messages if it is the "Coordinator".
 *
 * @method handleConsensusState
 * @param {String} state
 */
ozpIwc.LocksApi.prototype.handleConsensusState = function(state){
    ozpIwc.log.info("[" + this.participant.address + "] State: ", state);
    switch(state){
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

/**
 * If the Locks Api object has not been initialized, it will initialize with the data passed in to the handleLogs
 * function.
 *
 * @method handleLogs
 * @param {Object}data
 */
ozpIwc.LocksApi.prototype.handleLogs = function(data){
    if(this.initialized) {
        return;
    }
    this.initialized = true;
    var logTimestamp = data.timestamp;
    this.initializeData(data);
    this.deliverRequestQueue(logTimestamp);
};

/**
 * Override the default node type to be a Locks Api Value.
 *
 * @override
 * @method createNodeObject
 * @param {type} config
 * @returns {ozpIwc.DataNode}
 */
ozpIwc.LocksApi.prototype.createNodeObject=function(config) {
    return new ozpIwc.LocksNode(config);
};


/**
 * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
 *
 * @method shutdown
 * @return
 */
ozpIwc.LocksApi.prototype.shutdown=function() {
    if(this.leaderState === "leader") {
        this.broadcastDeathScream(this.createDeathScream());
    }

    this.participant.send({
        dst: "locks.api",
        resource: "/mutex/"+this.name,
        action: "unlock"
    });
};

//====================================================================
// Default Route
//====================================================================
ozpIwc.LocksApi.useDefaultRoute=function(actions,resource) {
    resource = resource || "{resource:.*}";
    actions=ozpIwc.util.ensureArray(actions);
    var self = this;
    actions.forEach(function(a) {
        var filterFunc=ozpIwc.standardApiFilters.forAction(a);
        self.declareRoute({
                action: a,
                resource: resource,
                filters: (filterFunc?filterFunc():[])
            },ozpIwc.ApiBase.defaultHandler[a]
        );
    });
};

ozpIwc.LocksApi.useDefaultRoute(["bulkGet", "list", "get","watch","unwatch"]);
//====================================================================
// Bulk Send
//====================================================================
ozpIwc.LocksApi.declareRoute({
    action: ["bulkSend"],
    resource: "{resource:.*}",
    filters: []
}, function(packet, context, pathParams) {
    var messages = packet.entity || [];
    var self = this;

    messages.forEach(function(message){
        var packetContext=new ozpIwc.TransportPacketContext({
            'packet':message.packet,
            'router': self.router,
            'srcParticipant': message.packet.src,
            'dstParticipant': self.address
        });
        self.receiveRequestPacket(packetContext);
    });
    return { response: "ok"};
});

//====================================================================
// Lock
//====================================================================
ozpIwc.LocksApi.declareRoute({
    action: "lock",
    resource: "/mutex/{name}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.LocksNode)
}, function(packet,context,pathParams) {
    if(context.node) {
        this.updateLock(context.node, context.node.lock({
            src: packet.src,
            msgId: packet.msgId
        }));
    }
});

//====================================================================
// Unlock
//====================================================================
ozpIwc.LocksApi.declareRoute({
    action: "unlock",
    resource: "/mutex/{name}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.LocksNode)
}, function(packet,context,pathParams) {
    packet.entity = packet.entity || {};
    ozpIwc.log.info("[locks.api"+ context.node.resource +"][UNLOCK]: ", packet.src);
    if(context.node) {
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
 * @param {ozpIwc.LocksApiValue} node
 * @param {Object} newOwner
 */
ozpIwc.LocksApi.prototype.updateLock=function(node,newOwner) {
    if(newOwner){
        ozpIwc.log.info("[locks.api"+ node.resource +"][NEW LEADER]",newOwner);
        var pkt = {
            'dst': newOwner.src,
            'src': this.participant.name,
            'replyTo': newOwner.msgId,
            'response': 'ok',
            'resource': node.resource
        };

        if(this.isSendQueueing) {
            this.sendQueue.push(pkt);
        } else {
            this.participant.send(pkt);
        }
    } else {
        ozpIwc.log.info("[locks.api"+ node.resource +"][SAME LEADER] queue:", JSON.stringify(node.entity.queue));
    }
};
