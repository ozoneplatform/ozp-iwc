describe("OWF 7 backed Key-value store",function() {
	var kvStorage;
	var mockKvStore={
		data: {}
	};
	
	beforeEach(function() {	
		kvStorage=new ozpIwc.owf7Backend.DataApiOwf7Storage();
	});
	
	afterEach(function() {
		kvStorage=null;
		mockKvStore={
			data: {
				foo: "bar"
			}
		};
	});
	
	it("Saves the state",function(done) {
		kvStorage.save(mockKvStore)
			.success(function() { done();})
			.failure(function() { expect("failed").toEqual("should have saved the state");});
	});
	
	it("Loads the state",function(done) {
		kvStorage.save(mockKvStore)
			.failure(function() { 
				expect("failed").toEqual("should have saved the state"); done();
			})
			.success(function() { 
				var resultKvStore={ data: null };
				kvStorage.load(resultKvStore)
					.success(function(data) { 
						expect(data).toEqual(mockKvStore);
						done();
					})
					.failure(function() { 
						expect("failed").toEqual("should have loaded the state");
						done();
					});
			});
		
	});
});