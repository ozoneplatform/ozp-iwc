describe("Internal Participant",function() {
    var fakeRouter;

    var makeParticipant = function() {
        var l = new ozpIwc.InternalParticipant({
            origin : "http://" + window.location.hostname + ":14000",
            sourceWindow : this.window,
            credentials : []
        });
        return fakeRouter.registerParticipant(l).then(function(){
            return l;
        });

    };

    beforeEach(function () {
        ozpIwc.metrics=new ozpIwc.MetricsRegistry();
        fakeRouter= new FakeRouter();
        ozpIwc.authorization = new ozpIwc.policyAuth.PDP({
            pip: new ozpIwc.policyAuth.PIP(),
            prp: new ozpIwc.policyAuth.PRP({
                policyCache: mockPolicies
            })
        });
    });

    afterEach(function(){
        ozpIwc.authorization = new MockAuthorization();
    });

    describe("Security",function(){
        it("permits receiving packets that have a destination matching the receiveAs Attribute", function(done) {
            makeParticipant().then(function(participant){
                var packet =  new TestPacketContext({
                    'packet': {
                        'dst': participant.address
                    }
                });
                participant.receiveFromRouter(packet).then(function(){
                    expect(participant.receivedPacketsMeter.get().count).toEqual(1);
                    done();
                })['catch'](function(e){
                    expect(false).toEqual(true);
                    done();
                });
            });
        });

        it("denies receiving packets that don't have a destination matching the receiveAs Attribute", function(done) {
            makeParticipant().then(function(participant){
                var packet =  new TestPacketContext({
                    'packet': {
                        'dst': participant.address+1
                    }
                });
                participant.receiveFromRouter(packet).then(function(){
                    expect(false).toEqual(true);
                    done();
                })['catch'](function(e){
                    expect(participant.forbiddenPacketsMeter.get().count).toEqual(1);
                    done();
                });
            });
        });

        it("permits sending packets that have a source matching the sendAs Attribute", function(done) {
            makeParticipant().then(function(participant){
                var sentPackets = participant.sentPacketsMeter.get().count;

                participant.send({
                    'src': participant.address
                }).then(function(){
                    expect(participant.sentPacketsMeter.get().count).toEqual(sentPackets + 1);
                    done();
                })['catch'](function(e){
                    expect(false).toEqual(true);
                    done();
                });
            });
        });

        it("denies sending packets that don't have a source matching the sendAs Attribute", function(done) {
            makeParticipant().then(function(participant){
                var sentPackets = participant.sentPacketsMeter.get().count;
                participant.send({
                    'src': participant.address+1
                }).then(function(resolution){
                    expect(false).toEqual(true);
                    done();
                })['catch'](function(e){
                    expect(participant.sentPacketsMeter.get().count).toEqual(sentPackets);
                    done();
                });
            });
        });
    });
});