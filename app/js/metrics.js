var sibilant=sibilant || {};
sibilant.metricTypes=sibilant.metricTypes || {};

/**
 * @typedef {object} sibilant.MetricType 
 * @property {function} get - returns the current value of the metric
 */

/**
 * @class
 * @extends sibilant.MetricType
 * A counter running total that can be adjusted up or down.
 * Where a meter is set to a known value at each update, a
 * counter is incremented up or down by a known change.
 */
sibilant.metricTypes.Counter=function() {
	this.value=0;
};

/**
 * @returns {Number} Current value of the counter
 */
sibilant.metricTypes.Counter.prototype.get=function() { 
	return this.value; 
};

/**
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
sibilant.metricTypes.Counter.prototype.inc=function(delta) { 
	return this.value+=(delta?delta:1);
};

/**
 * @param {Number} [delta=1] - Decrement by this value
 * @returns {Number} - Value of the counter after decrement
 */
sibilant.metricTypes.Counter.prototype.dec=function(delta) { 
	return this.value-=(delta?delta:1);
};

/**
 * @class 
 * @extends sibilant.MetricType
 * A meter a value of a number as a point in time.  Where a counter
 * is incremented up or down, a meter is set to a known value at
 * each update.
 */
sibilant.metricTypes.Meter=function() {
	this.value=0;
	};
/**
 * @param {Number} value - The value to set the meter to
 * @returns {sibilant.metricTypes.Meter} this object
 */
sibilant.metricTypes.Meter.prototype.set=function(value) { 
	this.value=value; 
	return this;
};

/**
 * @returns {Number} the current value of the Meter
 */
sibilant.metricTypes.Meter.prototype.get=function() { 
	return this.value; 
};

/**
 * @callback sibilant.metricTypes.Gauge~gaugeCallback
 * @returns {sibilant.metricTypes.MetricsTree} 
 */

/**
 * @class
 * @extends sibilant.MetricType
 * A gauge is an externally defined set of metrics returned by a callback function
 * @param {sibilant.metricTypes.Gauge~gaugeCallback} metricsCallback
 */
sibilant.metricTypes.Gauge=function(metricsCallback) {
	this.callback=metricsCallback;
};
/**
 * Set the metrics callback for this gauge.
 * @param {sibilant.metricTypes.Gauge~gaugeCallback} metricsCallback
 * @returns {sibilant.metricTypes.Gauge} this
 */
sibilant.metricTypes.Gauge.prototype.set=function(metricsCallback) { 
	callback=metricsCallback; 
	return this;
};
/**
 * Executes the callback and returns a metrics tree.
 * @returns {sibilant.metricTypes.MetricsTree}
 */
sibilant.metricTypes.Gauge.prototype.get=function() { 
	return callback(); 
};

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
