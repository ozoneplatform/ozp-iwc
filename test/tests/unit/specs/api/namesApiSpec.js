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

    it("sets a participant address",function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(node,packetContext);

        var reply=packetContext.responses[0];
        expect(reply.action).toEqual("ok");

        // check that the participant info was added.
        expect(namesApi.data[node.resource].entity).toEqual(packetContext.packet.entity);

        node=namesApi.findOrMakeValue({
            'resource': "/address",
            'contentType' : "ozp-address-collection-v1+json",
            'version' : 1
        });

        packetContext=new TestPacketContext({
            'packet': {
                'contentType' : "ozp-address-collection-v1+json",
                'version' : 1
            }
        });

        namesApi.handleGet(node,packetContext);
        expect(namesApi.data[node.resource].entity).toEqual( ['testAddress']);
    });

    it("generates changes for added address",function() {

        node=namesApi.findOrMakeValue({
            'resource': "/address/testAddress",
            'contentType' : "ozp-address-object-v1+json",
            'version' : 2
        });
        node.watch({'src': "watcher",'msgId': 1234});
        var packetContext=new TestPacketContext({
            'packet': {
                'resource': "/address/testAddress",
                'action': "set",
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType': "ozp-address-object-v1+json"
            },
            'leaderState': "leader"
        });
        namesApi.routePacket(packetContext);

        expect(namesApi.participant.sentPackets.length).toEqual(1);
        var changePacket=namesApi.participant.sentPackets[0];
        expect(changePacket.action).toEqual("changed");
        expect(changePacket.entity.newValue).toEqual(packetContext.packet.entity);
    });

    it("deletes resource /address/${id} and removes the corresponding entry from resource /address",function() {

        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(node,packetContext);
        expect(namesApi.data['/address'].entity.length).toEqual(1);
        namesApi.handleDelete(node,packetContext);
        expect(namesApi.data['/address'].entity.length).toEqual(0);
    });

    it("sets the same /address/${id} resource twice and ensures there is only one entry for it in resource /address",function() {

        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(node,packetContext);
        namesApi.handleSet(node,packetContext);
        expect(namesApi.data['/address'].entity.length).toEqual(1);
    });

});