var sibilant=sibilant || {};
sibilant.metricTypes=sibilant.metricTypes || {};

/**
 * @typedef {object} sibilant.MetricType 
 * @property {function} get - returns the current value of the metric
 */

sibilant.metricTypes.BaseMetric=function() {
	this.value=0;
};

sibilant.metricTypes.BaseMetric.prototype.get=function() { 
	return this.value; 
};


/**
 * @class
 * @extends sibilant.MetricType
 * A counter running total that can be adjusted up or down.
 * Where a meter is set to a known value at each update, a
 * counter is incremented up or down by a known change.
 */
sibilant.metricTypes.Counter=sibilant.util.extend(sibilant.metricTypes.BaseMetric,function() {
	sibilant.metricTypes.BaseMetric.apply(this,arguments);
	this.value=0;
});

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
