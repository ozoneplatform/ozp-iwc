

var peerWin=window.open("networkPinger.html","pinger","height=500,width=500");
window.addEventListener("beforeunload", function() {
	peerWin.close();
});

describe("Peer broadcast",function() {
	var receiveHandler;

	beforeEach(function() {	});
	
	afterEach(function() {
		Sibilant.peer.off("receive",receiveHandler);
	});
	
	it("receives the tick from the ping listener", function(done) {
		receiveHandler=function(packet) {
			expect(packet.data).toBeDefined();
			expect(packet.data.tick).toBeDefined();
			done();
		};
		Sibilant.peer.on("receive",receiveHandler);
	});
	
	it("can send and recieve from the echo listener",function(done) {
		receiveHandler=function(packet) {
			expect(packet.src_peer).not.toEqual(Sibilant.peer.selfId());
			if(packet.data.marco) {
				expect(packet.data.marco).toEqual("polo");
				done();
			}
		};
		Sibilant.peer.on("receive",receiveHandler);
		Sibilant.peer.send({marco:"polo"});
	});
	
});