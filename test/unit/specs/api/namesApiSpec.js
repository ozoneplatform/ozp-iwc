describe("Names API",function() {

	var namesApi;
	var addressNode;
    var multicastNode1;
    var multicastNode2;
	beforeEach(function() {
		namesApi=new ozpIwc.NamesApi({
			'participant': new TestParticipant()
		});

        addressNode=namesApi.findOrMakeValue({
            'resource': "/address/testAddress",
            'contentType' : "ozp-address-object-v1+json",
            'version' : 1
        });

        multicastNode1=namesApi.findOrMakeValue({
            'resource': "/multicast/testGroup1",
            'contentType' : "ozp-address-object-v1+json",
            'version' : 1
        });

        multicastNode2=namesApi.findOrMakeValue({
            'resource': "/multicast/testGroup2",
            'contentType' : "ozp-address-object-v1+json",
            'version' : 1
        });
	});

	afterEach(function() {
		namesApi=null;
        addressNode=null;
        multicastNode1=null;
        multicastNode2=null;
	});

    it("sets a participant address",function() {
        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(addressNode,packetContext);

        var reply=packetContext.responses[0];
        expect(reply.action).toEqual("ok");

        // check that the participant info was added.
        expect(namesApi.data[addressNode.resource].entity).toEqual(packetContext.packet.entity);

        var addressListNode=namesApi.findOrMakeValue({
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

        namesApi.handleGet(addressListNode,packetContext);
        expect(namesApi.data[addressListNode.resource].entity).toEqual(['testAddress']);
    });

    it("sets two participant multicast addresses in one group",function() {
        var packetContext1=new TestPacketContext({
            'packet': {
                'entity' : 'testAddress1',
                'contentType' : "ozp-multicast-object-v1+json",
                'version' : 1
            }
        });

        var packetContext2=new TestPacketContext({
            'packet': {
                'entity' : 'testAddress2',
                'contentType' : "ozp-multicast-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(multicastNode1,packetContext1);
        var reply=packetContext1.responses[0];
        expect(reply.action).toEqual("ok");

        namesApi.handleSet(multicastNode1,packetContext2);
        var reply=packetContext2.responses[0];
        expect(reply.action).toEqual("ok");

        // check that the multicast info was added.
        expect(namesApi.data[multicastNode1.resource].entity).toEqual([packetContext1.packet.entity,packetContext2.packet.entity]);

        var multicastListNode=namesApi.findOrMakeValue({
            'resource': "/multicast",
            'contentType' : "ozp-multicast-collection-v1+json",
            'version' : 1
        });

        var packetContext=new TestPacketContext({
            'packet': {
                'contentType' : "ozp-multicast-collection-v1+json",
                'version' : 1
            }
        });

        namesApi.handleGet(multicastListNode,packetContext);
        expect(namesApi.data[multicastListNode.resource].entity).toEqual( ['testGroup1']);
    });

    it("sets two participant multicast addresses in separate groups",function() {
        var packetContext1=new TestPacketContext({
            'packet': {
                'entity' : 'testAddress1',
                'contentType' : "ozp-multicast-object-v1+json",
                'version' : 1
            }
        });

        var packetContext2=new TestPacketContext({
            'packet': {
                'entity' : 'testAddress2',
                'contentType' : "ozp-multicast-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(multicastNode1,packetContext1);
        var reply=packetContext1.responses[0];
        expect(reply.action).toEqual("ok");

        namesApi.handleSet(multicastNode2,packetContext2);
        var reply=packetContext2.responses[0];
        expect(reply.action).toEqual("ok");

        // check that the multicast info was added.
        expect(namesApi.data[multicastNode1.resource].entity).toEqual([packetContext1.packet.entity]);
        expect(namesApi.data[multicastNode2.resource].entity).toEqual([packetContext2.packet.entity]);

        var multicastListNode=namesApi.findOrMakeValue({
            'resource': "/multicast",
            'contentType' : "ozp-multicast-collection-v1+json",
            'version' : 1
        });

        var packetContext=new TestPacketContext({
            'packet': {
                'contentType' : "ozp-multicast-collection-v1+json",
                'version' : 1
            }
        });

        namesApi.handleGet(multicastListNode,packetContext);
        expect(namesApi.data[multicastListNode.resource].entity).toEqual( ['testGroup1','testGroup2']);
    });

    it("generates changes for added address",function() {

        addressNode=namesApi.findOrMakeValue({
            'resource': "/address/testAddress",
            'contentType' : "ozp-address-object-v1+json",
            'version' : 2
        });
        addressNode.watch({'src': "watcher",'msgId': 1234});
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

    it("generates changes for added multicast address",function() {

        addressNode=namesApi.findOrMakeValue({
            'resource': "/multicast/testGroup",
            'contentType' : "ozp-multicast-object-v1+json",
            'version' : 2
        });
        addressNode.watch({'src': "watcher",'msgId': 1234});
        var packetContext=new TestPacketContext({
            'packet': {
                'resource': "/multicast/testGroup",
                'action': "set",
                'entity' : 'testAddress',
                'contentType': "ozp-multicast-object-v1+json"
            },
            'leaderState': "leader"
        });
        namesApi.routePacket(packetContext);

        expect(namesApi.participant.sentPackets.length).toEqual(1);
        var changePacket=namesApi.participant.sentPackets[0];
        expect(changePacket.action).toEqual("changed");
        expect(changePacket.entity.newValue).toEqual([packetContext.packet.entity]);
    });

    it("deletes resource /address/${id} and removes the corresponding entry from resource /address",function() {

        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(addressNode,packetContext);
        expect(namesApi.data['/address'].entity.length).toEqual(1);
        namesApi.handleDelete(addressNode,packetContext);
        expect(namesApi.data['/address'].entity.length).toEqual(0);
    });

    it("deletes resource /multicast/${id} and removes the corresponding entry from resource /multicast",function() {

        var packetContext=new TestPacketContext({
            'packet': {
                'entity' :'testAddress',
                'contentType' : "ozp-multicast-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(multicastNode1,packetContext);
        expect(namesApi.data['/multicast'].entity.length).toEqual(1);
        namesApi.handleDelete(multicastNode1,packetContext);
        expect(namesApi.data['/multicast'].entity.length).toEqual(0);
    });

    it("sets the same /address/${id} resource twice and ensures there is only one entry for it in resource /address",function() {

        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : {'participantType':"testType", 'address': "testAddress", 'name': "testName" },
                'contentType' : "ozp-address-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(addressNode,packetContext);
        namesApi.handleSet(addressNode,packetContext);
        expect(namesApi.data['/address'].entity.length).toEqual(1);
    });

    it("sets the same /multicast/${id} resource twice and ensures there is only one entry for it in resource /multicast",function() {

        var packetContext=new TestPacketContext({
            'packet': {
                'entity' : 'testAddress',
                'contentType' : "ozp-multicast-object-v1+json",
                'version' : 1
            }
        });

        namesApi.handleSet(multicastNode1,packetContext);
        namesApi.handleSet(multicastNode1,packetContext);
        expect(namesApi.data['/multicast'].entity.length).toEqual(1);
    });


});