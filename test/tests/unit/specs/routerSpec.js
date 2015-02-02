
describe("Router", function() {
    var router;
    var fakePeer;

    beforeEach(function() {
        fakePeer = new ozpIwc.Event();
        fakePeer.packets = [];
        fakePeer.send = function(packet) {
            this.packets.push(packet);
        };

        router = new ozpIwc.Router({
            peer: fakePeer
        });
        ozpIwc.authorization = new ozpIwc.policyAuth.PDP({
            pip: new ozpIwc.policyAuth.PIP(),
            prp: new ozpIwc.policyAuth.PRP({
                policyCache: mockPolicies
            })
        });
    });

    afterEach(function() {
        router.shutdown();
        router = null;
        fakePeer = null;
        //ozpIwc.authorization = new MockAuthorization();
    });

    describe("Participant registration", function() {
        var participant;
        var participantId;
        beforeEach(function() {
            participant = new TestParticipant({origin: "foo.com"});
        });

        it("returns and assigns a participant id", function(done) {
            router.registerParticipant(participant, {}).then(function(id){
                participantId = id;
                expect(participantId).toBeDefined();
                expect(participant.address).toEqual(participantId);
                done();
            });
        });

        it("assigns a participant id derived from the router id", function(done) {
            router.registerParticipant(participant, {}).then(function(id){
                participantId = id;
                expect(participantId).toMatch(new RegExp("(.*)\\." + router.selfId));
                done();
            });
        });

        it("calls registration handlers", function(done) {
            var called = false;

            router.on("preRegisterParticipant", function(event) {
                expect(event.participant).toEqual(participant);
                called = true;
            });

            router.registerParticipant(participant, {}).then(function(){
                expect(called).toEqual(true);
                done();
            });

        });

        it("blocks a participant if the handler cancels", function(done) {
            router.on("preRegisterParticipant", function(event) {
                if (event.participant.origin === "badguy.com") {
                    event.cancel("badguy");
                }
            });

            var badParticipant = new TestParticipant({origin: "badguy.com"});

            router.registerParticipant(participant, {}).then(function(){
                expect(participant.address).not.toBeNull();
                return router.registerParticipant(badParticipant, {});
            })['catch'](function(reason){
                expect(badParticipant.address).toBeUndefined();
                done();
            });

        });
    });

    describe("Sending packets", function() {
        var participant;
        var participant2;
        var msg;

        beforeEach(function() {
            participant = new TestParticipant({origin: "foo.com"});
            participant2 = new TestParticipant({origin: "bar.com"});

            router.registerParticipant(participant);
            router.registerParticipant(participant2);
        });

        it("forwards to peer", function(done) {
            participant.send({dst: "fakeName"}).then(function(response){
                msg = response.packet;
                return router.send(msg,participant);
            }).then(function(){
                expect(fakePeer.packets.indexOf(msg)).toBeGreaterThan(-1);
                done();
            })['catch'](function(e){
                expect(false).toEqual(true);
                done();
            });
        });

        it("routes locally", function(done) {
            participant.send({dst: participant2.address}).then(function(response) {
                msg = response.packet;
                return router.send(msg, participant);
            }).then(function(){
                expect(participant2.packets[0].packet).toEqual(msg);
                expect(participant2.packets[0].srcParticipant).toBe(participant);
                expect(participant2.packets[0].dstParticipant).toBe(participant2);
                done();
            })['catch'](function(e){
                expect(false).toEqual(true);
                done();
            });
        });
    });

    describe("Secure routing", function() {
        var participant;
        var participant2;

        beforeEach(function(done) {
            participant = new TestParticipant({origin: "foo.com"});
            participant2 = new TestParticipant({origin: "bar.com"});

            router.registerParticipant(participant).then(function(){
                return router.registerParticipant(participant2);
            }).then(function(){
                participant.securityAttributes.perm = 'shared';
                participant2.securityAttributes.perm = 'shared';

                participant.securityAttributes.color = 'blue';
                participant2.securityAttributes.color = 'red';
                done();
            });
        });

        it("allows receipt of shared permissions", function(done) {
            participant2.on("receive", function() {
                expect(participant2.packets[participant2.packets.length - 1].packet.entity).toEqual({foo: "bar"});
                done();
            });
            participant.send({
                dst: participant2.address,
                permissions: {'perm': "shared"},
                entity: {foo: "bar"}
            })['catch'](function(e){
                expect(false).toEqual(true);
                done();
            });
        });

        it("denies receipt of unshared permissions", function(done) {
            participant.send({
                dst: participant2.address,
                permissions: {'color': "blue"},
                entity: {foo: "bar"}
            })['catch'](function(){
                expect(false).toEqual(true);
                done();
            });

            expect(participant2.packets.length).toEqual(0);
        });

        it("denies if the recipient doesn't have all permissions", function() {
            participant.send({
                dst: participant2.address,
                permissions: {'perm': "shared", 'color': "blue"},
                entity: {foo: "bar"}
            });

            expect(participant2.packets.length).toEqual(0);
        });

        it("allows a participant to send a packet to require permissions that it doesn't have, itself", function(done) {
            participant2.on("receive", function(packetContext) {
                expect(packetContext.packet.entity).toEqual({foo: "bar"});
                done();
            });
            participant.send({
                dst: participant2.address,
                permissions: {'color': "red"},
                entity: {'foo': "bar"}
            });

        });

    });

});
