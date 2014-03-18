


describe("Peer broadcast",function() {
	var client;
	var pinger;
	beforeEach(function(done) {	
		client=new Sibilant.Client({peerUrl:"http://localhost:13000"});
		client.on("connected",function() {
			pinger=window.open("//localhost:14001/transportPinger.html?toAddress=" + client.participantId,"pinger","height=500,width=500");
			done();
//			pinger.addEventListener("load",done);
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
		expect(client.participantId).not.toBe("$nobody");
	});
	
	it("hears the ping",function(done) {
		client.on("receive",function(msg) {
			expect(msg.entity.tick).toBeDefined();
			done();
		});
	});
	
	
});