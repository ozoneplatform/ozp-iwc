describe("Post Message Participant",function() {
    var fakeRouter;


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
    });

    it("permits receiving packets that have a destination matching the receiveAs Attribute", function(done) {
        var participant = makeParticipant();
        var packet =  new TestPacketContext({
            'packet': {
                'dst': participant.address
            }
        });
        participant.receiveFromRouterImpl(packet).then(function(resolution){
            expect(resolution).toEqual("Permit");
            done();
        })['catch'](function(){
            expect(false).toEqual(true);
            done();
        });
    });

    it("denies receiving packets that don't have a destination matching the receiveAs Attribute", function(done) {
        var participant = makeParticipant();
        var packet =  new TestPacketContext({
            'packet': {
                'dst': participant.address+1
            }
        });
        participant.receiveFromRouterImpl(packet).then(function(resolution){
            expect(false).toEqual(true);
            done();
        })['catch'](function(){
            expect(resolution).toEqual("Deny");
            done();
        });
    });

    it("permits sending packets that have a source matching the sendAs Attribute", function(done) {
        var participant = makeParticipant();
        participant.send({
            'src': participant.address
        }).then(function(resolution){
            expect(resolution).toEqual("Permit");
            done();
        })['catch'](function(){
            expect(false).toEqual(true);
            done();
        });

    });

    it("denies sending packets that don't have a source matching the sendAs Attribute", function(done) {
        var participant = makeParticipant();
        participant.send({
            'src': participant.address+1
        }).then(function(resolution){
            expect(false).toEqual(true);
            done();
        })['catch'](function(){
            expect(resolution).toEqual("Deny");
            done();
        });
    });
});