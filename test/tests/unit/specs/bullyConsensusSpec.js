describe("Bully Consensus",function() {

    var consensus,router;
    var consensusGen = function(router){
        return  new ozpIwc.consensus.Bully({
            'name': "fake",
            'router': router
        });
    };

    //var oldSetImmediate=ozpIwc.util.setImmediate;

    beforeEach(function(){
        //ozpIwc.util.setImmediate=function(f) {
        //    window.setTimeout(f,0);
        //};
        router = new ozpIwc.Router({
            peer: new ozpIwc.Peer()
        });
    });

    afterEach(function(){
        router = null;
        //ozpIwc.util.setImmediate = oldSetImmediate;
    });

    var disableConsensus = function(consensus){
        consensus.sendVictoryMessage = function(){};
        consensus.sendElectionMessage = function(){};
        consensus.sendAckMessage= function(){};
    };


    describe("Construction",function(){

        beforeEach(function(){
            consensus = consensusGen(router);
        });

        afterEach(function(){
            consensus = null;
        });
        it("has a consensusId",function(){
            expect(consensus.consensusId).toBeDefined();
        });

        it("has a watchdog for starting elections",function(){
            expect(consensus.coordinatorTimeoutHeartbeat).toBeDefined();
        });

        it("has an interval rate for publishing status if coordinator",function(){
            expect(consensus.coordinatorIntervalHeartbeat).toBeDefined();
        });

        it("Defaults its state to member",function(){
            expect(consensus.state).toEqual("member");
        });
    });


    describe("Functionality",function(){

        it("becomes leader if no one objects",function(done){
            consensus =  consensusGen(router);
            consensus.on("changedState",function(state){
                expect(state).toEqual("coordinator");
                done();
            });

            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout * 3);
        });

        it("calls onBecomeCoordinator when becoming coordinator",function(){
            consensus =  consensusGen(router);

            spyOn(consensus,'onBecomeCoordinator');
            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout * 3);
            expect(consensus.onBecomeCoordinator).toHaveBeenCalled();
        });

        it("2 members will elect one to be become leader",function(){
            var consensusA =  consensusGen(router);
            ozpIwc.testUtil.tick(1000);
            var consensusB =  consensusGen(router);

            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout * 3);
            expect(consensusA.state).toEqual("coordinator");
            expect(consensusB.state).toEqual("member");

        });

        it("a leader will remain a leader when members join",function(){
            var consensusA = consensusGen(router);
            ozpIwc.testUtil.tick(1000);
            var consensusB = consensusGen(router);

            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout * 3);
            expect(consensusA.state).toEqual("coordinator");
            expect(consensusB.state).toEqual("member");
            var consensusC = consensusGen(router);

            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout* 3);
            expect(consensusA.state).toEqual("coordinator");
            expect(consensusB.state).toEqual("member");
            expect(consensusC.state).toEqual("member");
        });

        it("when a leader quits, the next highest ranking member becomes coordinator",function(){
            var consensusA = consensusGen(router);
            ozpIwc.testUtil.tick(1000);
            var consensusB = consensusGen(router);
            ozpIwc.testUtil.tick(1000);
            var consensusC = consensusGen(router);

            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout * 3);
            expect(consensusA.state).toEqual("coordinator");
            expect(consensusB.state).toEqual("member");
            expect(consensusC.state).toEqual("member");
            disableConsensus(consensusA);

            ozpIwc.testUtil.tick(ozpIwc.config.consensusTimeout * 3);
            expect(consensusB.state).toEqual("coordinator");
            expect(consensusC.state).toEqual("member");
        });

    });


});