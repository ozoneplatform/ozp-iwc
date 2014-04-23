describe("LocalStorageLink",function() {
	var link;
	var event;
	var clockOffset;
	
	var tick=function(t) { 
		clockOffset+=t;
		jasmine.clock().tick(t);
	};
	
	// mock out the now function to let us fast forward time
	sibilant.util.now=function() {
		return new Date().getTime() + clockOffset;
	};

	var makeLink=function(conf) {
		conf.peer.receive=conf.peer.receive || function(linkId,packet) {};
		
		var link=new sibilant.LocalStorageLink(conf);
		
		return link;
	};
	
	beforeEach(function() {
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();
		clockOffset=0;
		localStorage.clear();
		
		event=new sibilant.Event();
		link=makeLink({
			peer: event,
			selfId: "peer"
		});
	});
	
	afterEach(function() {
		jasmine.clock().uninstall();
		event=link=null;
	});
	
	it("writes to localStorage",function() {
		link.send("foo");
		expect(localStorage.length).toEqual(1);
	});

	it("cleans up own keys",function() {
		link.send("foo");
		expect(localStorage.length).toEqual(1);

		tick(link.myKeysTimeout+5);
		link.cleanKeys();
		expect(localStorage.length).toEqual(0);
	});
	
	
	it("cleans up own keys after set time",function() {
		link.send("foo");
		
		tick(link.myKeysTimeout-5);
		expect(localStorage.length).toEqual(1);
		
		tick(6);
		expect(localStorage.length).toEqual(0);
	});
	
	it("cleans other links' keys after otherKeysTimeout",function() {
		var link2=makeLink({
			peer: event,
			selfId: "peer2",
			myKeysTimeout: link.myKeysTimeout*100,
			otherKeysTimeout: link.otherKeysTimeout*100
		});

		link.send("foo");
		link2.send("foo");
		expect(localStorage.length).toEqual(2);

		tick(link.myKeysTimeout+5);
		link.cleanKeys();
		expect(localStorage.length).toEqual(1);
		
		tick(link.otherKeysTimeout);
		link.cleanKeys();
		expect(localStorage.length).toEqual(0);
		
	});
		
});