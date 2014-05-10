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
