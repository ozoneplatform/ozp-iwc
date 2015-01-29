describe("Leader Group Participant",function() {
	var fakeRouter;
    
    /* 
     * @todo This test doesn't work with postMessage trick for setImmediate.
     * I believe this is due to the way Jasmine hooks the setTimeout and setInterval functions
     * to make them synchronous.  Force this to fallback to the setTimeout(0) method tests the
     * async operation within the bounds of the framework.
     */
    
	var oldSetImmediate=ozpIwc.util.setImmediate;

	var tick=function(t) {
		return fakeRouter.pump().then(function(){
		    jasmine.clock().tick(t);
        }).then(function(){
            return fakeRouter.pump();
        });
	};
	
	var moveTime=function(step) {
		var elected=false;
		var round=0;
        var leaderStatus = function(l) {
            return l.isLeader();
        };
        var self = this;
        var runTillElected = function(){
//			console.log("============= Round " + round + " ===================");
            self.round++;
            jasmine.clock().tick(step);
            return fakeRouter.pump().then(function(){

                elected=fakeRouter.participants.some(leaderStatus);
                if(!elected){
                    return runTillElected();
                } else {
                    return;
                }
            });
        };
	};

    var log=function(){}; // console.log
    
	var makeLeader=function(priority) {
		var l=new ozpIwc.LeaderGroupParticipant({
			electionAddress:"ea",
			name: "foo"+fakeRouter.participants.length,
			'priority': priority
		});
		fakeRouter.registerParticipant(l);
        l.on("startElection", function() {
            l.changeState("election");
            log("startElection[" + l.address + "]");
        });
        l.on("endElection",function() {
            log("endElection[" + l.address + "]");
        });
        l.on("newLeader",function() {
            log("newLeader[" + l.address + "]");
        });
        l.on("becameLeader",function() {
            log("becameLeader[" + l.address + "]");
        });
        l.on("becameLeaderEvent",function(){
            l.sendVictoryMessage();
            l.changeState("leader");
            l.events.trigger("becameLeader");
        });
        l.on("newLeaderEvent",function(){
            l.changeState("member");
            l.events.trigger("newLeader");
        });

        l.nonElectionTestPackets=[];
        l.on("receive",function(packet) {
            l.nonElectionTestPackets.push(packet);
            return [];
        });
        return l;
	};

    var jitter = function(done) {
        fakeRouter.jitter=0.5;

        var lowbie=makeLeader(1);

        var i;
        for(i=10; i< 20; ++i) {
            makeLeader(i);
        }

        var leader=makeLeader(100);

        lowbie.startElection().then(function(){

            // step forward time by 50ms at a shot until the chatter stops
            return moveTime(50);
        }).then(function(){

            for(i=0; i< fakeRouter.participants.length-1; ++i) {
                if(fakeRouter.participants[i].isLeader()) {
    //					console.log("Leader " + i + " thinks he is the bully");
                }
                expect(fakeRouter.participants[i].isLeader()).toEqual(false);
            }

            expect(leader.isLeader()).toEqual(true);
            done();
        });
	};

    beforeEach(function() {
        fakeRouter=new FakeRouter();
        ozpIwc.util.setImmediate=function(f) {
            window.setTimeout(f,0);
        };
    });
    
    afterEach(function() {
       ozpIwc.util.setImmediate=oldSetImmediate;
     });
	it("is not leader when created",function() {
		var leader=makeLeader(1);
		expect(leader.isLeader()).toEqual(false);
	});

	
	it("is leader after one member election",function(done) {
		var leader=makeLeader(1);
		leader.startElection()
            .then(function(){
                return tick(ozpIwc.ELECTION_TIMEOUT * 2);
            }).then(function(){
                expect(leader.isLeader()).toEqual(true);
                done();
            });

	});

	it("changes state on startElection packet",function(done) {
		var leader=makeLeader(1);
		var calls=0;
		leader.on("startElection",function() { calls=true;});
		leader.startElection().then(function() {
            return tick(ozpIwc.ELECTION_TIMEOUT * 2);
        }).then(function(){
		    expect(leader.isLeader()).toEqual(true);
            done();
        });
	});

	it("two members elect one leader",function(done) {
        var member=makeLeader(1);
		var leader=makeLeader(2);

        leader.startElection()
            .then(function(){
                return tick(ozpIwc.ELECTION_TIMEOUT * 2);
            }).then(function(){
                expect(leader.isLeader()).toEqual(true);
                expect(member.isLeader()).toEqual(false);
                done();
            });
	});
	
	it("higher priority will take over",function(done) {
		var member=makeLeader(1);
        var leader;
		member.startElection()
            .then(function() {
                return tick(ozpIwc.ELECTION_TIMEOUT * 2);
            }).then(function() {
                expect(member.isLeader()).toEqual(true);
            }).then(function() {
                leader = makeLeader(2);
                return leader.startElection();
            }).then(function() {
                return tick(ozpIwc.ELECTION_TIMEOUT * 2);
            }).then(function() {
                expect(leader.isLeader()).toEqual(true);
                expect(member.isLeader()).toEqual(false);
                done();
            });
	});
	it("twelve members will elect the correct leader with the lowest one starting the election",function(done) {
		var lowbie=makeLeader(1);
        var i;
		for(i=10; i< 20; ++i) {
			makeLeader(i);
		}
		var leader=makeLeader(100);
		
		lowbie.startElection()
            .then(function(){
                return tick(ozpIwc.ELECTION_TIMEOUT * 2);
            }).then(function(){
                for(i=0; i< fakeRouter.participants.length-1; ++i) {
                    expect(fakeRouter.participants[i].isLeader()).toEqual(false);
                }

                expect(leader.isLeader()).toEqual(true);
                done();
            });



	});


	// since the jitter is random, run several rounds of it
	for(var j=0;j<1;++j) {
		it("member election works with jitter, round " + j, function(done){
            jitter(done);
        });
	}
	describe("dispatch to the target",function() {
		it("sends event on non-election packet", function(done) {
				var leader=makeLeader(1);
				leader.leaderState="leader";
				leader.receiveFromRouter({ packet:{
					src: "foo",
					dst: "bar",
					msgId: 1,
					ver: 1,
					entity: { foo: "bar" }
				}}).then(function(){
				    expect(leader.nonElectionTestPackets.length).toBe(1);
                    done();
                });
		});
	});
	
	
	
});