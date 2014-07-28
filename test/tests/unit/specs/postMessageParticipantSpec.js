describe("Post Message Participant",function() {
    var participants = [];
    var packetQueue = [];
    var fakeRouter = {
        jitter: 0,
        send: function (packet) {
            if (packetQueue.length === 0 || Math.random() > fakeRouter.jitter) {
                packetQueue.push(packet);
            } else {
//				console.log("JITTER!");
                packetQueue.splice(-1, 0, packet);
            }

        },
        registerParticipant: function (p) {
            p.connectToRouter(fakeRouter, participants.length + 1);
            participants.push(p);
        },
        pump: function () {
            var processed = 0;
            while (packetQueue.length) {
                processed++;
                var packet = packetQueue.shift();
//				console.log("PACKET(" + packet.src + "): " + packet.entity.type);
                participants.forEach(function (l) {
                    if (l.address !== packet.src) {
                        l.receiveFromRouter({'packet': packet});
                    }
                });
            }
            return processed;
        },
        createMessage: function (m) {
            return m;
        },
        registerMulticast: function () {
        }
    };

    var tick = function (t) {
        fakeRouter.pump();
        jasmine.clock().tick(t);
        fakeRouter.pump();
    };

    var moveTime = function (step) {
        var elected = false;
        var round = 0;
        while (!elected) {
//			console.log("============= Round " + round + " ===================");
            round++;
            jasmine.clock().tick(step);
            fakeRouter.pump();

            elected = leaders.some(function (l) {
                return l.isLeader();
            });
        }
    };
    var makeParticipant = function() {
        var l = new ozpIwc.PostMessageParticipant({
            origin : "http://localhost:14000",
            sourceWindow : this.window,
            credentials : []
        });
        fakeRouter.registerParticipant(l);
        return l;
    };

    beforeEach(function () {
        jasmine.addMatchers(customMatchers);
        jasmine.clock().install();
    });

    afterEach(function () {
        participants = [];
        packetQueue = [];
    });

    it("permits receiving packets that have a destination matching the receiveAs Attribute", function() {
        var participant = makeParticipant();
        var res = participant.receiveFromRouterImpl(new TestPacketContext({
            'packet': {
                'dst': participant.address
            }
        }));
        expect(res.resolution).toEqual("success");
    });

    it("denies receiving packets that don't have a destination matching the receiveAs Attribute", function() {
        var participant = makeParticipant();
        var res = participant.receiveFromRouterImpl(new TestPacketContext({
            'packet': {
                'dst': participant.address+1
            }
        }));
        expect(res.resolution).toEqual("failure");
    });

    it("permits sending packets that have a source matching the sendAs Attribute", function() {
        var participant = makeParticipant();
        var res = participant.send({
                'src': participant.address
            });
        expect(res.resolution).toEqual("success");
    });

    it("denies sending packets that don't have a source matching the sendAs Attribute", function() {
        var participant = makeParticipant();

        var res = participant.send({
            'src': participant.address+1
        });
        expect(res.resolution).toEqual("failure");
    });
});