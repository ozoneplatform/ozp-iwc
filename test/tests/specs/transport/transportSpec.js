


describe("Peer broadcast",function() {
	var client;
	var pinger;
	beforeEach(function(done) {	
		client=new Sibilant.Client("http://localhost:13000/js");
		client.on("connected",function() {
			pinger=window.open("networkPinger.html?toAddress=" + client.participantId,"pinger","height=200,width=200");
			done()
//			pinger.addEventListener("load",done);
		});
	});
	
	afterEach(function() {
		if(client) {
			client.disconnect();
			client=null;
		}
		if(pinger) {
//			pinger.close();
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