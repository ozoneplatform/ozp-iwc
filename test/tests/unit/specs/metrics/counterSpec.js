describe("Metrics: Counter",function() {
	var metrics;
	
	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
		metrics=new sibilant.MetricsRegistry();
	});
	
	afterEach(function() {
		metrics=null;
	});
	
	
	it("starts at zero",function() {
		expect(metrics.counter("foo").get()).toEqual(0);
	});

	it("increments by one",function() {
		metrics.counter("foo").inc();
		expect(metrics.counter("foo").get()).toEqual(1);
	});

	it("increments by a count",function() {
		metrics.counter("foo").inc(5);
		expect(metrics.counter("foo").get()).toEqual(5);
	});

	it("increments multiple times",function() {
		metrics.counter("foo").inc(5);
		metrics.counter("foo").inc();
		metrics.counter("foo").inc(10);
		expect(metrics.counter("foo").get()).toEqual(16);
	});

	it("decrements by one",function() {
		metrics.counter("foo").dec();
		expect(metrics.counter("foo").get()).toEqual(-1);
	});

	it("decrements by a count",function() {
		metrics.counter("foo").dec(5);
		expect(metrics.counter("foo").get()).toEqual(-5);
	});

	it("decrements multiple times",function() {
		metrics.counter("foo").dec(5);
		metrics.counter("foo").dec();
		metrics.counter("foo").dec(10);
		expect(metrics.counter("foo").get()).toEqual(-16);
	});		
	
});