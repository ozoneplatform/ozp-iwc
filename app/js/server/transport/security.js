var sibilant=sibilant || {};


sibilant.security={
	/**
	 * @param {type} subject
	 * @param {type} permissions
	 * @returns {sibilant.AsyncAction}
	 */
	isPermitted: function(subject,permissions) {
		return new sibilant.AsyncAction().resolve("success",true);
	},
	
	
	auth: function(credentials) {
		return new sibilant.AsyncAction().resolve("fail",credentials);
	}
};