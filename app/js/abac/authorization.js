ozpIwc = ozpIwc || {};
ozpIwc.abac = {};
(function() {

var flatten=function() {
    return Array.prototype.reduce.call(arguments,function(acc,val) {
        if(val!==null && val !== undefined) {
            acc.doesExist=true;
            return acc.concat(val);
        } else {
            return acc;
        }
    },[]);
};
    
ozpIwc.abac.NormalizedAttribute=function(/*varargs*/) {
    // merge
    var values=flatten(arguments);
    var isInValues=function(v) {
      return values.indexOf(v) >= 0;
    };
    
    
    values.contains=
    values.containsAny=function(/*varargs*/) {
        return flatten(arguments).some(isInValues);
    };
    
    values.containsAll=function(/*varargs*/) {
        return flatten(arguments).evert(isInValues);
    };
    
    values.exists=function() { 
        return this.doesExist;
    };
    
    return values;
};

function makeAccessor(obj,defaultKey) {
    if(typeof(obj) !== "Object") {
        throw TypeError("Authorization request must contain objects");
    }
    var accessor=function(key) {
        key=key || defaultKey;
        return ozpIwc.abac.NormalizedAttribute(obj[key]);
    };

    accessor.merge=function(/*varArg*/) {
        return ozpIwc.abac.NormalizedAttribute(
            flatten(arguments).map(function(k) { return obj[k];})
        );
    };
    return accessor;
}


ozpIwc.abac.Authorization = function(config) {
    this.pip=config.pip || new ozpIwc.abac.PolicyInformationPoint();
};

ozpIwc.abac.Authorization.prototype.isPermitted=function(subjectOrRequest,action,resource) {
    var request=subjectOrRequest;
    if(arguments.length===1) {
        request={
            subject: subjectOrRequest,
            action: action,
            resource: resource
        };
    }

    var pip=this.pip;
    // make sure each entry is an object
    return pip.resolveRequest(request).then(function(resolvedRequest) {
        ozpIwc.object.eachEntry(resolvedRequest,function(k,v) {
            resolvedRequest[k]=makeAccessor(v);
        });
        
        // loop over the policies
        
        
    });
};

});