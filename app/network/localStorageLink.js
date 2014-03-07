	
var Sibilant=Sibilant || {};
Sibilant.impl=Sibilant.impl || {};
Sibilant.impl.LocalStorageLink=function(config) {
	var config=config || {};
	
	var linkId=config.linkId || 'localStorage';
	var prefix=config.prefix || 'Sibilant';
	var peer=config.peer || Sibilant.peer;
	var selfId=config.selfId || peer.selfId();
	this.myKeysTimeout = config.myKeysTimeout || 50000; // 5 seconds
	this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes
	
	var makeKey=function() { 
		return [prefix,selfId,new Date().getTime()].join('|');
	};
	
	var splitKey=function(k) { 
		var parts=k.split("|");
		if(parts.length===3 && parts[0]===prefix) {
			return { id: parts[1], createdAt: parseInt(parts[2]) };
		}	
		return null;
	};

									 
  this.getNow=function() {
		return new Date().getTime();
	}
	this.cleanKeys=function(myMaxKeyAge,otherMaxKeyAge) {
		var now=this.getNow();
		var myKeyExpiration = now - this.myKeysTimeout;
		var otherKeyExpiration = now - this.otherKeysTimeout;

		for(var i=0; i < localStorage.length;++i) {
			var keyName=localStorage.key(i);
			var k=splitKey(keyName);
			if(k) {
				if((k.id===selfId && k.createdAt <= myKeyExpiration) 
						|| (k.createdAt <= otherKeyExpiration)) {
					localStorage.removeItem(keyName);
				}				
			}
		};
		
		
	};
	this.send=function(packet) { 
		localStorage.setItem(makeKey(),JSON.stringify(packet));
		Sibilant.Metrics.counter('links',linkId,'packets.sent').inc();
		
		window.setTimeout(function() {self.cleanKeys();},this.myKeysTimeout); 

	};

  // Hook into the system
	var self=this;
	
	var receiveStorageEvent=function(event) {
		var key=splitKey(event.key);
		if(key) {
			var packet=JSON.parse(localStorage.getItem(event.key));

			if(packet && typeof(packet) === "object") {
				Sibilant.Metrics.counter('links',linkId,'packets.receive').inc();
				peer.receive(linkId,packet);
			}
		}
	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	peer.on("send",this.send,this);
	peer.on("beforeShutdown",function() {
		self.cleanKeys();
		window.removeEventListener('storage',receiveStorageEvent);
	},this);
	

	// METRICS
	Sibilant.Metrics.gauge('links',linkId,"buffer").set(function() {
		var	stats= {
					used: 0,
					max: 5 *1024 * 1024,
					keyUsage: {	}
		};
		for(var i=0; i < localStorage.length;++i) {
			var k=localStorage.key(i);
			var v=localStorage.getItem(k);
		
			stats.keyUsage[k]=v.length*2;
			stats.used+=v.length*2;
		}
			
		return stats;
	});
		
	Sibilant.Metrics.gauge('links',linkId,"queueLength").set(function() {
		return JSON.parse(localStorage.getItem('intercom') || "[]").length;
	});
};