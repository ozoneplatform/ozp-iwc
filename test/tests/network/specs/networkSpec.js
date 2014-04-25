
var peerWin=window.open("networkPinger.html","pinger","height=500,width=500");
window.addEventListener("beforeunload", function() {
	peerWin.close();
});

describe("Peer broadcast",function() {
	var receiveHandler;
	var peer=sibilant.defaultPeer;
	
	beforeEach(function() {	
	});
	
	afterEach(function() {
		peer.off("receive",receiveHandler);
	});
	
	it("receives the tick from the ping listener", function(done) {
		receiveHandler=function(event) {
			expect(event.packet.data).toBeDefined();
			expect(event.packet.data.tick).toBeDefined();
			done();
		};
		peer.on("receive",receiveHandler);
	});
	
	it("can send and recieve from the echo listener",function(done) {
		receiveHandler=function(event) {
			expect(event.packet.src_peer).not.toEqual(peer.selfId);
			if(event.packet.data.marco) {
				expect(event.packet.data.marco).toEqual("polo");
				done();
			}
		};
		peer.on("receive",receiveHandler);
		peer.send({marco:"polo"});
	});
		
});