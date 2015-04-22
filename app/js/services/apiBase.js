ozpIwc.ApiBase=function(config) {
	if(!config.name) {
        throw Error("API must be configured with a name");
    }
    this.participant=config.participant || new ozpIwc.ClientParticipant();

    this.name=config.name;
    this.coordinationAddress="coord." + this.name;
    
    
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    
    this.data={};
    this.watchers={};
    this.changeList={};
    this.leaderState="member";

    
    var router=config.router || ozpIwc.defaultRouter;
    router.registerParticipant(this.participant);
    router.registerMulticast(this.participant,[this.name,this.coordinationAddress]);

    var self=this;
    this.participant.on("receive",function(packetContext) {
        self.receivePacketContext(packetContext);
    });

    this.transitionToMemberReady();

    this.logPrefix="[" + this.name + "/" + this.participant.address +"] ";
    
    this.leaderPromise=this.participant.send({
        dst: "locks.api",
        resource: "/mutex/"+this.name,
        action: "lock"
    }).then(function() {
        return self.transitionToLoading();
    });
    
    this.leaderPromise.catch(function(e) {
        console.error("Error registering for leader mutex [address="+self.participant.address+",api="+self.name+"]",e);
    });
};
//===============================================================
// State transitions to be overriden by subclasses
//===============================================================
/**
 * Create the data that needs to be handed off to the new leader.
 * This MUST be a synchronous call that returns immediately.
 * @returns {object}
 */
ozpIwc.ApiBase.prototype.createDeathScream=function() {
    return {
        watchers: this.watchers,
        data: ozpIwc.object.eachEntry(this.data,function(k,v) {
            return v.serialize();
        })
    };
};

/**
 * Called when the API has become the leader, but before it starts
 * serving data.  Receives the deathScream of the previous leader
 * if available, otherwise undefined.
 * @param {type} deathScream
 * @returns {undefined}
 */
ozpIwc.ApiBase.prototype.initializeData=function(deathScream) {
    deathScream=deathScream || { watchers: {}, data: []};
    this.watchers=deathScream.watchers;
    var results=deathScream.data.map(function(packet) {
        this.data[packet.resource]=new ozpIwc.ApiNode({resource: packet.resource});
        this.data[packet.resource].deserialize(packet);
    },this);
    return Promise.all(results);
};



//===============================================================
// Leader state management
//===============================================================
// States: member -> loading -> leader
//   member: see member substates
//      -> loading on acquiring lock
//   loading: loads data from deathscream and server
//      -> leader   on loading complete
//   leader: responds to requests
//      -> terminal  on unload/shutdown
//   terminal: emits deathscream

// Member substates:  ready <-> dormant
//  ready: queues requests in case it has to become leader
//     -> dormant on discovering a leader
//  dormant: a leader exists, so do nothing except listen for lock acquisition or deathscream
//     -> ready on hearing a deathscream

ozpIwc.ApiBase.prototype.transitionToLoading=function() {
    var self=this;
    if(this.leaderState !== "member") {
        return;
    }
    this.leaderState="loading";
    return this.initializeData(this.deathScream)
        .then(function() {
             self.transitionToLeader();
        },function(e) {
            ozpIwc.log.error("Failed to load data due to ",e);
            self.shutdown();
        });
};

ozpIwc.ApiBase.prototype.transitionToLeader=function() {
    if(this.leaderState !== "loading") {
        return;
    }
    this.leaderState = "leader";
    this.broadcastLeaderReady();
    this.deliverRequestQueue();
};

ozpIwc.ApiBase.prototype.shutdown=function() {
    if(this.leaderState === "leader") {
        this.broadcastDeathScream(this.createDeathScream());
    }
    
    this.participant.send({
        dst: "locks.api",
        resource: "/mutex/"+this.name,
        action: "unlock"
    });
};

ozpIwc.ApiBase.prototype.transitionToMemberReady=function(deathScream) {
    if(this.leaderState !== "member") {
        return;
    }
    this.deathScream=deathScream;
    this.enableRequestQueue();
    return Promise.resolve();
};

ozpIwc.ApiBase.prototype.transitionToMemberDormant=function() {
    if(this.leaderState !== "member") {
        return;
    }
    this.deathScream=null;
    this.flushRequestQueue();
    return Promise.resolve();
};

//===============================================================
// Data Management
//===============================================================

ozpIwc.ApiBase.prototype.checkAuthorization=function(node,context,packet,action) {
    return true;
};


ozpIwc.ApiBase.prototype.matchingNodes=function(prefix) {
    return ozpIwc.object.values(this.data, function(k,node) { 
        return node.resource.indexOf(prefix) >=0;
    });
};


//===============================================================
// Watches
//===============================================================

ozpIwc.ApiBase.prototype.markForChange=function(/*varargs*/) {
    for(var i=0;i<arguments.length;++i) {
        if(Array.isArray(arguments[i])) {
            this.markForChange(arguments[i]);
        } else {
            var resource=arguments[i].resource || ""+arguments[i];
            // if it's already marked, skip it
            if(this.changeList.hasOwnProperty(resource)) {
                continue;
            }
            
            var n=this.data[resource];

            this.changeList[resource]=n?n.snapshot():{};
        }
    }
};

ozpIwc.ApiBase.prototype.addWatcher=function(resource,watcher) {
    var watchList=this.watchers[resource];
    if(!Array.isArray(watchList)) {
        watchList=this.watchers[resource]=[];
    }

    watchList.push(watcher);
};

ozpIwc.ApiBase.prototype.resolveChangedNodes=function() {
    ozpIwc.object.eachEntry(this.changeList,function(resource,snapshot) {
        var node=this.data[resource];
        
        if(!node) {
            return Promise.resolve();
        }
        var changes=node.changesSince(snapshot);

        this.notifyWatchers(node,changes);
    },this);
    this.changeList={};
};

        
        
ozpIwc.ApiBase.prototype.notifyWatchers=function(node,changes) {
    var watcherList=this.watchers[node.resource];

    if(!changes || !watcherList) {
        return Promise.resolve();
    }

    var permissions=ozpIwc.authorization.pip.attributeUnion(
        changes.oldValue.permissions,
        changes.newValue.permissions
    );
    
    var entity={
        oldValue: changes.oldValue.entity,
        newValue: changes.newValue.entity
    };

    watcherList.forEach(function(watcher) {
        // @TODO allow watchers to changes notifications if they have permission to either the old or new, not just both
        this.participant.send({
            'src'   : this.participant.name,
            'dst'   : watcher.src,
            'replyTo' : watcher.replyTo,
            'response': 'changed',
            'resource': node.resource,
            'permissions': permissions,
            'entity': entity
        });
    },this);
    
};


//===============================================================
// Packet Routing
//===============================================================
ozpIwc.ApiBase.prototype.receivePacketContext=function(packetContext) {
    if(packetContext.packet.src===this.participant.address) {
        // drop our own packets
        return Promise.resolve();
    }

    if(packetContext.packet.dst===this.coordinationAddress) {
        return this.receiveCoordinationPacket(packetContext);
    } else {
        return this.receiveRequestPacket(packetContext);
    }
};

//===============================================================
// API Request Handling
//===============================================================

ozpIwc.ApiBase.prototype.receiveRequestPacket=function(packetContext) {
    var packet=packetContext.packet;

//    var routeName=this.logPrefix+" Routing ("+packet.action+" "+packet.resource+") ";
    if(this.isRequestQueueing) {
        this.queueRequest(packetContext);
        return Promise.resolve();
    }
    
//    console.log(routeName+"packet=" + packetContext.packet);
    var self=this;
    return new Promise(function(resolve,reject) {
        try {
            packetContext.node=self.data[packetContext.packet.resource];
            resolve(self.routePacket(packetContext.packet,packetContext));
        } catch(e) {
            reject(e);
        }
    }).then(function(packetFragment) {
//        console.log(routeName + "completed successfully with ",packetFragment);
        if(packetFragment) {
            packetFragment.response = packetFragment.response || "ok";
            packetContext.replyTo(packetFragment);
        }
        self.resolveChangedNodes();    
    },function(e) {
//        console.log(routeName+"failed with "+e.toString());
        var packetFragment={
            'src': self.name,
            'response': e.errorAction || "errorUnknown",
            'entity': e.message
        };
        packetContext.replyTo(packetFragment);
//        self.participant.send(packetContext.makeReplyTo(packetFragment));
    });

};

ozpIwc.ApiBase.prototype.defaultRoute=function(packet,context) {
    switch(context.defaultRouteCause) {
        case "nonRoutablePacket": // packet doesn't have an action/resource, so ignore it
            return;
        case "noAction": 
            throw new ozpIwc.BadActionError(packet);
        case "noResource":
            throw new ozpIwc.BadResourceError(packet);
        default:
            throw new ozpIwc.BadRequestError(packet);
    }
};

ozpIwc.ApiBase.prototype.queueRequest=function(packetContext) {
    if(this.isRequestQueueing) {
        this.requestQueue.push(packetContext);
    }
};

ozpIwc.ApiBase.prototype.enableRequestQueue=function() {
    this.isRequestQueueing=true;
    this.requestQueue=[];
};

ozpIwc.ApiBase.prototype.deliverRequestQueue=function() {
    this.isRequestQueueing=false;
    this.requestQueue.forEach(this.receiveRequestPacket,this);
    this.requestQueue=[];
};

ozpIwc.ApiBase.prototype.flushRequestQueue=function() {
    this.isRequestQueueing=false;
    this.requestQueue=[];
};



//===============================================================
// API Coordination Handling
//===============================================================
ozpIwc.ApiBase.prototype.broadcastLeaderReady=function() {
    this.participant.send({
        dst: this.coordinationAddress,
        action: "announceLeader"
    });
};

ozpIwc.ApiBase.prototype.broadcastDeathScream=function(deathScream) {
    this.participant.send({
        dst: this.coordinationAddress,
        action: "deathScream",
        entity: deathScream
    });
};

ozpIwc.ApiBase.prototype.receiveCoordinationPacket=function(packetContext) {
    var packet=packetContext.packet;
    switch(packet.action) {
        case "announceLeader":
            return this.transitionToMemberDormant();
        case "deathScream":
            return this.transitionToMemberReady(packet.entity);
        default:
            ozpIwc.log.error("Unknown coordination packet: ",packet);
    }
    return Promise.reject(new Error("Unknown action: " + packet.action + " in " + JSON.stringify(packetContext)));
};

//===============================================================
// Default Routes and Subclass Helpers
//===============================================================

ozpIwc.ApiBase.defaultHandler={
    "get":function(packet,context,pathParams) {
        return context.node.toPacket();
    },
    "set":function(packet,context,pathParams) {
        context.node.set(packet);
        return { response: "ok" };
    },
    "delete": function(packet,context,pathParams) {
        if(context.node) {
            context.node.markAsDeleted(packet);
        }

        return { response: "ok" };
    },
    "list": function(packet,context,pathParams) {
        var entity=this.matchingNodes(packet.resource).map(function(node) {
            return node.resource;
        });
        return {
            "contentType": "application/json",
            "entity": entity
        };
    },
    "bulkGet": function(packet,context,pathParams) {
        var entity=this.matchingNodes(packet.resource).map(function(node) {
            return node.toPacket();
        });
        // TODO: roll up the permissions of the nodes, as well
        return {
            "contentType": "application/json",
            "entity": entity
        };
    },
    "watch": function(packet,context,pathParams) {
        this.addWatcher(packet.resource,{
            src: packet.src,
            replyTo: packet.msgId
        });

        if(context.node) {
            return context.node.toPacket();
        } else {
            return { response: "ok"};
        }
    },
    "unwatch": function(packet,context,pathParams) {
        var watchList=this.watchers[packet.resource];
        if(watchList) {
            this.watchers[packet.resource]=watchList.filter(function(watch) {
               return watch.src === packet.src && watch.replyTo === packet.msgId;
           });
        }

        return { response: "ok" };
    }
};
ozpIwc.ApiBase.allActions=Object.keys(ozpIwc.ApiBase.defaultHandler);

ozpIwc.createApi=function(init) {
    var api=ozpIwc.util.extend(ozpIwc.ApiBase,function() {
        ozpIwc.ApiBase.apply(this, arguments);
        return init.apply(this,arguments);
    });
    ozpIwc.PacketRouter.mixin(api);
    api.useDefaultRoute=function(actions,resource) {
        resource = resource || "{resource:.*}";
        actions=ozpIwc.util.ensureArray(actions);
        actions.forEach(function(a) {
            var filterFunc=ozpIwc.standardApiFilters.forAction(a);
            api.declareRoute({
                action: a,
                resource: resource,
                filters: (filterFunc?filterFunc():[])
            },ozpIwc.ApiBase.defaultHandler[a]
            );
        });
    };
    return api;
};
