describe("Basic authorization",function() {
	var auth;
	
	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
		
		auth=new ozpIwc.BasicAuthorization();
	});
	
	afterEach(function() {
		auth=null;
	});
	
	it("grants no permissions by default",function() {
		var resolved=false;
		auth.isPermitted("foo",["perm1"])
			.success(function() {	expect("check with no permissions assigned").toEqual("failure");})
			.failure(function() {	resolved=true;});
		
		expect(resolved).toEqual(true);		
	});
	
	it("grants permissions",function() {
		var resolved=false;
		auth.grant("foo",["perm1"]);
		
		expect(auth.roles['foo'][0]).toEqual("perm1");
	});
	
	it("finds expected roles",function() {
	  expect(auth.hasRole("foo")).toEqual(false);
	  auth.grant("foo",["perm1"]);
	  expect(auth.hasRole("foo")).toEqual(true);
	});
	
	it("allows access after granting permissions",function() {
		var resolved=false;
		auth.grant("foo",["perm1"]);
		
		expect(auth.roles['foo'][0]).toEqual("perm1");
		
		auth.isPermitted("foo","perm1")
			.success(function() {	resolved=true;	})
			.failure(function() {	expect("check for granted permission").toEqual("success");});
		
		expect(resolved).toEqual(true);
	});
	
	it("allows access after granting multiple permissions",function() {
		var resolved=false;
		auth.grant("foo",["perm1","perm2"]);
		
		auth.isPermitted("foo","perm1")
			.success(function() {	resolved=true;	})
			.failure(function() {	expect("check for perm1 in [perm1,perm2]").toEqual("success");});
		
		expect(resolved).toEqual(true);
	});
	
	it("denies access after granting unrelated permissions",function() {
		var resolved=false;
		auth.grant("foo",["perm3","perm2"]);
		
		auth.isPermitted("foo","perm1")
			.success(function() {	expect("check for ungranted permission").toEqual("failure");})
			.failure(function() {	resolved=true;	});
		
		expect(resolved).toEqual(true);
	});
	
	it("checks all of multiple permissions",function() {
		var resolved=false;
		auth.grant("foo",["perm3","perm2"]);
		
		auth.isPermitted("foo",["perm2","perm3"])
			.success(function() {	resolved=true;	})
			.failure(function() {	expect("multiple permission checks").toEqual("success");});
		
		expect(resolved).toEqual(true);
	});
	
	it("with multiple roles, allows if the first of them has permission",function() {
		auth.grant("foo",["red1","red2"]);
		auth.grant("bar",["blue1","blue2"]);
		
		auth.isPermitted(["foo","bar"],["red1"])
			.failure(function() {	expect("multiple role checks").toEqual("success");});
	});
	
	it("with multiple roles, allows if any one of them has permission",function() {
		auth.grant("foo",["red1","red2"]);
		auth.grant("bar",["blue1","blue2"]);
		
		auth.isPermitted(["foo","bar"],["blue1"])
			.failure(function() {	expect("multiple role checks").toEqual("success");});
	});	
	
	it("with multiple roles, denies none of them has permission",function() {
		auth.grant("foo",["red1","red2"]);
		auth.grant("bar",["blue1","blue2"]);
		
		auth.isPermitted(["foo","bar"],["blue3"])
			.success(function() {	expect("multiple role checks").toEqual("success");});
	});	
});