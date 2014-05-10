/**
 * @class
 * @extends sibilant.BaseMetric
 */
sibilant.metricTypes.Meter=sibilant.util.extend(sibilant.metricTypes.BaseMetric,function() {
	sibilant.metricTypes.BaseMetric.apply(this,arguments);
	this.m1Rate= new sibilant.metricsStats.ExponentiallyWeightedMovingAverage(sibilant.metricsStats.M1_ALPHA);
	this.m5Rate= new sibilant.metricsStats.ExponentiallyWeightedMovingAverage(sibilant.metricsStats.M5_ALPHA);
	this.m15Rate= new sibilant.metricsStats.ExponentiallyWeightedMovingAverage(sibilant.metricsStats.M15_ALPHA);
	this.startTime=sibilant.util.now();
	this.value=0;
});

/**
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
sibilant.metricTypes.Meter.prototype.mark=function(delta) { 
	delta=delta || 1;
	this.value+=delta;
	this.m1Rate.update(delta);
	this.m5Rate.update(delta);
	this.m15Rate.update(delta);
	
	return this.value;
};

sibilant.metricTypes.Meter.prototype.get=function() { 
	return {
		'rate_1m' : this.m1Rate.rate(),
		'rate_5m' : this.m5Rate.rate(),
		'rate_15m' : this.m15Rate.rate(),
		'rate_mean' : this.value / (sibilant.util.now() - this.startTime) * 1000,
		'count' : this.value
	};
};

