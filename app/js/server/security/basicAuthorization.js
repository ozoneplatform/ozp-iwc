var ozpIwc=ozpIwc || {};

/** @typedef {string} ozpIwc.security.Principal */

/** @typedef {string} ozpIwc.security.Permission */

/** @typedef { ozpIwc.security.Principal[] } ozpIwc.security.Subject */

/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securitySubject
 */


/** 
 * A basic authorization module loosely inspired by Apache Shiro.
 * <ul>
 *   <li> Principal - an individual bundle of authority, represesented by a string.
 *   <li> Subject - an array of principals representing the authorities of an actor.
 *   <li> Permission - a string representing the authority to perform one discrete action.
 * </ul>
 * 
 * <p> Principals have permissions.  Subjects have one or more principals.  A check
 * is a subject asking if any of it's principals have a set of permissions. 
 * 
 * <p> The isPermitted() operation simply asks "for all permissions in the list, does the
 * subject have at least one principal with that permission". 
 * 
 * <p> All operations are potentially asynchronous, though if the request can
 * be answered immediately, it will be.
 * 
 * <h2>OZP IWC's usage of authorization</h2>
 * 
 * <p> Principals are strings of the form "${domain}:${id}".  The domain
 * identifies the type of principal, where the ID indentifies the specific instance.
 * 
 * <p>Supported Principals:
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
ozpIwc.BasicAuthorization=function() {
	this.principals={};	
};

/**
 * Grants permissions to a principal.
 * @param {ozpIwc.security.Principal} principal
 * @param {ozpIwc.security.Permission[]} permissions
 * @returns {undefined}
 */
ozpIwc.BasicAuthorization.prototype.grant=function(principal,permissions) {
	var a=this.principals[principal] || [];
	
	this.principals[principal]=a.concat(permissions);
	
};
	
/**
 * Confirms that the subject has all of the permissions requested.
 * @param {ozpIwc.security.Subject} subject
 * @param {ozpIwc.security.Permission[]} permissions
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.BasicAuthorization.prototype.isPermitted=function(subject,permissions) {
	var permMap={};
	
	var action=new ozpIwc.AsyncAction();
	if(!permissions) {
		return action.resolve('success');
	}
	if(typeof(permissions) === "string") {
		permMap[permissions]=1;
	} else {
		for(var i=0;i<permissions.length;++i) {
			permMap[permissions[i]]=1;
		}
	}
	
	if(typeof(subject) === "string") {
		subject=[subject];
	}	
	

	for(var i=0;i<subject.length;++i) {
		var perms=this.principals[subject[i]];
		if(!perms) {
			continue;
		}
		for(var k in permMap) {
			if(perms.indexOf(k) !== -1) {
				delete permMap[k];
				if(Object.keys(permMap).length === 0) {
					return action.resolve('success');
				}
			}
		}
	}
	
	return action.resolve('failure');
};

ozpIwc.authorization=new ozpIwc.BasicAuthorization();