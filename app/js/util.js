var sibilant=sibilant || {};
sibilant.log=sibilant.log || console;

sibilant.util=sibilant.util || {
	generateId: function() {
		return Math.floor(Math.random() * 0xffffffffffff).toString(16);
	}
};

sibilant.assert=sibilant.assert || {};
sibilant.assert.areNot=sibilant.assert.isNot=function(expected)	{ 
	return function(v) {return v!==expected;};
};

sibilant.assert.are=sibilant.assert.is = function(expected)	{ 
	return function(v) {return v===expected;};
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
	}
	this.events[event]=this.events[event]||[];
	this.events[event].push(wrapped);
	return wrapped;
};

/**
 * Unregisters an event handler previously registered.  Requires the handle
 * returned by [on()]{@link sibilant.Event#on}
 * @param {type} event
 * @param {type} callback
 */	
sibilant.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter(sibilant.assert.isNot(callback));
};

/**
 * Fires an event that will be received by all handlers.
 * @param {string} event  - Name of the event
 * @param {...*} arguments - Arguments to be passed to each handler.
 * @returns {array} An array of all handler return values.
 */
sibilant.Event.prototype.trigger=function(event) {
	var handlers=this.events[event] || [];

	// shave off the first arguments
	var data=Array.prototype.slice.call(arguments);
	data.shift(); 

	return handlers.map(function(h) {
		try{
			return h.apply(null,data);
		} catch(e) {
			sibilant.log.warn("Handler error on event '" + event + "':" + e + " in callback: " + h);
			return {error: e};
		}
	});
};

sibilant.Event.prototype.triggerForObjections=function(event) {
	var handlers=this.events[event] || [];

	// shave off the first arguments
	var data=Array.prototype.slice.call(arguments);
	data.shift(); 
	var rv=[];
	handlers.forEach(function(h) {
		try{
			var v=h.apply(null,data);
			if(typeof(v)!=='undefined' && v !== true) {
				rv.push(v);
			}
		} catch(e) {
			sibilant.log.warn("Handler error on event '" + event + "':" + e + " in callback: " + h);
			rv.push({exception: e,handler: h});
		}
	});
	return rv.length>0? rv: false;
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
