describe("Key Value Store",function() {
	
	var kvStore;
	
	beforeEach(function() {	
		kvStore=new ozpIwc.KeyValueStore();
	});
	
	afterEach(function() {
		dataApi=null;
	});

	describe("has CRUD operations" , function() {
		it("gets and sets a value", function() {
			kvStore.set("/node",{foo:"bar"});
			expect(kvStore.get("/node")).toEqual({foo:"bar"});
		});

		it("modifies a value",function() {
			kvStore.set("/node",{foo:"bar"});
			expect(kvStore.get("/node")).toEqual({foo:"bar"});

			kvStore.set("/node",{foo:"baz"});
			expect(kvStore.get("/node")).toEqual({foo:"baz"});
		});

		it("deletes a value",function() {
			kvStore.set("/node",{foo:"bar"});
			expect(kvStore.get("/node")).toEqual({foo:"bar"});

			kvStore.delete("/node");
			expect(kvStore.get("/node")).toEqual(undefined);
		});
	});
	
	describe("fires events on set",function() {
		it("before setting",function() {
			var called=0;
			kvStore.on("preSet",function(e) {
				called++;
			});
			
			kvStore.set("/node",{foo:1});
			expect(called).toEqual(1);			
			expect(kvStore.get("/node")).toEqual({foo:1});
		});
		
		it("overrides setting with a preSet event",function() {
			kvStore.on("preSet",function(e) {
				e.cancel();
			});
			kvStore.set("/node",{foo:1});
			expect(kvStore.get("/node")).toBeUndefined();
		});

		it("overrides setting with a preSet event, leaving previous value",function() {
			kvStore.set("/node",{foo:5});
			kvStore.on("preSet",function(e) {
				e.cancel();
			});
			kvStore.set("/node",{foo:1});
			expect(kvStore.get("/node")).toEqual({foo:5});
		});
		
		it("has the path,newValue, and oldValue in the preSet event",function() {
			kvStore.set("/node",{foo:1});
			kvStore.on("preSet",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.oldValue).toEqual({foo:1});
				expect(e.newValue).toEqual({foo:2});
			});
			kvStore.set("/node",{foo:2});
		});
		
		it("after setting",function() {
			var called=0;
			kvStore.on("set",function(e) {
				called++;
			});
			
			kvStore.set("/node",{foo:1});

			expect(called).toEqual(1);			
			expect(kvStore.get("/node")).toEqual({foo:1});
		});
		
		it("has a non-cancelable set event",function() {
			kvStore.on("set",function(e) {
				expect(e.cancel).toBeUndefined();
			});
			kvStore.set("/node",{foo:1});
		});
		
		it("has the path,newValue, and oldValue in the set event",function() {
			kvStore.set("/node",{foo:1});
			kvStore.on("set",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.oldValue).toEqual({foo:1});
				expect(e.newValue).toEqual({foo:2});
			});
			kvStore.set("/node",{foo:2});
		});		
	});
	
	
	describe("fires events on get",function() {
		
		beforeEach(function() {
			kvStore.set("/node",{foo:1});
		});
		
		it("has a preGet event",function() {
			var called=0;
			kvStore.on("preGet",function(e) {
				called++;
			});
			kvStore.get("/node");
			expect(called).toEqual(1);			
		});
		
		it("has path and value in the preGet event",function() {
			kvStore.on("preGet",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.value).toEqual({foo:1});
			});
			kvStore.get("/node");	
		});
		
		it("has a cancelable preGet event",function() {
			kvStore.on("preGet",function(e) {
				e.cancel();
			});
			expect(kvStore.get("/node")).toBeUndefined();	
		});
	});
	
	describe("fires events on delete",function() {
		
		beforeEach(function() {
			kvStore.set("/node",{foo:1});
		});
		
		it("has a preGet event",function() {
			var called=0;
			kvStore.on("preDelete",function(e) {
				called++;
			});
			kvStore.delete("/node");
			expect(called).toEqual(1);			
		});
		
		it("has path and value in the preDelete event",function() {
			kvStore.on("preDelete",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.value).toEqual({foo:1});
			});
			kvStore.delete("/node");	
		});
		
		it("has a cancelable preDelete event",function() {
			kvStore.on("preDelete",function(e) {
				e.cancel();
			});
			kvStore.delete("/node");	

			expect(kvStore.get("/node")).toEqual({foo:1});	
		});
	});
	
	it("has a default value setter",function() {
		kvStore.defaultData=function() {
			return { foo: 1};
		};
		
		expect(kvStore.get("/node")).toEqual({foo:1});
		expect(kvStore.get("/node2")).toEqual({foo:1});
	});
});
