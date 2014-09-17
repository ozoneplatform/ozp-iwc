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
//        participant=new ozpIwc.test.MockParticipant({
//            clientUrl: "http://localhost:14001",
//            'client': client
//        });

        var gate=doneSemaphore(1,done);

//        participant.on("connected",gate);
        client.on("connected",gate);
    });

    afterEach(function() {
        client.disconnect();
        if(participant) {
            participant.close();
        }
    });

    var registerEntity={
        type: "text/plain",
        action: "view",
        icon: "http://example.com/view-text-plain.png",
        label: "View Plain Text",
        invokeIntent: "system.api/application/123-412"
    };


    it('registers handlers', function (done) {

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
    
    it('uses sane defaults to register handlers', function (done) {

        client.api('intents.api').register('/text/plain/view', {
            contentType: "application/ozpIwc-intents-handler-v1+json",
            entity: {
                type: "text/plain",
                action: "view",
                icon: "http://example.com/view-text-plain.png",
                label: "View Plain Text"
            }
        }).then(function (reply) {
            expect(reply.response).toEqual('ok');
            expect(reply.entity.resource).toMatch('/text/plain/view');
            return client.api('intents.api').get(reply.entity.resource);
        }).then(function(reply) {
            expect(reply.response).toEqual("ok");
            expect(reply.entity.invokeIntent).toBeDefined();
            expect(reply.entity.invokeIntent).toEqual(
                jasmine.objectContaining({
                    'dst': client.address,
                    'resource': "/intents/text/plain/view",
                    'action' : "invoke"
                })
            );
            done();
        }).catch(function (error) {
            console.error(error);
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
    
    it('invokes handler directly', function (done) {
        var notDone=true;
        client.on("receive",function(packet) {
            if(notDone && packet.action==="intentsInvocation") {
              console.log("Handler received packet ",packet);  
              expect(packet.entity).toEqual("This is some text");
              expect(packet.contentType).toEqual("text/plain");
              expect(packet.resource).toEqual("/text/plain/view");
              notDone=false;
              done();
            }
        });
        
        
       client.api('intents.api').register('/text/plain/view', {
            contentType: "application/ozpIwc-intents-handler-v1+json",
            entity: {
                type: "text/plain",
                action: "view",
                icon: "http://example.com/view-text-plain.png",
                label: "View Plain Text",
                invokeIntent: {
                    dst: client.address,
                    resource: "/text/plain/view",
                    action: "intentsInvocation"
                }
            }
        }).then(function (reply) {
            console.log("Handler is registered: ",reply);
            expect(reply.response).toEqual('ok');
            expect(reply.entity.resource).toMatch('/text/plain/view');

            return client.api('intents.api').invoke(reply.entity.resource, {
                contentType: "text/plain",
                entity: "This is some text"
            });
        }).catch(function (error) {
            console.log("Error registering handler: ",error);
            expect(error).toEqual('');
            done();
        });
    });
    
});
