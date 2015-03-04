describe("Post Message Participant",function() {
    var fakeRouter,participant,sentMeter,receivedMeter, forbiddenMeter;

    var makeParticipant = function() {
        var l = new ozpIwc.PostMessageParticipant({
            origin : "http://" + window.location.hostname + ":14000",
            sourceWindow : this.window,
            credentials : []
        });
        fakeRouter.registerParticipant(l);
        return l;
    };

    beforeEach(function () {
        fakeRouter= new FakeRouter();
        participant = makeParticipant();
        sentMeter = participant.sentPacketsMeter.get().count;
        receivedMeter = participant.receivedPacketsMeter.get().count;
        forbiddenMeter = participant.forbiddenPacketsMeter.get().count;
    });

    describe("Security",function(){
        it("permits receiving packets that have a destination matching the receiveAs Attribute", function() {
            var packet =  new TestPacketContext({
                'packet': {
                    'dst': participant.address
                }
            });
            participant.receiveFromRouter(packet);
            expect(participant.receivedPacketsMeter.get().count).toEqual(receivedMeter + 1);
        });

        it("denies receiving packets that don't have a destination matching the receiveAs Attribute", function() {
            var packet =  new TestPacketContext({
                'packet': {
                    'dst': participant.address+1
                }
            });
            participant.receiveFromRouter(packet);
            expect(participant.forbiddenPacketsMeter.get().count).toEqual(forbiddenMeter + 1);
        });

        it("permits sending packets that have a source matching the sendAs Attribute", function() {
            participant.send({
                'src': participant.address
            });
            expect(participant.sentPacketsMeter.get().count).toEqual(sentMeter + 1);

        });

        it("denies sending packets that don't have a source matching the sendAs Attribute", function() {
            participant.send({
                'src': participant.address+1
            });
            expect(participant.sentPacketsMeter.get().count).toEqual(sentMeter);
        });
    });
});