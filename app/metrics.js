var Sibilant=Sibilant || {};


(function() {
	var Counter=function() {
		var value=0;
		this.set=function(v) { 
			value=v; 
		};
		this.get=function() { 
			return value; 
		};
		this.inc=function(v) { 
			value+=(v?v:1);
		};
	};

	var Meter=function() {
		var value=0;
		this.set=function(v) { this.value=v; };
		this.get=function() { return this.value; };
	};
	
	var External=function(callback) {
		var callback=callback;
		this.get=function() { return callback(); };
	};
	
	var Node=function(fullname,metric) {
		this.fullname=fullname;
		this.name=fullname.substr(fullname.lastIndexOf(".")+1);
		this.metric=metric;
		this.children={};
		
		this.child=function(name) {
			if(!this.children.hasOwnProperty(name)) {
				this.children[name]=new Node(this.name+"."+name);
			}
			return this.children[name];
		};
		var isEmptyObject= function ( obj ) {
			for ( var name in obj ) 
				return false;
			return true;
		};
		
		this.toJson=function(){
			if(!isEmptyObject(this.children)) {
				var rv={};
				if(metric) {
					rv['$value']=metric.get();
				}
				for(var k in this.children) {
					var child=this.children[k];
					rv[child.name]=child.toJson();
				};
				return rv;
			} else {
				return this.metric?this.metric.get():null;
			}
		};
		
	};
	
	Sibilant.MetricRegistry=function() {
		this.data=new Node("root");

		var self=this;
		findOrCreateMetric=function(path,initializer) {
			var pos=self.data;
			for(var i=0; i < path.length; ++i) {
				pos=pos.child(path[i]);
			}
			if(!pos.metric) {
				pos.metric=initializer();
			}
			return pos.metric; 
		};

		this.counter=function(path) {
			return findOrCreateMetric(path,function() { return new Counter();});
		};

		this.meter=function(path) {
			return findOrCreateMetric(path,function() { return new Meter();});
		};
		
		this.external=function(path,callback) {
			return findOrCreateMetric(path,function() { return new External(callback);});
		};
		
		this.toJson=function() {
			return this.data.toJson();
		};
	};
	
	Sibilant.Metrics=new Sibilant.MetricRegistry();
})();