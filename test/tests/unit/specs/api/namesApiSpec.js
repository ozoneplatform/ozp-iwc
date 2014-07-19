describe("Names API",function() {

	var namesApi;
	var node;
	beforeEach(function() {	
		jasmine.addMatchers(customMatchers);
		jasmine.clock().install();

		namesApi=new ozpIwc.NamesApi({
			'participant': new TestParticipant()
		});
        
        node=namesApi.findOrMakeValue({
            'resource': "/address/testAddress",
            'contentType' : "ozp-address-object-v1+json",
            'version' : 1
        });
	});
	
	afterEach(function() {
		namesApi=null;
        node=null;
	});
    
    it("sets an address",function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'resource': "/address/testAddress",
                'entity' : {'pType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });
		
        namesApi.handleSet(node,packetContext);

        var reply=packetContext.responses[0];
        expect(reply.action).toEqual("ok");

        // check that the participant info was added.
        expect(namesApi.data[packetContext.packet.resource].entity).toEqual( {'testAddress': {'pType':"testType", 'address': "testAddress", 'name': "testName" }});
    });
        
});