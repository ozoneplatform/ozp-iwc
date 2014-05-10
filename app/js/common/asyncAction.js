/** @namespace */
var sibilant=sibilant || {};


/**
 * A deferred action, but not in the sense of the Javascript standard.
 * @class
 */
sibilant.AsyncAction=function() {
	this.callbacks={};
};

sibilant.AsyncAction.prototype.when=function(state,callback,self) {
	if(self) {
		callback=function() { return callback.apply(self,arguments); };
	}
	
	if(this.resolution === state) {
		callback.apply(this,this.value);
	} else {
		this.callbacks[state]=callback;
	}
	return this;
};


sibilant.AsyncAction.prototype.resolve=function(status) {
	if(this.resolution) {
		throw "Cannot resolve an already resolved AsyncAction";
	}
	var callback=this.callbacks[status];
	this.resolution=status;
	this.value=Array.prototype.slice.call(arguments,1);
	
	if(callback) {
		callback.apply(this,this.value);
	}
	return this;
};

sibilant.AsyncAction.prototype.success=function(callback,self) {
	return this.when("success",callback,self);
};

sibilant.AsyncAction.prototype.failure=function(callback,self) {
	return this.when("failure",callback,self);
};