describe("Data Tree",function() {
	
	var dataTree;
	
	beforeEach(function() {	
		dataTree=new sibilant.DataTree();
	});
	
	afterEach(function() {
		dataApi=null;
	});

	describe("has CRUD operations" , function() {
		it("gets and sets a value", function() {
			dataTree.set("/node",{foo:"bar"});
			expect(dataTree.get("/node")).toEqual({foo:"bar"});
		});

		it("modifies a value",function() {
			dataTree.set("/node",{foo:"bar"});
			expect(dataTree.get("/node")).toEqual({foo:"bar"});

			dataTree.set("/node",{foo:"baz"});
			expect(dataTree.get("/node")).toEqual({foo:"baz"});
		});

		it("deletes a value",function() {
			dataTree.set("/node",{foo:"bar"});
			expect(dataTree.get("/node")).toEqual({foo:"bar"});

			dataTree.delete("/node");
			expect(dataTree.get("/node")).toEqual(undefined);
		});
	});
	
	describe("fires events on set",function() {
		it("before setting",function() {
			var called=0;
			dataTree.on("preSet",function(e) {
				called++;
			});
			
			dataTree.set("/node",{foo:1});
			expect(called).toEqual(1);			
			expect(dataTree.get("/node")).toEqual({foo:1});
		});
		
		it("overrides setting with a preSet event",function() {
			dataTree.on("preSet",function(e) {
				e.cancel();
			});
			dataTree.set("/node",{foo:1});
			expect(dataTree.get("/node")).toBeUndefined();
		});

		it("overrides setting with a preSet event, leaving previous value",function() {
			dataTree.set("/node",{foo:5});
			dataTree.on("preSet",function(e) {
				e.cancel();
			});
			dataTree.set("/node",{foo:1});
			expect(dataTree.get("/node")).toEqual({foo:5});
		});
		
		it("has the path,newValue, and oldValue in the preSet event",function() {
			dataTree.set("/node",{foo:1});
			dataTree.on("preSet",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.oldValue).toEqual({foo:1});
				expect(e.newValue).toEqual({foo:2});
			});
			dataTree.set("/node",{foo:2});
		});
		
		it("after setting",function() {
			var called=0;
			dataTree.on("set",function(e) {
				called++;
			});
			
			dataTree.set("/node",{foo:1});

			expect(called).toEqual(1);			
			expect(dataTree.get("/node")).toEqual({foo:1});
		});
		
		it("has a non-cancelable set event",function() {
			dataTree.on("set",function(e) {
				expect(e.cancel).toBeUndefined();
			});
			dataTree.set("/node",{foo:1});
		});
		
		it("has the path,newValue, and oldValue in the set event",function() {
			dataTree.set("/node",{foo:1});
			dataTree.on("set",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.oldValue).toEqual({foo:1});
				expect(e.newValue).toEqual({foo:2});
			});
			dataTree.set("/node",{foo:2});
		});		
	});
	
	
	describe("fires events on get",function() {
		
		beforeEach(function() {
			dataTree.set("/node",{foo:1});
		});
		
		it("has a preGet event",function() {
			var called=0;
			dataTree.on("preGet",function(e) {
				called++;
			});
			dataTree.get("/node");
			expect(called).toEqual(1);			
		});
		
		it("has path and value in the preGet event",function() {
			dataTree.on("preGet",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.value).toEqual({foo:1});
			});
			dataTree.get("/node");	
		});
		
		it("has a cancelable preGet event",function() {
			dataTree.on("preGet",function(e) {
				e.cancel();
			});
			expect(dataTree.get("/node")).toBeUndefined();	
		});
	});
	
	describe("fires events on delete",function() {
		
		beforeEach(function() {
			dataTree.set("/node",{foo:1});
		});
		
		it("has a preGet event",function() {
			var called=0;
			dataTree.on("preDelete",function(e) {
				called++;
			});
			dataTree.delete("/node");
			expect(called).toEqual(1);			
		});
		
		it("has path and value in the preDelete event",function() {
			dataTree.on("preDelete",function(e) {
				expect(e.path).toEqual("/node");
				expect(e.value).toEqual({foo:1});
			});
			dataTree.delete("/node");	
		});
		
		it("has a cancelable preDelete event",function() {
			dataTree.on("preDelete",function(e) {
				e.cancel();
			});
			dataTree.delete("/node");	

			expect(dataTree.get("/node")).toEqual({foo:1});	
		});
	});
	
	it("has a default value setter",function() {
		dataTree.defaultData=function() {
			return { foo: 1};
		};
		
		expect(dataTree.get("/node")).toEqual({foo:1});
		expect(dataTree.get("/node2")).toEqual({foo:1});
	});
});
