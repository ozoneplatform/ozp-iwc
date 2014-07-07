var ozpIwc=ozpIwc || {};

/** @typedef {string} ozpIwc.security.Role */

/** @typedef {string} ozpIwc.security.Permission */

/** @typedef { ozpIwc.security.Role[] } ozpIwc.security.Subject */

/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securityAttributes
 */


/** 
 * A basic authorization module loosely inspired by Apache Shiro.
 * <ul>
 *   <li> Role - an individual bundle of authority, represesented by a string.
 *   <li> Subject - an array of roles representing the authorities of an actor.
 *   <li> Permission - a string representing the authority to perform one discrete action.
 * </ul>
 * 
 * <p> Roles have permissions.  Subjects have one or more roles.  A check
 * is a subject asking if any of it's roles have a set of permissions. 
 * 
 * <p> The isPermitted() operation simply asks "for all permissions in the list, does the
 * subject have at least one role with that permission". 
 * 
 * <p> All operations are potentially asynchronous, though if the request can
 * be answered immediately, it will be.
 * 
 * <h2>OZP IWC's usage of authorization</h2>
 * 
 * <p> Roles are strings of the form "${domain}:${id}".  The domain
 * identifies the type of role, where the ID indentifies the specific instance.
 * 
 * <p>Supported Roles:
 * <ul>
 *   <li>participant:${address}
 *   <li>origin:${origin}
 * </ul>
 * 
 * <p> OZP IWC uses permissions of the form "${domain}:${action}:${instance}".
 * The domain is the type of the object being acted upon, the action
 * corresponds to the action being taken, and the instance is an optional
 * ID for the specific instance of the domain being acted upon.
 * 
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
 * Grants permissions to a role.
 * @param {ozpIwc.security.Role} role
 * @param {ozpIwc.security.Permission[]} permissions
 * @returns {undefined}
 */
ozpIwc.BasicAuthorization.prototype.grant=function(role,permissions) {
	var a=this.roles[role] || [];
	
	this.roles[role]=a.concat(permissions);
	
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

/**
 * Returns a boolean value of having specified role.
 * 
 * @class
 * @param {ozpIwc.security.Role} role
 */
ozpIwc.BasicAuthorization.prototype.hasRole=function(role) {
  var found = false;
  for (var i in this.roles) {
    if (i === role) {
      found = true;
      break;
    }
  }
  return found;
};

ozpIwc.authorization=new ozpIwc.BasicAuthorization();