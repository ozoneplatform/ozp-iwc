describe("Base Consensus",function() {
    var consensus = null;
    beforeEach(function(){
        consensus = new ozpIwc.consensus.BaseConsensus({
            'name': "fake",
            'routePacket': function(){
                //drop it
            }
        });
    });
    afterEach(function(){
        consensus = null;
    });

    describe("Construction",function(){

        it("requires a name",function(){
            try{
                var foo = new ozpIwc.consensus.BaseConsensus();
            } catch(e){
                expect(e).toEqual("Consensus module expects a name.");
                foo = null;
            }
        });

        it("has events",function(done){
            consensus.on("foo",function(data){
                expect(data).toEqual("bar");
                done();
            });
            consensus.events.trigger("foo","bar");
        });

        it("has a participant",function(){
            expect(consensus.participant).toBeDefined();
        });

        it("has a router",function(){
            expect(consensus.router).toBeDefined();
        });

        it("Defaults its state to unknown",function(){
            expect(consensus.state).toEqual("unknown");
        });
    });

    describe("Permissions",function(){

        it("can send as the consensus address",function(){
            expect(consensus.participant.permissions.attributes['ozp:iwc:sendAs']).toContain(consensus.participant.address);
            expect(consensus.participant.permissions.attributes['ozp:iwc:sendAs']).toContain(consensus.consensusAddress);
        });

        it("can receive as the consensus address",function(){
            expect(consensus.participant.permissions.attributes['ozp:iwc:receiveAs']).toContain(consensus.participant.address);
            expect(consensus.participant.permissions.attributes['ozp:iwc:receiveAs']).toContain(consensus.consensusAddress);
        });
    });

    describe("Functionality",function(){

        it("can change state",function(done){
            consensus.on("changedState",function(state){
                expect(state).toEqual("leader");
                done();
            });
            consensus.changeState("leader");
        });

        it("has a become coordinator handler",function(){
            expect(consensus.onBecomeCoordinator).toBeDefined();
        });

        it("has a become member handler",function(){
            expect(consensus.onBecomeMember).toBeDefined();
        });

        it("routes packets it receives",function(){
            expect(consensus.routePacket).toBeDefined();
        });
    });
});