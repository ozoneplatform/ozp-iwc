/**
 * Network Integration
 */


describe("Intents API", function () {
    var client;
    var participant;

    beforeEach(function(done) {
        client=new ozpIwc.Client({
            peerUrl: "http://localhost:14002"
        });
        participant=new ozpIwc.test.MockParticipant({
            clientUrl: "http://localhost:14001",
            'client': client
        });

        var gate=done_semaphore(2,done);

        participant.on("connected",gate);
        client.on("connected",gate);
    });

    afterEach(function() {
        client.disconnect();
        participant.close();
    });

    var registerEntity={
        type: "text/plain",
        action: "view",
        icon: "http://example.com/view-text-plain.png",
        label: "View Plain Text",
        invokeIntent: "system.api/application/123-412"
    };

    var setEntity={
        label: 'changed label',
        invokeIntent: 'changed invokeIntent',
        icon: 'www.changed.icon/icon.png',
        action: 'changed action',
        type: 'changed type'
    };

    it('registers handlers', function (done) {
        var called = false;

        client.api('intents.api').register('/text/plain/view', {
            contentType: "application/ozpIwc-intents-handler-v1+json",
            entity: registerEntity
        }).then(function (reply) {
            expect(reply.response).toEqual('ok');
            expect(reply.entity.resource).toMatch('/text/plain/view');
            done();
        })
        .catch(function (error) {
            expect(error).toEqual('');
            done();
        });
    });

    it('deletes handlers', function (done) {
        client.api('intents.api').register('/text/plain/view',{
            contentType: "application/ozpIwc-intents-handler-v1+json",
            entity: registerEntity
        }).then(function(reply) {
            return client.api('intents.api').delete(reply.entity.resource);
        }).then(function(reply) {
            expect(reply.response).toEqual('ok');
        }).catch(function(error) {
            expect(error).toEqual('');
        }).then(done,done);

    });


});
