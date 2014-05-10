sibilant.metricTypes.Timer=sibilant.util.extend(sibilant.metricTypes.BaseMetric,function() {
	sibilant.metricTypes.BaseMetric.apply(this,arguments);
	this.meter=new sibilant.metricTypes.Meter();
	this.histogram=new sibilant.metricTypes.Histogram();
});

sibilant.metricTypes.Timer.prototype.mark=function(val,time) {
	this.meter.mark();
	this.histogram.mark(val,time);
};

sibilant.metricTypes.Timer.prototype.start=function() {
	var self=this;
	var startTime=sibilant.util.now();
	return function() {
		var endTime=sibilant.util.now();
		self.mark(endTime-startTime,endTime);
	};
};

sibilant.metricTypes.Timer.prototype.time=function(callback) {
	var startTime=sibilant.util.now();
	try {
		callback();
	} finally {
		var endTime=sibilant.util.now();
		this.mark(endTime-startTime,endTime);
	}
};

sibilant.metricTypes.Timer.prototype.get=function() {
	var val=this.histogram.get();
	var meterMetrics=this.meter.get();
	for(var k in meterMetrics) {
		val[k]=meterMetrics[k];
	}
	return val;
};