ozpIwc = ozpIwc || {};
ozpIwc.abac = {};



ozpIwc.abac.PolicyInformationPoint=function() {
    
};

ozpIwc.abac.PolicyInformationPoint.prototype.resolve=function(categoryName,value) {
    if(categoryName==="action" && typeof(value) !== "Object") {
        value={
            "ozp:iwc:action": value
        };
    }
    return value;
};

ozpIwc.abac.PolicyInformationPoint.prototype.resolveRequest=function(request) {
    var normalizedRequest={};
    ozpIwc.object.eachEntry(request,function(k,v) {
        normalizedRequest[k]=this.resolve(k,v);
    },this);
    return Promise.resolve(normalizedRequest);
};