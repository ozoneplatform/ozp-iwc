var sibilant=sibilant || {};
sibilant.log=sibilant.log || console;

sibilant.util=sibilant.util || {};

sibilant.util.generateId=function() {
		return Math.floor(Math.random() * 0xffffffffffff).toString(16);
};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 * @returns {Number}
 */
sibilant.util.now=function() {
		return new Date().getTime();
};

/**
	* @class
	*/
sibilant.Event=function() {
	this.events={};
};	

/**
 * Registers a handler for the the event.
 * @param {string} event The name of the event to trigger on
 * @param {function} callback Function to be invoked
 * @param {object} [self] Used as the this pointer when callback is invoked.
 * @returns {object} A handle that can be used to unregister the callback via [off()]{@link sibilant.Event#off}
 */
sibilant.Event.prototype.on=function(event,callback,self) {
	var wrapped=callback;
	if(self) {
		wrapped=function() { 
			callback.apply(self,arguments);
		};
		wrapped.sibilantDelegateFor=callback;
	}
	this.events[event]=this.events[event]||[];
	this.events[event].push(wrapped);
	return wrapped;
};

/**
 * Unregisters an event handler previously registered.
 * @param {type} event
 * @param {type} callback
 */	
sibilant.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter( function(h) {
		return h!==callback && h.sibilantDelegateFor !== callback;
	});
};

/**
 * Fires an event that will be received by all handlers.
 * @param {string} eventName  - Name of the event
 * @param {object} event - Event object to pass to the handers.
 * @returns {object} The event after all handlers have processed it
 */
sibilant.Event.prototype.trigger=function(eventName,event) {
	event = event || new sibilant.CancelableEvent();
	var handlers=this.events[eventName] || [];

	handlers.forEach(function(h) {
		h(event);
	});
	return event;
};


/**
 * Adds an on() and off() function to the target that delegate to this object 
 * @param {object} target Target to receive the on/off functions
 */
sibilant.Event.prototype.mixinOnOff=function(target) {
	var self=this;
	target.on=function() { return self.on.apply(self,arguments);};
	target.off=function() { return self.off.apply(self,arguments);};
};

/**
 * @class
 * Convenient base for events that can be canceled.  Provides and manages
 * the properties canceled and cancelReason, as well as the member function
 * cancel().
 * @param {object} data - Data that will be copied into the event
 */
sibilant.CancelableEvent=function(data) {
	data = data || {};
	for(k in data) {
		this[k]=data[k];
	}
	this.canceled=false;
	this.cancelReason=null;
};

/**
 * 
 * @param {type} reason - A text description of why the event was canceled.
 * @returns {sibilant.CancelableEvent} Reference to self
 */
sibilant.CancelableEvent.prototype.cancel=function(reason) {
	reason= reason || "Unknown";
	this.canceled=true;
	this.cancelReason=reason;
	return this;
};

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

sibilant.AsyncAction.prototype.fail=function(callback,self) {
	return this.when("fail",callback,self);
};