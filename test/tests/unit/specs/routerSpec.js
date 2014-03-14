
describe("Router",function() {
//	
//	var sendCount;
//	var receiveCount;
//	var router;
//	
//	beforeEach(function() {	
//		sendCount=receiveCount=0;
//		router=new Sibilant.impl.Router();
//		router.on("send",function(packet) {sendCount++;});
//		router.on("receive",function(packet) {receiveCount++;});
//		
//	});
//	
//	afterEach(function() {
//		router=null;
//	});
//	
//	it("sends a packet to handlers",function() {
//		router.on("send",function(packet) {
//			expect(packet.data).toEqual("foo");
//		});
//		
//		router.send("foo");
//		expect(sendCount).toEqual(1);
//	});
//	
//	it("notifies handlers on receive",function() {
//		router.on("receive",function(packet) {
//			expect(packet.data).toEqual("foo");
//		});
//		
//		router.receive("testLinkId",{src_peer:"me",sequence:1,data: "foo"});
//		expect(receiveCount).toEqual(1);
//	});
//	
//	describe("deduplicates packets", function() {
//		it("receive ignores duplicate src_peer & sequence pairs",function() {
//			router.receive("testLinkId",{src_peer:"me",sequence:1,data: "foo"});
//			router.receive("testLinkId",{src_peer:"me",sequence:1,data: "foo"});
//			expect(receiveCount).toEqual(1);
//		});
//		it("receive ignores duplicate src_peer & sequence pairs from different links",function() {
//			router.receive("testLinkId",{src_peer:"me",sequence:1,data: "foo"});
//			router.receive("aDifferentLink",{src_peer:"me",sequence:1,data: "foo"});
//			expect(receiveCount).toEqual(1);
//		});
//		
//		it("does not ignore packets with the same sequence but different source",function() {
//			router.receive("testLinkId",{src_peer:"me",sequence:1,data: "foo"});
//			router.receive("testLinkId",{src_peer:"you",sequence:1,data: "foo"});
//			expect(receiveCount).toEqual(2);
//		});
//		
//		it("does not ignore packets with the same source but different sequence",function() {
//			router.receive("testLinkId",{src_peer:"me",sequence:1,data: "foo"});
//			router.receive("testLinkId",{src_peer:"me",sequence:2,data: "foo"});
//			expect(receiveCount).toEqual(2);
//		});
//	});
//	
//	describe("filtering",function() {
//		it("allows presend filtering",function() {
//			router.on("presend",function(packet) {
//				// only allow odd numbers for value
//				return (packet.data.value % 2 == 1)
//			});
//			for(var i=0;i<10;++i) {
//				router.send({value:i});
//			}
//			expect(sendCount).toEqual(5);
//		});
//	});

});
