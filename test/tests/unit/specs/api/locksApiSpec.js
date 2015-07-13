describe("Locks API",function() {

	var locksApi;
    var sentPacketObjs;
    var fakeRouter;
    beforeEach(function(done) {
        fakeRouter = new FakeRouter();
        sentPacketObjs = [];
        locksApi=new ozpIwc.LocksApi({
            'participant': new TestClientParticipant(),
            'name': "testLocks.api"
        });
        locksApi.participant.connect().then(function(){
            spyOn(locksApi.participant,"sendImpl").and.callFake(function(packet){
                sentPacketObjs.push(packet);
            });
            locksApi.isRequestQueueing=false;
            locksApi.isSendQueueing=false;
            locksApi.consensusMember.sendVictoryMessage();
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

    pit("gives the lock to the first requester",function() {
        return locksApi.receiveRequestPacket(lockPacket("12345")).then(function(){
            expect(sentPacketObjs[0]).toEqual(ownerNotification("12345"));
        });
    });

    pit("passes the lock down the queue when the owner unlocks",function() {
        return Promise.all([
            locksApi.receiveRequestPacket(lockPacket("12345")),
            locksApi.receiveRequestPacket(lockPacket("12346")),
            locksApi.receiveRequestPacket(lockPacket("12347")),
            locksApi.receiveRequestPacket(unlockPacket("12345"))
        ]).then(function(){
            expect(sentPacketObjs.length).toEqual(2);
            expect(sentPacketObjs[0]).toEqual(ownerNotification("12345"));
            expect(sentPacketObjs[1]).toEqual(ownerNotification("12346"));
        });

    });

    
    pit("removes a queued holder upon unlock, but doesn't change owner",function() {
        var context = getPacket("unitTest","i:300");

        return Promise.all([
            locksApi.receiveRequestPacket(lockPacket("12345")),
            locksApi.receiveRequestPacket(lockPacket("12346")),
            locksApi.receiveRequestPacket(lockPacket("12347")),
            locksApi.receiveRequestPacket(unlockPacket("12346"))
        ]).then(function(){
            return locksApi.receiveRequestPacket(context);
        }).then(function(){
            expect(context.responses[0].entity).toEqual({
                owner: queueEntry("12345"),
                queue: [
                    queueEntry("12345"),
                    queueEntry("12347")
                ]
            });
        });
    });    
    pit("removes an address from the queue upon disconnect",function() {
        var context = getPacket("unitTest","i:300");

        return Promise.all([
            locksApi.receiveRequestPacket(lockPacket("12345")),
            locksApi.receiveRequestPacket(lockPacket("12346")),
            locksApi.receiveRequestPacket(lockPacket("12347")),
            locksApi.receiveRequestPacket(lockPacket("12346","i:10")),
            locksApi.receiveRequestPacket(lockPacket("12346","i:20"))
        ]).then(function(){
            return locksApi.receiveBusPacket({
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
        }).then(function(){
            return locksApi.receiveRequestPacket(context);
        }).then(function(){
            expect(context.responses[0].entity).toEqual({
                owner: queueEntry("12345"),
                queue: [
                    queueEntry("12345"),
                    queueEntry("12347")
                ]
            });
        });
    });  
    
    pit("passes down the lock when the leader disconnects",function() {
        var context = getPacket("unitTest","i:300");

        return Promise.all([
            locksApi.receiveRequestPacket(lockPacket("12345")),
            locksApi.receiveRequestPacket(lockPacket("12346")),
            locksApi.receiveRequestPacket(lockPacket("12347"))
        ]).then(function(){
            return locksApi.receiveBusPacket({
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
        }).then(function(){
            locksApi.receiveRequestPacket(context);
        }).then(function(){
            expect(sentPacketObjs.length).toEqual(2);
            expect(sentPacketObjs[1]).toEqual(ownerNotification("12346"));
        });
    });
    
    pit("removes an address from ALL lock queues upon disconnect",function() {
        var context1 = getPacket("unitTest","i:300","/mutex/1");
        var context2 = getPacket("unitTest","i:300","/mutex/2");

        return Promise.all([
            locksApi.receiveRequestPacket(lockPacket("12345","i:1","/mutex/1")),
            locksApi.receiveRequestPacket(lockPacket("12346","i:1","/mutex/1")),
            locksApi.receiveRequestPacket(lockPacket("12347","i:1","/mutex/1")),
            locksApi.receiveRequestPacket(lockPacket("12346","i:10","i:1","/mutex/1")),
            locksApi.receiveRequestPacket(lockPacket("12346","i:20","i:1","/mutex/1")),
            locksApi.receiveRequestPacket(lockPacket("12346","i:2","/mutex/2")),
            locksApi.receiveRequestPacket(lockPacket("12349","i:2","/mutex/2")),
            locksApi.receiveRequestPacket(lockPacket("12347","i:2","/mutex/2"))
        ]).then(function() {
            return locksApi.receiveBusPacket({
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
        }).then(function(){
            return Promise.all([
                locksApi.receiveRequestPacket(context1),
                locksApi.receiveRequestPacket(context2)
            ]);
        }).then(function(){
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
    });


    pit("returns badAction on a set",function() {
        var context = testPacket("unitTest", "set");

        return locksApi.receiveRequestPacket(lockPacket("12345")).then(function () {
            return locksApi.receiveRequestPacket(context);
        }).then(function () {
            expect(context.responses[0].response).toEqual("badAction");
        });
    });

    pit("returns badAction on a delete",function() {
        var context=testPacket("unitTest","delete");

        return locksApi.receiveRequestPacket(lockPacket("12345")).then(function(){
            return locksApi.receiveRequestPacket(context);
        }).then(function(){
            expect(context.responses[0].response).toEqual("badAction");
        });
    });

});