ozpIwc.ApiBase=function(config) {
	if(!config.participant) {
        throw Error("API must be configured with a participant");
    }
    this.participant=config.participant;

    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    
    this.data={};
    
    this.watchers={};
    
    this.changeList={};
    
    var self=this;
    this.participant.on("receive",function(packetContext) {
        self.receivePacketContext(packetContext);
    });
};
//ozpIwc.PacketRouter.mixin(ozpIwc.ApiBase);

//===============================================================
// Data Management
//===============================================================

ozpIwc.ApiBase.prototype.checkAuthorization=function(node,context,packet,action) {
  return true;
};

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

ozpIwc.ApiBase.prototype.resolveChangedNodes=function() {
    ozpIwc.object.eachEntry(this.changeList,function(resource,snapshot) {
        var node=this.data[resource];
        
        if(!node) {
            return;
        }
        var changes=node.changesSince(snapshot);

        this.notifyWatchers(node,changes);
        
    },this);
    this.changeList={};
};

ozpIwc.ApiBase.prototype.notifyWatchers=function(node,changes) {
    var watcherList=this.watchers[node.resource];

    if(!changes || !watcherList) {
        return;
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
        var reply={
            'src'   : this.participant.name,
            'dst'   : watcher.src,
            'replyTo' : watcher.replyTo,
            'response': 'changed',
            'resource': node.resource,
            'permissions': permissions,
            'entity': entity
        };

        this.participant.send(reply);
    },this);
    
};

ozpIwc.ApiBase.prototype.matchingNodes=function(prefix) {
    return ozpIwc.object.values(this.data, function(k,node) { 
        return node.resource.indexOf(prefix) >=0;
    });
};

//===============================================================
// Packet Routing
//===============================================================
ozpIwc.ApiBase.prototype.receivePacketContext=function(packetContext) {
    var packet=packetContext.packet;
    if(!packet.action) {
        console.log("Refusing to route a packet with no action: ",packet);
        return Promise.resolve();
    }
    var routeName="Routing["+packet.action+" "+packet.resource+"] ";
    
    console.log(routeName+"packet=" + packetContext.packet);
    var self=this;
    return new Promise(function(resolve,reject) {
        try {
            packetContext.node=self.data[packetContext.packet.resource];
            resolve(self.routePacket(packetContext.packet,packetContext));
        } catch(e) {
            reject(e);
        }
    }).then(function(packetFragment) {
//        console.log("Route completed successfully with ",packetFragment);
        if(packetFragment) {
            packetFragment.response = packetFragment.response || "ok";
            packetContext.replyTo(packetFragment);
        }
    },function(e) {
        console.log(routeName+"failed with ",e);
        packetContext.replyTo({
            'response': e.errorAction || "errorUnknown",
            'entity': e.message
        });
    }).then(function() {
        self.resolveChangedNodes();    
    });

};

//===============================================================
// Default Routes
//===============================================================

ozpIwc.ApiBase.prototype.defaultRoute=function(packet,context) {
    switch(context.defaultRouteCause) {
        case "noAction": 
            throw new ozpIwc.BadActionError(packet);
        case "noResource":
            throw new ozpIwc.BadResourceError(packet);
        default:
            throw new ozpIwc.BadRequestError(packet);
    }
};
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
        var watchList=this.watchers[packet.resource];
        if(!Array.isArray(watchList)) {
            watchList=this.watchers[packet.resource]=[];
        }

        watchList.push({
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
        actions=Array.isArray(actions)?actions:[actions];
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
