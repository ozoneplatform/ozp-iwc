var ozpIwc=ozpIwc || {};

/** @typedef {string} ozpIwc.security.Role */

/** @typedef {string} ozpIwc.security.Permission */

/** @typedef { ozpIwc.security.Role[] } ozpIwc.security.Subject */

/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securityAttributes
 */


/** 
 * A simple Attribute-Based Access Control implementation
 * @todo Permissions are local to each peer.  Does this need to be synced?
 * 
 * @class
 */
ozpIwc.BasicAuthorization=function(config) {
    config=config || {};
	this.roles={};
    this.policies= config.policies || [
//        ozpIwc.abacPolicies.permitAll
        ozpIwc.abacPolicies.permitWhenObjectHasNoAttributes,
        ozpIwc.abacPolicies.subjectHasAllObjectAttributes
    ];
};

ozpIwc.BasicAuthorization.prototype.implies=function(subjectVal,objectVal) {
    // no object value is trivially true
    if(objectVal===undefined || objectVal === null) {
        return true;
    }
    // no subject value when there is an object value is trivially false
    if(subjectVal===undefined || subjectVal === null) {
        return false;
    }
    
    // convert both to arrays, if necessary
    subjectVal=Array.isArray(subjectVal)?subjectVal:[subjectVal];
    objectVal=Array.isArray(objectVal)?objectVal:[objectVal];

    // confirm that every element in objectVal is also in subjectVal
    return ozpIwc.util.arrayContainsAll(subjectVal,objectVal);
};


/**
 * Confirms that the subject has all of the permissions requested.
 * @param {object} request
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.BasicAuthorization.prototype.isPermitted=function(request) {
	var action=new ozpIwc.AsyncAction();
	
    var result=this.policies.some(function(policy) {
        return policy.call(this,request)==="permit";
    },this);
    
    
    if(result) {
        return action.resolve("success");
    } else {
		return action.resolve('failure');
    }
};


ozpIwc.authorization=new ozpIwc.BasicAuthorization();