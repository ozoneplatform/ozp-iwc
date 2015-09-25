describe("Metrics: Histogram",function() {
	var histogram;
	var rangedTolerance=0.05;
	beforeEach(function() {
		histogram=new ozpIwc.metric.types.Histogram();
	});
	
	it("starts at zero",function() {
		expect(histogram.get().count).toEqual(0);
	});
	
	it("does proper percentiles on small sets",function() {
		for(var i=1; i <= 100; ++i) {
			histogram.mark(i);
		}
		var v=histogram.get();
		expect(v.percentile10).toBe(10);
		expect(v.percentile25).toBe(25);
		expect(v.median).toBe(50);
		expect(v.percentile75).toBe(75);
		expect(v.percentile90).toBe(90);
		expect(v.percentile95).toBe(95);
		expect(v.percentile99).toBe(99);
		expect(v.percentile999).toBe(99.9);
	});
	it("does proper percentiles on large sets",function() {
        var max = 10000;
        var min = 1;
		for(var i=min; i <= max*10; ++i) {
			histogram.mark(Math.random()*(max-min)+min);
		}
		var v=histogram.get();
        var range = max-min;
		expect(v.percentile10).toBeWithinRange(1000,range,rangedTolerance);
		expect(v.percentile25).toBeWithinRange(2500,range,rangedTolerance);
		expect(v.median).toBeWithinRange(5000,range,rangedTolerance);
		expect(v.percentile75).toBeWithinRange(7500,range,rangedTolerance);
		expect(v.percentile90).toBeWithinRange(9000,range,rangedTolerance);
		expect(v.percentile95).toBeWithinRange(9500,range,rangedTolerance);
		expect(v.percentile99).toBeWithinRange(9900,range,rangedTolerance);
		expect(v.percentile999).toBeWithinRange(9990,range,rangedTolerance);
	});
});