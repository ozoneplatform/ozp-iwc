describe("Internal Participant",function() {
    var fakeRouter,participant,sentPackets;

    var makeParticipant = function() {
        var l = new ozpIwc.InternalParticipant({
            origin : "http://" + window.location.hostname + ":14000",
            sourceWindow : this.window,
            credentials : []
        });
        fakeRouter.registerParticipant(l);
        return l;

    };

    beforeEach(function () {
        ozpIwc.metrics=new ozpIwc.MetricsRegistry();
        fakeRouter= new FakeRouter();
        participant = makeParticipant();
        ozpIwc.util.setImmediate = function(fn){
            fn.apply(arguments);
        };
        sentPackets = participant.sentPacketsMeter.get().count;
    });


    describe("Security",function(){
        it("permits receiving packets that have a destination matching the receiveAs Attribute", function() {
            var packet =  new TestPacketContext({
                'packet': {
                    'dst': participant.address
                }
            });
            participant.receiveFromRouter(packet);
            expect(participant.receivedPacketsMeter.get().count).toEqual(1);
        });

        it("denies receiving packets that don't have a destination matching the receiveAs Attribute", function() {
            var packet =  new TestPacketContext({
                'packet': {
                    'dst': participant.address+1
                }
            });
            participant.receiveFromRouter(packet);
            expect(participant.forbiddenPacketsMeter.get().count).toEqual(1);
        });

        it("permits sending packets that have a source matching the sendAs Attribute", function() {
            participant.send({
                'src': participant.address
            });
            expect(participant.sentPacketsMeter.get().count).toEqual(sentPackets + 1);
        });

        it("denies sending packets that don't have a source matching the sendAs Attribute", function() {
            participant.send({
                'src': participant.address+1
            });
            expect(participant.sentPacketsMeter.get().count).toEqual(sentPackets);
        });
    });
});