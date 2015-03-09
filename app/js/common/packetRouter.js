
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
    this.events=new ozpIwc.Event();
    this.events.mixinOnOff(this);
};

ozpIwc.PacketRouter.prototype.declareRoute=function(config,callback) {
    if(!config || !config.action || !config.resource) {
        throw new Error("Bad route declaration: "+JSON.stringify(config,null,2));
    }
    var actionRoute=this.routes[config.action];
    if(!actionRoute) {
        actionRoute=this.routes[config.action]=[];
    }
    
    config.handler=callback;
    config.uriTemplate=ozpIwc.packetRouter.uriTemplate(config.resource);
    actionRoute.push(config);
    return this;
};

ozpIwc.PacketRouter.prototype.routePacket=function(packet) {
    var actionRoute=this.routes[packet.action];
    if(!actionRoute) {
        return false;
    }
    return actionRoute.some(function(route) {
       var params=route.uriTemplate(packet.resource);
       if(params) {
           route.handler(packet,params);
           return true;
       } else {
           return false;
       }
    });
    
};