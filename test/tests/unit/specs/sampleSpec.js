describe("Sample Interface",function() {
	var sampleClasses=[
		["Sample",sibilant.metricsStats.Sample],
		["Uniform Sample",sibilant.metricsStats.UniformSample],
		["Exponentially Decaying Sample",sibilant.metricsStats.ExponentiallyDecayingSample]
	];
	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
	});

	for(var sampleClassI=0;sampleClassI < sampleClasses.length;sampleClassI++) {
		var Sample=sampleClasses[sampleClassI][1];
		var sampleClassName=sampleClasses[sampleClassI][0];
		describe(sampleClassName,function() {
			var sample;
	
			beforeEach(function() {
				sample=new Sample();
			});

			afterEach(function() {
				sample=null;
			});
			
			it("is empty when created",function() {
				expect(sample.size()).toEqual(0);
				expect(sample.getValues()).toEqual([]);
			});
			
			it("adds values on update",function() {
				sample.update(3);
				sample.update(1);
				sample.update(4);
				expect(sample.size()).toEqual(3);
				expect(sample.getValues()).toContainAll([3,1,4]);
			});
			
			it("rests on a call to clear",function() {
				sample.update(3);
				sample.update(1);
				sample.update(4);
				expect(sample.size()).toEqual(3);
				expect(sample.getValues()).toContainAll([3,1,4]);

				sample.clear();
				expect(sample.size()).toEqual(0);
				expect(sample.getValues()).toEqual([]);
			});			
			
			
		});
	}// loop over all sample classes
	
});


