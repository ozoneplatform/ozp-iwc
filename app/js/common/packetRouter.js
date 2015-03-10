
ozpIwc.packetRouter = ozpIwc.packetRouter || {};

ozpIwc.packetRouter.uriTemplate=function(pattern) {
  var fields=[];
  var regex=new RegExp("^"+pattern.replace(/\{.+?\}|[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, function(match) {
      if(match.length===1) {
          return "\\"+match;
      }
      var spec=match.slice(1,-1).split(":",2);
      fields.push(spec[0]);
      if(spec[1]) {
          return "("+spec[1]+")";
      } else {
        return "([^\/]+)";
      }
  })+"$");
  
  return function(input) {
     var results=regex.exec(input);
     if(!results) {
         return null;
     }
     var obj={};
     for(var i=1;i<results.length;++i) {
         obj[fields[i-1]]=results[i];
     }
     return obj;
  };
    
};

ozpIwc.PacketRouter=function() {
    // the key on this table is the route action
    // the value is an array of config objects of the form:
    //    action: from the route declaration
    //    resource: from the route declaration
    //    handler: the function from the route declaration
    //    uriTemplate: uriTemplate function
    //    
    this.routes={};
    this.defaultRoute=function() { return false;};
    this.defaultSelf=this;
};



ozpIwc.PacketRouter.prototype.declareRoute=function(config,handler,handlerSelf) {
    if(!config || !config.action || !config.resource) {
        throw new Error("Bad route declaration: "+JSON.stringify(config,null,2));
    }
    var actionRoute=this.routes[config.action];
    if(!actionRoute) {
        actionRoute=this.routes[config.action]=[];
    }
    
    config.handler=handler;
    config.handlerSelf=handlerSelf || this.defaultSelf;
    config.uriTemplate=ozpIwc.packetRouter.uriTemplate(config.resource);
    actionRoute.push(config);
    return this;
};

ozpIwc.PacketRouter.prototype.routePacket=function(packet,context) {
    context=context || {};
    var actionRoutes=this.routes[packet.action];
    if(!actionRoutes) {
        return false;
    }
    for(var i=0;i<actionRoutes.length;++i) {
        var route=actionRoutes[i];
        var pathParams=route.uriTemplate(packet.resource);
        if(pathParams) {
            return route.handler.call(route.handlerSelf,packet,context,pathParams);
        }
    }
    return this.defaultRoute(packet,context,{});
    
};

ozpIwc.PacketRouter.prototype.declareDefaultRoute=function(handler) {
    this.defaultRoute=handler;
};