describe("Router", function () {
    var router;
    var fakePeer;

    beforeEach(function () {
        fakePeer = new ozpIwc.util.Event();
        fakePeer.packets = [];
        fakePeer.send = function (packet) {
            fakePeer.packets.push(packet);
        };

        router = new ozpIwc.transport.Router({
            authorization: ozpIwc.wiring.authorization,
            metrics: ozpIwc.wiring.metrics,
            peer: fakePeer
        });
    });

    afterEach(function () {
        router.shutdown();
        router = null;
        fakePeer = {
            packets: [],
            send: function () {}
        };
    });

    describe("Participant registration", function () {
        var participant;
        pBeforeEach(function () {
            participant = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "foo.com", router: router});
            return participant.connect();
        });

        it("returns and assigns a participant id", function () {
            expect(participant.address).toBeDefined();
            expect(participant.address).not.toEqual("$nobody");
        });

        it("assigns a participant id derived from the router id", function () {
            expect(participant.address).toMatch(new RegExp("(.*)\\." + router.selfId));
        });

        it("calls registration handlers", function () {
            var called = false;
            var eventPart;
            router.on("preRegisterParticipant", function (event) {
                expect(called).toEqual(false);
                eventPart = event.participant;
                called = true;
            });

            var part = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "foo.com", router: router}, {});
            expect(called).toEqual(true);
            expect(eventPart).toEqual(part);
        });

        pit("blocks a participant if the handler cancels", function () {
            router.on("preRegisterParticipant", function (event) {
                if (event.participant.origin === "badguy.com") {
                    event.cancel("badguy");
                }
            });

            var badParticipant = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "badguy.com", router: router});
            return badParticipant.connect().then(function () {
                expect(participant.address).not.toBeNull();
                expect(badParticipant.address).toEqual("$nobody");
            });

        });
    });

    describe("Sending packets", function () {
        var participant;
        var participant2;

        beforeEach(function () {
            participant = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "foo.com", router: router});
            participant2 = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "bar.com", router: router});

            router.registerParticipant(participant);
            router.registerParticipant(participant2);
        });

        it("forwards connection packets", function () {
            expect(fakePeer.packets).toContain(jasmine.objectContaining({
                'action': "connect",
                'src': participant.address
            }));
            expect(fakePeer.packets).toContain(jasmine.objectContaining({
                'action': "connect",
                'src': participant2.address
            }));
        });

        it("forwards to peer", function () {
            var msg = participant.fixPacket({dst: "fakeName"});
            router.send(msg, participant);
            expect(fakePeer.packets).toContain(msg);
        });

        it("routes locally", function () {
            participant2.packets = [];
            var msg = participant.fixPacket({dst: participant2.address});
            router.send(msg, participant);
            expect(participant2.packets[0].packet).toEqual(msg);
            expect(participant2.packets[0].srcParticipant).toBe(participant);
            expect(participant2.packets[0].dstParticipant).toBe(participant2);
        });
    });

    describe("Secure routing", function () {
        var participant;
        var participant2;

        beforeEach(function () {
            participant = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "foo.com", router: router});
            participant2 = new TestParticipant({authorization: ozpIwc.wiring.authorization, origin: "bar.com", router: router});

            router.registerParticipant(participant);
            router.registerParticipant(participant2);
            participant.permissions.pushIfNotExist("ozp:iwc:perm", 'shared');
            participant2.permissions.pushIfNotExist("ozp:iwc:perm", 'shared');

            participant.permissions.pushIfNotExist("ozp:iwc:color", 'blue');
            participant2.permissions.pushIfNotExist("ozp:iwc:color", 'red');
        });

        it("allows receipt of shared permissions", function (done) {
            participant2.on("receive", function onreceive(packetContext) {
                expect(packetContext.packet.entity).toEqual({foo: "bar"});
                participant2.off("receive", onreceive);
                done();
            });
            participant.send({
                dst: participant2.address,
                permissions: {
                    'ozp:iwc:perm': "shared"
                },
                entity: {foo: "bar"}
            });
        });

        it("denies receipt of unshared permissions", function () {
            var msg = {
                dst: participant2.address,
                permissions: {'ozp:iwc:color': "blue"},
                entity: {foo: "bar"}
            };

            participant.send(msg);

            expect(participant2.packets).not.toContain(jasmine.objectContaining(msg));
        });

        it("denies if the recipient doesn't have all permissions", function () {
            var msg = {
                dst: participant2.address,
                permissions: {'ozp:iwc:perm': "shared", 'ozp:iwc:color': "blue"},
                entity: {foo: "bar"}
            };
            participant.send(msg);

            expect(participant2.packets).not.toContain(jasmine.objectContaining(msg));
        });

        it("allows a participant to send a packet to require permissions that it doesn't have, itself", function (done) {
            participant2.on("receive", function onreceive(packetContext) {
                expect(packetContext.packet.entity).toEqual({foo: "bar"});
                participant2.off("receive", onreceive);
                done();
            });
            participant.send({
                dst: participant2.address,
                permissions: {'ozp:iwc:color': "red"},
                entity: {'foo': "bar"}
            });

        });

    });

});
