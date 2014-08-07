/**
 * Network Integration
 */


describe("data.api integration", function () {
    var client;

    beforeEach(function (done) {
        // current version of jasmine breaks if done() is called multiple times
        // use the called flag to prevent this
        var called = false;

        var clientGen = {
            clientUrl: "http://localhost:14000/integration/additionalOrigin.html"
        };

        generateClient(clientGen, function (clientRef) {
            if (!called) {
                called = true;
                client = clientRef;
                done();
            }
        });
    });

    afterEach(function () {
        if (client) {
            client.remove();
        }
    });


    describe('Common Actions', function () {

        var deletePacket = {
            dst: "data.api",
            action: "delete",
            resource: "/test"
        };
        var setPacket = {
            dst: "data.api",
            action: "set",
            resource: "/test",
            entity: "testData"
        };
        var getPacket = {
            dst: "data.api",
            action: "get",
            resource: "/test"
        };

        beforeEach(function () {

        });

        afterEach(function (done) {
            var called = false;
            client.send(deletePacket, function (reply) {
                if (!called) {
                    called = true;

                    done();
                    // return falsy to stop callback persistance.
                    return null;
                }
            });
        });


        it('Client sets values', function () {
            var called = false;
            var sentPacket;

            var setCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentPacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            sentPacket = client.send(setPacket, setCallback);
        });


        it('Client gets values', function (done) {
            var called = false;
            var sentSetPacket, sentGetPacket;

            var getCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentGetPacket.msgId);
                    expect(reply.entity).toEqual(sentSetPacket.entity);

                    done();
                    return null;
                }
            };

            sentSetPacket = client.send(setPacket, function (reply) {
                sentGetPacket = client.send(getPacket, getCallback);
            });
        });

        it('Client deletes values', function (done) {
            var called = false;
            var sentDeletePacket;
            var deleteCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentDeletePacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            sentDeletePacket = client.send(deletePacket, deleteCallback);
        });


        it('Client watches & un-watches keys', function (done) {
            var called = false;
            var sentWatchPacket, sentUnwatchPacket, sentSetPacket;

            var watchPacket = {
                dst: "data.api",
                action: "watch",
                resource: "/test"
            };

            var unwatchPacket = {
                dst: "data.api",
                action: "unwatch",
                resource: "/test"
            };

            var unwatchCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentUnwatchPacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            var watchCallback = function (reply) {
                if (reply.action === "changed") {
                    expect(reply.replyTo).toEqual(sentWatchPacket.msgId);
                    expect(reply.entity.newValue).toEqual(sentSetPacket.entity);

                    sentUnwatchPacket = client.send(unwatchPacket, unwatchCallback);
                    return null;
                }
                // return truthy to persist callback
                return true;
            };

            sentWatchPacket = client.send(watchPacket, watchCallback);
            sentSetPacket = client.send(setPacket);
        });
    });

    xdescribe('Collection-like Actions', function () {

        var deletePacket = {
            dst: "data.api",
            action: "delete",
            resource: "/test"
        };
        var listPacket = {
            dst: "data.api",
            action: "list",
            resource: "/test"
        };

        var pushPacket = {
            dst: "data.api",
            action: "push",
            resource: "/test",
            entity: 'testData'
        };

        beforeEach(function () {

        });

        afterEach(function (done) {
            var called = false;
            client.send(deletePacket, function (reply) {
                if (!called) {
                    called = true;

                    done();
                    return null;
                }
            });
        });


        it('Client pushes values', function (done) {
            var called = false;
            var sentPushPacket;

            var pushCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentPushPacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            sentPushPacket = client.send(pushPacket, pushCallback);
        });


        it('Client pops values', function (done) {
            var called = false;
            var sentPopPacket, sentPushPacket;

            var pushPacket = {
                dst: "data.api",
                action: "push",
                resource: "/test",
                entity: 'testData'
            };
            var popPacket = {
                dst: "data.api",
                action: "pop",
                resource: "/test"
            };

            var popCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentPopPacket.msgId);
                    expect(reply.action).toEqual('ok');
                    expect(reply.entity).toEqual(sentPushPacket.entity);

                    done();
                    return null;
                }
            };

            var pushCallback = function (reply) {
                sentPopPacket = client.send(popPacket, popCallback);
            };

            sentPushPacket = client.send(pushPacket, pushCallback);

        });


        it('Client lists values', function (done) {
            var called = false;
            var sentListPacket;

            var listCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentListPacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            sentListPacket = client.send(listPacket, listCallback);
        });


        it('Client unshifts values', function () {
            var called = false;
            var sentUnshiftPacket;

            var unshiftPacket = {
                dst: "data.api",
                action: "unshift",
                resource: "/test"
            };

            var unshiftCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentUnshiftPacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            sentUnshiftPacket = client.send(unshiftPacket, unshiftCallback);
        });


        it('shifts values', function () {
            var called = false;
            var sentShiftPacket;

            var shiftPacket = {
                dst: "data.api",
                action: "shift",
                resource: "/test"

            };

            var shiftCallback = function (reply) {
                if (!called) {
                    called = true;

                    expect(reply.replyTo).toEqual(sentShiftPacket.msgId);
                    expect(reply.action).toEqual('ok');

                    done();
                    return null;
                }
            };

            sentShiftPacket = client.send(shiftPacket, shiftCallback);
        });

    });
    describe("Data loading", function(){

        // Same as ozpIwc.apiRoot._links.data.href
        var rootPath = '/api/data/v1/exampleUser';

        it('Populates its data from the ozpIwc.apiRoot specified path', function(done){

            var called = false;

            ozpIwc.util.ajax({
                href: rootPath,
                method: "GET"
            })
                .success(function (data) {
                    var expectedResponses = 0;
                    for( var i =0; i < data._embedded['ozp:dataObjects'].length; i ++){
                        if(data._embedded['ozp:dataObjects'][i].children) {
                            expectedResponses++;
                        }
                        if(data._embedded['ozp:dataObjects'][i].entity) {
                            expectedResponses++;
                        }
                    }

                    for(var i = 0; i < data._embedded['ozp:dataObjects'].length; i++) {
                        var resource =  data._embedded['ozp:dataObjects'][i]._links.self.href.replace(rootPath, '');
                        var expected = data._embedded['ozp:dataObjects'][i];

                        if(expected.children){
                            (function(children){
                                client.send({
                                    dst: "data.api",
                                    action: "list",
                                    resource: resource
                                }, function (reply) {
                                    expectedResponses--;
                                    expect(reply.entity).toEqual(children);
                                    if(expectedResponses === 0 && !called){
                                        console.log('done');
                                        called = true;
                                        done();
                                    }
                                });
                            })(expected.children);
                        }

                        if(expected.entity){
                            (function(entity){
                                client.send({
                                    dst: "data.api",
                                    action: "get",
                                    resource: resource
                                }, function (reply) {
                                    expectedResponses--;
                                    expect(reply.entity).toEqual(entity);
                                    if(expectedResponses === 0 && !called){
                                        called = true;
                                        done();
                                    }
                                });
                            })(expected.entity);
                        }
                    }
                });

        });
    });
});
