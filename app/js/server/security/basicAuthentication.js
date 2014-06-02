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
 *   <li> Subject - an array of roles representing the authorities of an actor.
 *   <li> Permission - a string representing the authority to perform one discrete action.
 * </ul>
 * 
 * <p> Principals have permissions.  Subjects have one or more roles.  A check
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
 * <p> Principals are strings of the form "${domain}:${id}".  The domain
 * identifies the type of role, where the ID indentifies the specific instance.
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
ozpIwc.BasicAuthentication=function() {
	this.roles={};	
};

/**
 * Returns the authenticated subject for the given credentials.
 * 
 * <p>The preAuthenticatedSubject allows an existing subject to augment their
 * roles using credentials.  For example, PostMessageParticipants are
 * assigned a role equal to their origin, since the browser authoritatively
 * determines that.  The security module can then add additional roles based
 * upon configuration.
 * 
 * @param {ozpIwc.security.Credentials} credentials
 * @param {ozpIwc.security.Subject} [preAuthenticatedSubject] - The pre-authenticated
 *   subject that is presenting these credentials.   
 * @returns {ozpIwc.AsyncAction} If the credentials are authenticated, the success handler receives
 *     the subject.
 */
ozpIwc.BasicAuthentication.prototype.login=function(credentials,preAuthenticatedSubject) {
	if(!credentials) {
		throw "Must supply credentials for login";
	}
	var action=new ozpIwc.AsyncAction();
	
	preAuthenticatedSubject=preAuthenticatedSubject || [];
	return action.resolve("success",preAuthenticatedSubject);
};

