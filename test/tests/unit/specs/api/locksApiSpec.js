describe("Locks API",function() {

	var locksApi;
    var sentPacketObjs;
    var fakeRouter;
    beforeEach(function(done) {
        fakeRouter = new FakeRouter();
        sentPacketObjs = [];
        locksApi=new ozpIwc.api.locks.Api({
            'authorization': ozpIwc.wiring.authorization,
            'participant': new TestClientParticipant({
                authorization: ozpIwc.wiring.authorization,
                router: fakeRouter
            }),
            'router': fakeRouter
        });
        locksApi.participant.connect().then(function(){
            spyOn(locksApi.participant,"sendImpl").and.callFake(function(packet){
                sentPacketObjs.push(packet);
            });
            locksApi.isRequestQueueing=false;
            locksApi.isSendQueueing=false;
            //locksApi.consensusMember.sendVictoryMessage();
            done();
        });
	});
    
    var queueEntry=function(address,msgId) {
        msgId = msgId || "i:1";
        return {
            src: address,
            msgId: msgId
        };
    };

    var testPacket=function(src,action,msgId,resource) {
        msgId=msgId || "i:1";
        resource=resource || "/mutex/example";
        return new TestPacketContext({
            'leaderState': "leader",
            'packet': {
                'resource': resource,
                'action': action,
                'msgId': msgId,
                'src': src
            }
        });
    };
    var lockPacket=function(src,msgId,resource) { return testPacket(src,"lock",msgId,resource);};
    var unlockPacket=function(src,msgId,resource) { return testPacket(src,"unlock",msgId,resource);};
    var getPacket=function(src,msgId,resource) { return testPacket(src,"get",msgId,resource);};
    
    var ownerNotification=function(src,msgId) {
        msgId=msgId || "i:1";
        return jasmine.objectContaining({
            response: "ok",
            dst: src,
            replyTo: msgId
        });
    };

    it("gives the lock to the first requester",function() {
        locksApi.receivePacketContext(lockPacket("12345"));
        expect(sentPacketObjs[0]).toEqual(ownerNotification("12345"));
    });

    it("passes the lock down the queue when the owner unlocks",function() {
        locksApi.receivePacketContext(lockPacket("12345"));
        locksApi.receivePacketContext(lockPacket("12346"));
        locksApi.receivePacketContext(lockPacket("12347"));
        locksApi.receivePacketContext(unlockPacket("12345"));
        expect(sentPacketObjs.length).toEqual(2);
        expect(sentPacketObjs[0]).toEqual(ownerNotification("12345"));
        expect(sentPacketObjs[1]).toEqual(ownerNotification("12346"));
    });

    
    it("removes a queued holder upon unlock, but doesn't change owner",function() {
        var context = getPacket("unitTest","i:300");

        locksApi.receivePacketContext(lockPacket("12345"));
        locksApi.receivePacketContext(lockPacket("12346"));
        locksApi.receivePacketContext(lockPacket("12347"));
        locksApi.receivePacketContext(unlockPacket("12346"));

        locksApi.receivePacketContext(context);
        expect(context.responses[0].entity).toEqual({
            owner: queueEntry("12345"),
            queue: [
                queueEntry("12345"),
                queueEntry("12347")
            ]
        });
    });

    it("removes an address from the queue upon disconnect",function() {
        var context = getPacket("unitTest","i:300");

        locksApi.receivePacketContext(lockPacket("12345"));
        locksApi.receivePacketContext(lockPacket("12346"));
        locksApi.receivePacketContext(lockPacket("12347"));
        locksApi.receivePacketContext(lockPacket("12346","i:10"));
        locksApi.receivePacketContext(lockPacket("12346","i:20"));
        locksApi.receivePacketContext({
            packet: {
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: "12346",
                    participantType: "testParticipant",
                    namesResource: "/address/12346"
                }
            }
        });
        locksApi.receivePacketContext(context);
        expect(context.responses[0].entity).toEqual({
            owner: queueEntry("12345"),
            queue: [
                queueEntry("12345"),
                queueEntry("12347")
            ]
        });
    });
    
    it("passes down the lock when the leader disconnects",function() {
        var context = getPacket("unitTest","i:300");

        locksApi.receivePacketContext(lockPacket("12345"));
        locksApi.receivePacketContext(lockPacket("12346"));
        locksApi.receivePacketContext(lockPacket("12347"));
        locksApi.receivePacketContext({
            packet: {
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: "12345",
                    participantType: "testParticipant",
                    namesResource: "/address/12345"
                }
            }
        });
        locksApi.receivePacketContext(context);
        expect(sentPacketObjs.length).toEqual(2);
        expect(sentPacketObjs[1]).toEqual(ownerNotification("12346"));
    });
    
    it("removes an address from ALL lock queues upon disconnect",function() {
        var context1 = getPacket("unitTest","i:300","/mutex/1");
        var context2 = getPacket("unitTest","i:300","/mutex/2");

        locksApi.receivePacketContext(lockPacket("12345","i:1","/mutex/1"));
        locksApi.receivePacketContext(lockPacket("12346","i:1","/mutex/1"));
        locksApi.receivePacketContext(lockPacket("12347","i:1","/mutex/1"));
        locksApi.receivePacketContext(lockPacket("12346","i:10","i:1","/mutex/1"));
        locksApi.receivePacketContext(lockPacket("12346","i:20","i:1","/mutex/1"));
        locksApi.receivePacketContext(lockPacket("12346","i:2","/mutex/2"));
        locksApi.receivePacketContext(lockPacket("12349","i:2","/mutex/2"));
        locksApi.receivePacketContext(lockPacket("12347","i:2","/mutex/2"));

        locksApi.receivePacketContext({
            packet: {
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: "12346",
                    participantType: "testParticipant",
                    namesResource: "/address/12346"
                }
            }
        });

        locksApi.receivePacketContext(context1);
        locksApi.receivePacketContext(context2);

        expect(context1.responses[0].entity).toEqual({
            owner: queueEntry("12345","i:1"),
            queue: [
                queueEntry("12345","i:1"),
                queueEntry("12347","i:1")
            ]
        });

        expect(context2.responses[0].entity).toEqual({
            owner: queueEntry("12349","i:2"),
            queue: [
                queueEntry("12349","i:2"),
                queueEntry("12347","i:2")
            ]
        });
    });


    it("returns badAction on a set",function() {
        var context = testPacket("unitTest", "set");

        locksApi.receivePacketContext(lockPacket("12345"));
        locksApi.receivePacketContext(context);
        expect(context.responses[0].response).toEqual("badAction");
    });

    it("returns badAction on a delete",function() {
        var context=testPacket("unitTest","delete");

        locksApi.receivePacketContext(lockPacket("12345"));
        locksApi.receivePacketContext(context);
        expect(context.responses[0].response).toEqual("badAction");
    });

});