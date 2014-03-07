	
var Sibilant=Sibilant || {};
(function() {
	var linkId='localStorage';
	var prefix='Sibilant';
	var selfId=Sibilant.peer.selfId();

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

	
	Sibilant.links = Sibilant.links || {};
	Sibilant.links.localStorageLink={
		myKeysTimeout:50000, // 5 seconds
		otherKeysTimeout:2*60000, // 2 minutes
		receiveStorageEvent: function(event) {
			var key=splitKey(event.key);
			if(key) {
				var packet=JSON.parse(localStorage.getItem(event.key));

				if(packet && typeof(packet) === "object") {
					Sibilant.Metrics.counter('links',linkId,'packets.receive').inc();
					Sibilant.peer.receive(linkId,packet);
				}
			}
		},
	 cleanKeys: function() {
			var now=new Date().getTime();

			for(var i=0; i < localStorage.length;++i) {
				var keyName=localStorage.key(i);
				var k=splitKey(keyName);
				if(k) {
					var keyAge=now-k.createdAt;
					if((k.id===selfId && keyAge > Sibilant.links.localStorageLink.myKeysTimeout) 
							|| (keyAge > Sibilant.links.localStorageLink.otherKeysTimeout)) {
						localStorage.removeItem(keyName);
					}				
				}
			};
		},
		send: function(packet) { 
			localStorage.setItem(makeKey(),JSON.stringify(packet));
			Sibilant.Metrics.counter('links',linkId,'packets.sent').inc();
			
			// clean up in a while
			window.setTimeout(Sibilant.links.localStorageLink.cleanKeys,Sibilant.links.localStorageLink.myKeysTimeout);
		},
		shutdown: function() {
			Sibilant.links.localStorageLink.cleanKeys();
		}
	};
	

	window.addEventListener('storage',Sibilant.links.localStorageLink.receiveStorageEvent , false); 
	
	

	// Clean up now and every two minutes, just to minimize the trash
	Sibilant.links.localStorageLink.cleanKeys();
	window.setInterval(Sibilant.links.localStorageLink.cleanKeys,
									   Sibilant.links.localStorageLink.otherKeysTimeout); // clean up every two minutes

	
	// TODO:  Should this autoregister or require manual registration?
	Sibilant.peer.addLink(linkId,Sibilant.links.localStorageLink);
		
		
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
})();