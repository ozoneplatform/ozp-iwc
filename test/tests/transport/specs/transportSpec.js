


describe("Peer broadcast",function() {
	var client;
	var pinger;
	beforeEach(function(done) {	
		// current version of jasmine breaks if done() is called multiple times
		// use the called flag to prevent this
		var called=false;
		
		client=new ozpIwc.Client({peerUrl:"http://localhost:13000"});
		client.on("connected",function() {
			if(!called) {
				pinger=window.open("//localhost:14001/transportPinger.html?toAddress=" + client.participantId,"pinger","height=500,width=500");
				done();
				called=true;
			}
		});
	});
	
	afterEach(function() {
		if(client) {
			client.disconnect();
			client=null;
		}
		if(pinger) {
			pinger.close();
		}
	});
	
	it("has a client id", function() {
		expect(client.address).not.toBe("$nobody");
	});
	
	it("hears the ping",function(done) {
		// current version of jasmine breaks if done() is called multiple times
		// use the called flag to prevent this
		var called=false;
		client.on("receive",function(msg) {
			if(msg.entity.tick && !called) {
				done();
				called=true;
			}
		});
	});
	
	
});