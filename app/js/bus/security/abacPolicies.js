
/**
 * Classes related to security aspects of the IWC.
 * @module bus
 * @submodule bus.security
 */

/**
 * Attribute Based Access Control policies.
 * @class abacPolicies
 * @static
 * @type {{}}
 */
ozpIwc.abacPolicies={};

/**
 * @static
 * @method permitWhenObjectHasNoAttributes
 * @param request
 * @returns {string}
 */
ozpIwc.abacPolicies.permitWhenObjectHasNoAttributes=function(request) {
    if(request.object && Object.keys(request.object).length===0) {
        return "permit";
    }
    return "undetermined";
};
/**
 * @static
 * @method subjectHasAllObjectAttributes
 * @param request
 * @returns {string}
 */
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

/**
 * @static
 * @method permitAll
 * @returns {string}
 */
ozpIwc.abacPolicies.permitAll=function() {
    return "permit";
};

