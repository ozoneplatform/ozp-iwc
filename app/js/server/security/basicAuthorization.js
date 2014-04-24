var sibilant=sibilant || {};

/** @typedef {string} sibilant.security.Principal */

/** @typedef {string} sibilant.security.Permission */

/** @typedef { sibilant.security.Principal[] } sibilant.security.Subject */

/** 
 * @typedef {object} sibilant.security.Actor 
 * @property {sibilant.security.Subject} securitySubject
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
 * <h2>Sibilant's usage of authorization</h2>
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
 * <p> Sibilant uses permissions of the form "${domain}:${action}:${instance}".
 * The domain is the type of the object being acted upon, the action
 * corresponds to the action being taken, and the instance is an optional
 * ID for the specific instance of the domain being acted upon.
 * 
 * @todo Permissions are local to each peer.  Does this need to be synced?
 * 
 * @class
 */
sibilant.BasicAuthorization=function() {
	this.principals={};	
};

/**
 * Grants permissions to a principal.
 * @param {sibilant.security.Principal} principal
 * @param {sibilant.security.Permission[]} permissions
 * @returns {undefined}
 */
sibilant.BasicAuthorization.prototype.grant=function(principal,permissions) {
	var a=this.principals[principal] || [];
	
	this.principals[principal]=a.concat(permissions);
	
};
	
/**
 * Confirms that the subject has all of the permissions requested.
 * @param {sibilant.security.Subject} subject
 * @param {sibilant.security.Permission[]} permissions
 * @returns {sibilant.AsyncAction}
 */
sibilant.BasicAuthorization.prototype.isPermitted=function(subject,permissions) {
	var permMap={};
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
	
	var action=new sibilant.AsyncAction();

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
