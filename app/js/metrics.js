var Sibilant=Sibilant || {};


(function() {
	Sibilant.metrics={};
	
	Sibilant.metrics.Counter=function() {
		var value=0;
		this.get=function() { 
			return value; 
		};
		this.inc=function(v) { 
			value+=(v?v:1);
		};
		this.dec=function(v) { 
			value-=(v?v:1);
		};
	};

	Sibilant.metrics.Meter=function() {
		var value=0;
		this.set=function(v) { value=v; return this;};
		this.get=function() { return value; };
	};
	
	Sibilant.metrics.Gauge=function(metricsCallback) {
		var callback=metricsCallback;
		this.set=function(metricsCallback) { 
			callback=metricsCallback; 
			return this;
		};
		this.get=function() { return callback(); };
	};
	
	Sibilant.metrics.Registry=function() {
		this.metrics={};
		
		this.findOrCreateMetric=function(name,type) {
			var m= this.metrics[name] = this.metrics[name] || new type();
			if(m instanceof type){
					return m;
			} else {
					return null;
			}			
		};

		var makeName=function(args) {
			return Array.prototype.slice.call(args).join(".");
		}

		this.counter=function() {
			return this.findOrCreateMetric(makeName(arguments),Sibilant.metrics.Counter);
		};

		this.meter=function(path) {
			return this.findOrCreateMetric(makeName(arguments),Sibilant.metrics.Meter);
		};
		
		this.gauge=function(path) {
			return this.findOrCreateMetric(makeName(arguments),Sibilant.metrics.Gauge);
		}
		this.toJson=function() {
			var rv={};
			for(k in this.metrics) {
				var path=k.split(".");
				var pos=rv;
				while(path.length > 1) {
					var current=path.shift();
					pos = pos[current]=pos[current] || {};
				}
				pos[path[0]]=this.metrics[k].get();
			}
			return rv;
		};
	};
	
	Sibilant.Metrics=new Sibilant.metrics.Registry();
})();