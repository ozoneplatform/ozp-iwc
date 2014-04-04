describe("Data API Base class",function() {
	
	var dataApi;
	
	beforeEach(function() {	
		dataApi=new sibilant.DataApiBase();
	});
	
	afterEach(function() {
		dataApi=null;
	});
		
	describe("handlers", function() {
		
		it("gets and puts data", function() {
			dataApi.handlePutAsLeader({resource: "/foo",entity: 5});
			var response=dataApi.handleGetAsLeader({resource: "/foo"});
			expect(response.entity).toBe(5);
		});

	});	
	
});