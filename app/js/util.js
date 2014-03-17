var Sibilant=Sibilant || {};

// General purpose functions
(function() {
	Sibilant.log=Sibilant.log || console;
	Sibilant.util=Sibilant.util || {};
	Sibilant.assert=Sibilant.assert || {};
	
	// TODO: coordinate ID generation to reduce the potential for collisions with large numbers of participants
	Sibilant.util.generateId=function() {
		return Math.floor(Math.random() * 0xffffffffffff).toString(16);
	};
	
	// bit of candygrammar, since there's a lot of Array.every and Array.some
	// calls that use this logic
	Sibilant.assert.areNot=Sibilant.assert.isNot=function(expected)	{ 
		return function(v) {return v!==expected;};
	};

	Sibilant.assert.are=Sibilant.assert.is = function(expected)	{ 
		return function(v) {return v===expected;};
	};
	
	/**
	 * @class
	 */
	Sibilant.Event=function() {
		this.events={};
	};	
	
	/**
	 * Registers a handler for the the event.
	 * @param {string} event The name of the event to trigger on
	 * @param {function} callback Function to be invoked
	 * @param {object} [self] Used as the this pointer when callback is invoked.
	 * @returns {object} A handle that can be used to unregister the callback via [off()]{@link Sibilant.Event#off}
	 */
	Sibilant.Event.prototype.on=function(event,callback,self) {
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
	 * returned by [on()]{@link Sibilant.Event#on}
	 * @param {type} event
	 * @param {type} callback
	 */	
	Sibilant.Event.prototype.off=function(event,callback) {
		this.events[event]=(this.events[event]||[]).filter(Sibilant.assert.isNot(callback));
	};
	
	/**
	 * Fires an event that will be received by all handlers.
	 * @param {string} event  - Name of the event
	 * @param {...*} arguments - Arguments to be passed to each handler.
	 * @returns {array} An array of all handler return values.
	 */
	Sibilant.Event.prototype.trigger=function(event) {
		var handlers=this.events[event] || [];

		// shave off the first arguments
		var data=Array.prototype.slice.call(arguments);
		data.shift(); 

		return handlers.map(function(h) {
			try{
				return h.apply(null,data);
			} catch(e) {
				Sibilant.log.warn("Handler error on event '" + event + "':" + e + " in callback: " + h);
				return {error: e};
			}
		});
	};

	Sibilant.Event.prototype.triggerForObjections=function(event) {
		var handlers=this.events[event] || [];

		// shave off the first arguments
		var data=Array.prototype.slice.call(arguments);
		data.shift(); 
		var rv=[];
	  handlers.forEach(function(h) {
			try{
				var v=h.apply(null,data);
				if(typeof(v)!=='undefined' && v !== true) {
					Sibilant.log.warn("Handler error on event '" + event + "':" + v + " in callback: " + h);
					rv.push(v);
				}
			} catch(e) {
				Sibilant.log.warn("Handler error on event '" + event + "':" + e + " in callback: " + h);
				rv.push({exception: e,handler: h});
			}
		});
		return rv.length>0? rv: false;
	};
	
	
	/**
	 * Adds an on() and off() function to the target that delegate to this object 
	 * @param {object} target Target to receive the on/off functions
	 */
	Sibilant.Event.prototype.mixinOnOff=function(target) {
		var self=this;
		target.on=function() { return self.on.apply(self,arguments);};
		target.off=function() { return self.off.apply(self,arguments);};
	};

	
})();