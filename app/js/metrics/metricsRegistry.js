var sibilant=sibilant || {};
/**
 * @class
 * A repository of metrics
 */
sibilant.MetricsRegistry=function() {
	this.metrics={};
};

/**
 * 
 * @private
 * @param {string} name - Name of the metric
 * @param {function} type - The constructor of the requested type for this metric.
 * @returns {MetricType} - Null if the metric already exists of a different type.  Otherwise a reference to the metric.
 */
sibilant.MetricsRegistry.prototype.findOrCreateMetric=function(name,type) {
	var m= this.metrics[name] = this.metrics[name] || new type();
	if(m instanceof type){
			return m;
	} else {
			return null;
	}			
};

/**
 * Joins the arguments together into a name.
 * @private
 * @param {string[]} args - Array or the argument-like "arguments" value.
 * @returns {string}
 */
sibilant.MetricsRegistry.prototype.makeName=function(args) {
	// slice is necessary because "arguments" isn't a real array, and it's what
	// is usually passed in, here.
	return Array.prototype.slice.call(args).join(".");
};

/**
 * @param {...string} name - components of the name
 * @returns {sibilant.metricTypes.Counter}
 */
sibilant.MetricsRegistry.prototype.counter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),sibilant.metricTypes.Counter);
};

/**
 * @param {...string} name - components of the name
 * @returns {sibilant.metricTypes.Meter}
 */
sibilant.MetricsRegistry.prototype.meter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),sibilant.metricTypes.Meter);
};

/**
 * @param {...string} name - components of the name
 * @returns {sibilant.metricTypes.Gauge}
 */
sibilant.MetricsRegistry.prototype.gauge=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),sibilant.metricTypes.Gauge);
};
/**
 * 
 * @returns {unresolved}
 */
sibilant.MetricsRegistry.prototype.toJson=function() {
	var rv={};
	for(var k in this.metrics) {
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

	
sibilant.metrics=new sibilant.MetricsRegistry();
