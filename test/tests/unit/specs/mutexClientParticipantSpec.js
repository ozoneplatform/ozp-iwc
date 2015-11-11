describe("MutexClient Participant", function () {
    var fakeRouter, participant, sentPackets;

    var makeParticipant = function (router) {
        var l = new ozpIwc.transport.participant.MutexClient({
            name: "fakeName",
            authorization: ozpIwc.wiring.authorization,
            metrics: new ozpIwc.metric.Registry(),
            router: router
        });
        return l;

    };

    beforeEach(function () {
        ozpIwc.metrics = new ozpIwc.metric.Registry();
        fakeRouter = new FakeRouter();
        participant = makeParticipant(fakeRouter);
        ozpIwc.util.setImmediate = function (fn) {
            fn.apply(arguments);
        };
        sentPackets = participant.sentPacketsMeter.get().count;
    });
    describe("creation", function () {
        it("requires a name", function () {
            try {
                new ozpIwc.transport.participant.MutexClient();
            } catch (e) {
                expect(e).toEqual("Cannot instantiate a MutexClient without a name.");
            }
        });

        it("requests a lock with its name", function () {
            expect(participant.router.packetQueue).toContain(jasmine.objectContaining({
                'dst': "locks.api",
                'resource': "/mutex/" + participant.name
            }));
        });
    });

    describe("events", function () {
        xit("emits a lockAcquired event when holding the lock.", function () {});
        xit("emits a lockReleased event when releasing the lock.", function () {});
    });
});