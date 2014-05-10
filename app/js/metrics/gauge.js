
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
