var sibilant=sibilant || {};


/** 
 * A basic authorization module loosely inspired by Apache Shiro.
 * Subjects are a string or array of subjects representing an actor
 * within the network (i.e. a participant).  
 * 
 * <p> Permissions are a string of the form "${domain}:${action}:${instance}".  
 * Wildcard matching is not currently supported, and all permissions are
 * cached for the duration of the browsing session.
 * 
 * @class
 */
sibilant.BasicAuthorization=function() {
	this.subjects={};	
};

sibilant.BasicAuthorization.prototype.grant=function(subject,permissions) {
	var a=this.subjects[subject] || [];
	
	this.subjects[subject]=a.concat(permissions);
	
};
	
/**
 * @param {type} subject
 * @param {type} permissions
 * @returns {sibilant.AsyncAction}
 */
sibilant.BasicAuthorization.prototype.isPermitted=function(subject,permissions) {
	if(typeof(permissions) === "string") {
		permissions=[permissions];
	}
	var action=new sibilant.AsyncAction();
	var perms=this.subjects[subject];
	
	if(!perms) {
		return action.resolve('failure');
	}
	
	for(var i=0;i<permissions.length;++i) {
		if(perms.indexOf(permissions[i]) === -1) {
			return action.resolve('failure');
		}
	}
	
	return action.resolve('success');
};
