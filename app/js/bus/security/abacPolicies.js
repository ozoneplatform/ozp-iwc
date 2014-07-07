
ozpIwc.abacPolicies={};


ozpIwc.abacPolicies.permitWhenObjectHasNoAttributes=function(request) {
    if(request.object && Object.keys(request.object).length===0) {
        return "permit";
    }
    return "undetermined";
};

ozpIwc.abacPolicies.subjectHasAllObjectAttributes=function(request) {
    // if no object permissions, then it's trivially true
    if(!request.object) {
        return "permit";
    }
    var subject = request.subject || {};
    if(ozpIwc.util.objectContainsAll(subject,request.object,this.implies)) {
        return "permit";
    }
    return "deny";
};

ozpIwc.abacPolicies.permitAll=function() {
    return "permit";
};

