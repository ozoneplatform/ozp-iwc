ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.defaultPolicies = {};

/**
 * Allows origins to connect that are included in the hard coded whitelist.
 * @method '/policy/connect'
 * @param request
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/connect'] = function(request){
    var policyActions = ['connect'];
    var whiteListedOrigins = [
        "http://localhost:13000",
        "http://localhost:14000",
        "http://localhost:14001",
        "http://localhost:14002",
        "http://localhost:15000",
        "http://localhost:15001",
        "http://localhost:15002",
        "http://localhost:15003",
        "http://localhost:15004",
        "http://localhost:15005",
        "http://localhost:15006",
        "http://localhost:15007",
        "http://ozone-development.github.io"
    ];

    if(!ozpIwc.util.arrayContainsAll(policyActions,request.action['ozp:iwc:action'])){
        return "NotApplicable";
    } else if(!ozpIwc.util.arrayContainsAll(whiteListedOrigins,request.subject['ozp:iwc:origin'])){
        return "Deny";
    } else {
        return "Permit";
    }
};

/**
 * Applies the sendAs policy requirements to a default policy. The given request must have an action of 'sendAs'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/sendAs'] = function(request){
    return ozpIwc.abacPolicies.defaultPolicy(request,'sendAs');
};

/**
 * Applies the receiveAs policy requirements to a default policy. The given request must have an action of 'receiveAs'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/receiveAs'] = function(request){
    return ozpIwc.abacPolicies.defaultPolicy(request,'receiveAs');
};

/**
 * Applies the read policy requirements to a default policy. The given request must have an action of 'read'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/read'] = function(request){
    return ozpIwc.abacPolicies.defaultPolicy(request,'read');
};

/**
 * Applies the api access policy requirements to a default policy. The given request must have an action of 'access'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/apiNode'] = function(request){
    return ozpIwc.abacPolicies.defaultPolicy(request,'access');
};
