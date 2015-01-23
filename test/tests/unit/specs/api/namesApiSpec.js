describe("Names API",function() {

	var namesApi;
    
	beforeEach(function() {
		namesApi=new ozpIwc.NamesApi({
			'participant': new TestParticipant()
		});
	});

	afterEach(function() {
		namesApi=null;
	});

    it("responds with badResource for arbitrary resources",function(done) {
        var context=new TestPacketContext({
            'leaderState': "leader",
            'packet': {
                'resource': "/doesNotExist",
                'action': "get",
                'msgId' : "1234",
                'src' : "srcParticipant"
            }
        });
        namesApi.routePacket(context).then(function(){
            expect(context.responses[0].response).toEqual("badResource");
            done();
        });
    });
    [ {
            'resource': "/address",
            'contentType' : "application/vnd.ozp-iwc-address-list-v1+json"
      },{
            'resource': "/multicast",
            'contentType' : "application/vnd.ozp-iwc-multicast-list-v1+json"
      },{
            'resource': "/router",
            'contentType' : "application/vnd.ozp-iwc-router-list-v1+json"
      }   
    ].forEach(function(r) {
            describe("Resource tree root " + r.resource, function (done) {
                it("exists", function () {
                    var context = new TestPacketContext({
                        'leaderState': "leader",
                        'packet': {
                            'resource': r.resource,
                            'action': "get",
                            'msgId': "1234",
                            'src': "srcParticipant"
                        }
                    });
                    namesApi.routePacket(context).then(function(){
                        expect(context.responses[0].response).toEqual("ok");
                        expect(context.responses[0].entity).toEqual([]);
                        expect(context.responses[0].contentType).toEqual(r.contentType);
                        done();
                    });
                });
            });
        });
        describe("Resource tree root /api",function(){
            it("exists",function(){
                var context = new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': '/api',
                        'action': "get",
                        'msgId': "1234",
                        'src': "srcParticipant"
                    }
                });
                namesApi.routePacket(context).then(function(done){
                    expect(context.responses[0].response).toEqual("ok");
                    expect(context.responses[0].entity).toEqual([
                        "/api/data.api",
                        "/api/intents.api",
                        "/api/names.api",
                        "/api/system.api"
                    ]);
                    expect(context.responses[0].contentType).toEqual("application/vnd.ozp-iwc-api-list-v1+json");
                    done();
                });
            })
        });
        [ {
            'resource': "/address",
            'contentType' : "application/vnd.ozp-iwc-address-v1+json",
            'listContentType' : "application/vnd.ozp-iwc-address-list-v1+json"
        },{
            'resource': "/multicast",
            'contentType' : "application/vnd.ozp-iwc-multicast-address-v1+json",
            'listContentType' : "application/vnd.ozp-iwc-multicast-list-v1+json"
        },{
            'resource': "/api",
            'contentType' : "application/vnd.ozp-iwc-api-v1+json",
            'listContentType' : "application/vnd.ozp-iwc-api-list-v1+json"
        },{
            'resource': "/router",
            'contentType' : "application/vnd.ozp-iwc-router-v1+json",
            'listContentType' : "application/vnd.ozp-iwc-router-list-v1+json"
        }
        ].forEach(function(r) {
        describe("Resource tree " + r.resource, function (done) {
            it("responds with noPermission when attempting to set",function() {
                var context=new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': r.resource,
                        'action': "set",
                        'msgId' : "1234",
                        'src' : "srcParticipant",
                        'entity' : { 'foo' : 1 }
                    }
                });
                namesApi.routePacket(context).then(function(){
                    expect(context.responses[0].response).toEqual("noPermission");
                    done();
                });
            });
            it("allows  " + r.contentType + " when setting a value in the tree",function(done) {
                var context=new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': r.resource + "/testValue",
                        'contentType': r.contentType,
                        'action': "set",
                        'msgId' : "1234",
                        'src' : "srcParticipant",
                        'entity' : { 'foo' : 1 }
                    }
                });
                namesApi.routePacket(context).then(function(){
                    expect(context.responses[0].response).toEqual("ok");
                    done();
                });
            });
            it("updates the collection  when setting a value in the tree",function(done) {
                var contextA = new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': r.resource + "/testValue",
                        'contentType': r.contentType,
                        'action': "set",
                        'msgId' : "1234",
                        'src' : "srcParticipant",
                        'entity' : { 'foo' : 1 }
                    }
                });
                var contextB = new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': r.resource,
                        'action': "get",
                        'msgId' : "1234",
                        'src' : "srcParticipant"
                    }
                });
                namesApi.routePacket(contextA)
                    .then(namesApi.routePacket(contextB))
                    .then(function() {
                        expect(contextB.responses[0].response).toEqual("ok");
                        expect(contextB.responses[0].entity).toContain(r.resource + "/testValue");
                        expect(contextB.responses[0].contentType).toEqual(r.listContentType);
                        done();
                    });
                
            });
            it("responds with badContent when missing the contentType",function(done) {
                var context=new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': r.resource + "/testValue",
                        'action': "set",
                        'msgId' : "1234",
                        'src' : "srcParticipant",
                        'entity' : { 'foo' : 1 }
                    }
                });
                namesApi.routePacket(context).then(function(){
                    expect(context.responses[0].response).toEqual("badContent");
                    done();
                });
            });

            it("responds with badContent with invalid contentType",function(done) {
                var context=new TestPacketContext({
                    'leaderState': "leader",
                    'packet': {
                        'resource': r.resource + "/testValue",
                        'action': "set",
                        'contentType': r.contentType+"+xml",
                        'msgId' : "1234",
                        'src' : "srcParticipant",
                        'entity' : { 'foo' : 1 }
                    }
                });
                namesApi.routePacket(context).then(function(){
                    expect(context.responses[0].response).toEqual("badContent");
                    done();
                });
            });

        });
    });


});