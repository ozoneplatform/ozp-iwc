describe("Basic authorization",function() {
	var auth;
	
	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
		
		auth=new ozpIwc.BasicAuthorization({
            policies: []
        });
	});
	
	afterEach(function() {
		auth=null;
	});

});