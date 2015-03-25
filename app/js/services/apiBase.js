ozpIwc.ApiBase=function(config) {
	if(!config.participant) {
        throw Error("API must be configured with a participant");
    }
    this.participant=config.participant;

    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    
    this.data={};
    
    this.watchers={
        
    };
    
    var self=this;
    this.participant.on("receive",function(packetContext) {
        self.receivePacketContext(packetContext);
    });
};
ozpIwc.PacketRouter.mixin(ozpIwc.ApiBase);

//===============================================================
// Data Management
//===============================================================

ozpIwc.ApiBase.prototype.checkAuthorization=function(node,context,packet,action) {
  return true;
};
ozpIwc.ApiBase.prototype.watchForChange=function(node,fn) {
    var watcherList=this.watchers[node.resource];
    
    // if no watchers, don't bother checking
    if(!watcherList) { 
        return fn();
    }
    
    var snapshot=node.snapshot();        

    var returnValue=fn();

    var changes=node.changesSince(snapshot);
    
    if(changes) {
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
    }
    return returnValue;
};

//===============================================================
// Packet Routing
//===============================================================
ozpIwc.ApiBase.prototype.receivePacketContext=function(packetContext) {
    console.log("Routing action="+packetContext.packet.action+
        " resource=" + packetContext.packet.resource,
        " packet=" + packetContext.packet);
    var self=this;
    return new Promise(function(resolve,reject) {
        try {
            resolve(self.routePacket(packetContext.packet,packetContext));
        } catch(e) {
            reject(e);
        }
    }).then(function(packetFragment) {
        console.log("Route completed successfully with ",packetFragment);
        if(packetFragment) {
            packetFragment.response = packetFragment.response || "ok";
            packetContext.replyTo(packetFragment);
        }
    },function(e) {
        console.log("Route failed with ",e);
        packetContext.replyTo({
            'response': e.errorAction || "errorUnknownException",
            'entity': e.message
        });
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

ozpIwc.ApiBase.declareRoute({
    action: "get",
    resource: "{resource:.*}",
    filters: [
        ozpIwc.apiFilter.requireResource(),
        ozpIwc.apiFilter.checkAuthorization()
    ]
},function(packet,context,pathParams) {
    return context.node.toPacket();
});

ozpIwc.ApiBase.declareRoute({
    action: "set",
    resource: "{resource:.*}",
    filters: [
        ozpIwc.apiFilter.createResource(),
        ozpIwc.apiFilter.checkAuthorization(),
        ozpIwc.apiFilter.checkVersion(),
        ozpIwc.apiFilter.notifyWatchers()
    ]
},function(packet,context,pathParams) {
    context.node.set(packet);
    
    return { response: "ok" };
});

ozpIwc.ApiBase.declareRoute({
    action: "delete",
    resource: "{resource:.*}",
    filters: [
        ozpIwc.apiFilter.loadResource(),
        ozpIwc.apiFilter.checkAuthorization(),
        ozpIwc.apiFilter.checkVersion(),
        ozpIwc.apiFilter.notifyWatchers()
    ]
},function(packet,context,pathParams) {
    if(context.node) {
        context.node.markAsDeleted(packet);
    }
    
    return { response: "ok" };
});

ozpIwc.ApiBase.declareRoute({
    action: "list",
    resource: "{resource:.*}",
    filters: [
        
    ]
},function(packet,context,pathParams) {
    var entity=ozpIwc.object.values(this.data, function(k,node) { 
        return node.resource.indexOf(pathParams.resource) >=0;
    }).map(function(node) {
        return node.resource;
    });
    return {
        "contentType": "application/json",
        "entity": entity
    };
});

ozpIwc.ApiBase.declareRoute({
    action: "bulkGet",
    resource: "{resource:.*}",
    filters: [
        
    ]
},function(packet,context,pathParams) {
    var entity=ozpIwc.object.values(this.data, function(k,node) { 
        return node.resource.indexOf(pathParams.resource) >=0;
    }).map(function(node) {
        return node.toPacket();
    });
    // TODO: roll up the permissions of the nodes, as well
    return {
        "contentType": "application/json",
        "entity": entity
    };
});

ozpIwc.ApiBase.declareRoute({
    action: "watch",
    resource: "{resource:.*}",
    filters: [
        ozpIwc.apiFilter.loadResource()
    ]
},function(packet,context,pathParams) {
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
});

ozpIwc.ApiBase.declareRoute({
    action: "unwatch",
    resource: "{resource:.*}",
    filters: [
        ozpIwc.apiFilter.createResource()
    ]
},function(packet,context,pathParams) {
    var watchList=this.watchers[packet.resource];
    if(watchList) {
        this.watchers[packet.resource]=watchList.filter(function(watch) {
           return watch.src === packet.src && watch.replyTo === packet.msgId;
       });
    }
    
    return { response: "ok" };
});