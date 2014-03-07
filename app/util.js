var Sibilant=Sibilant || {};

// General purpose functions
(function() {
	Sibilant.log=Sibilant.log || console;
	Sibilant.util=Sibilant.util || {};
	Sibilant.assert=Sibilant.assert || {};
	// TODO: coordinate ID generation to reduce the potential for 
	// collisions with large numbers of participants

	Sibilant.util.generateId=function() {
		return (Math.random() * 0xffffffff).toString(16)
	};
	
	// bit of candygrammar, since there's a lot of Array.every and Array.some
	// calls that use this logic
	Sibilant.assert.areNot=Sibilant.assert.isNot=function(expected)	{ 
		return function(v) {return v!==expected;};
	};

	Sibilant.assert.are=Sibilant.assert.is = function(expected)	{ 
		return function(v) {return v===expected;};
	};
	
	Sibilant.Event=function() {
		this.events={};
		this.on=function(event,callback,self) {
			var wrapped=callback;
			if(self) {
				wrapped=function() { 
					callback.apply(self,arguments);
				};
			}
			(this.events[event]=this.events[event]||[]).push(wrapped);
			return wrapped;
		};
		
		
		this.off=function(event,callback) {
			this.events[event]=(this.events[event]||[]).filter(Sibilant.assert.isNot(callback));
		};
		
		
		this.trigger=function(event) {
			var handlers=this.events[event] || [];
			
			// shave off the first arguments
			var data=Array.prototype.slice.call(arguments);
			data.shift(); 

			var rv=[];
			handlers.forEach(function(h) {
				try{
					rv.push(h.apply(null,data));
				} catch(e) {
					Sibilant.log.warn("Handler error on event" + event + ":" + e + " in callback: " + h);
				}
			});
			return rv;
		};
		
	};
	
})();