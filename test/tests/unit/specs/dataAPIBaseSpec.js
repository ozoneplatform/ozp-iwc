describe("Data API Base class",function() {

	var router;
	var dataApi;
	var participant;
	
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		router=new sibilant.Router({peer:new FakePeer()});
		
		dataApi=new sibilant.DataApiBase({
			'name': 'testData',
			'router': router
		});
		
		participant=new TestParticipant({'router':router});
		
		participant.sendDataApi=function(action,path,entity,callback) {
			if(typeof(entity) === 'function') {
				callback=entity;
				entity={};
			}
			
			participant.send({
				'dst' : "testData.api",
				'action' : action,
				'resource' : path,
				'entity': entity
			},callback);
		};
	});
	
	afterEach(function() {
		dataApi=null;
		router=null;
	});

	describe("operation as Leader", function() {
		beforeEach(function() {
			dataApi.leaderState="Leader";
		});
		
		it("responds to a get", function() {
			var called=0;
			participant.sendDataApi("get","/node",function(value) {
				called++;
				expect(value).toBeDefined();
				expect(value.src).toEqual("testData.api");
			});
			
			expect(called).toEqual(1);
			
		});
		
		it("gets and puts data", function() {
			var called=0;
			participant.sendDataApi("set","/node",{foo:1});

			participant.sendDataApi("get","/node",function(value) {
				expect(value.entity).toBeDefined();
				expect(value.entity).toEqual({foo:1});
				called++;
			});
			expect(called).toEqual(1);
		});
		
		it("deletes data", function() {
			participant.sendDataApi("set","/node",{foo:1});
			participant.sendDataApi("delete","/node");

			participant.sendDataApi("get","/node",function(value) {
				expect(value.entity).toBeUndefined();
			});
		});
		
	});	
	
	describe("watch data",function() {
		beforeEach(function() {
			dataApi.leaderState="Leader";
			participant.sendDataApi("set","/node",{foo:1});
		});
		
		it("sends message on data set",function() {
			var called=0;
			participant.sendDataAPI("watch","/node",function() {
				called++;
			});
			
			participant.sendDataApi("set","/node",{foo:2});
			participant.sendDataApi("set","/node",{foo:3});
			participant.sendDataApi("set","/node",{foo:4});
			
			expect(called).toEqual(3);
		});
	});
	
});