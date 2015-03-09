describe("URL Template Tool", function() {
    var cases = {
        "/{element1}": {
            "/foo": {element1: "foo"},
            "/foo/bar": null
        },
        "/foo/{element1}": {
            "/foo/bar": {element1: "bar"},
            "/bar/foo": null
        },
        "/{element1}/{element2}": {
            "/foo/bar": {element1: "foo", element2: "bar"},
            "/foo/123": {element1: "foo", element2: "123"},
            "/foo/bar/": null
        },
        "/{element1}/{element2:\\d+}": {
            "/foo/bar": null,
            "/foo/123": {element1: "foo", element2: "123"},
            "/foo/123abc": null
        },
        "/{element1}/{element2:\\d+}/sample": {
            "/foo/123/sample": {element1: "foo", element2: "123"},
            "/foo/123": null,
            "/foo/123abc/sample": null
        }

    };

    /* jshint loopfunc:true */
    Object.keys(cases).forEach(function(pattern) {
        describe("Pattern " + pattern, function() {
            var template = ozpIwc.packetRouter.uriTemplate(pattern);
            var tests = cases[pattern];
            Object.keys(tests).forEach(function(uri) {
                it("handles " + uri, function() {
                    expect(template(uri)).toEqual(tests[uri]);
                });
            });
        });
    });
});

describe("Packet Routing", function() {
    var router;
    beforeEach(function() {
        router=new ozpIwc.PacketRouter();
    });
    
    describe("basic, single routes",function() {
        var receivedPacket=false;
        
        beforeEach(function() {
            receivedPacket=undefined;
            router.declareRoute({
                action: "get",
                resource: "/"
            }, function(packet) {
                receivedPacket=packet;
            });
        });
        
        it("routes based on action", function() {
            expect(router.routePacket({
                action: "get",
                resource: "/"
            })).toEqual(true);
            expect(receivedPacket).toBeDefined();
        });
        
        it("doesn't route an unmatched action", function() {
            expect(router.routePacket({
                action: "set",
                resource: "/"
            })).toEqual(false);
            expect(receivedPacket).not.toBeDefined();
        });
        
        it("doesn't route an unmatched resource", function() {
            expect(router.routePacket({
                action: "get",
                resource: "/foo"
            })).toEqual(false);
            expect(receivedPacket).not.toBeDefined();
        });
    });
    describe("multiple routes with same action, multiple templated non-regex resources",function() {
        // three variables just to make sure multiple actions are being invoked
        var rootPacket;
        var idPacket;
        var doublePathPacket;
        var pathParameters;
        beforeEach(function() {
            rootPacket=undefined;
            idPacket=undefined;
            doublePathPacket=undefined;
            pathParameters=undefined;
            
            router.declareRoute({
                action: "get",
                resource: "/"
            }, function(packet,params) {
                rootPacket=packet;
                pathParameters=params;
            });
            router.declareRoute({
                action: "get",
                resource: "/{id}"
            }, function(packet,params) {
                idPacket=packet;
                pathParameters=params;
            });
            router.declareRoute({
                action: "get",
                resource: "/{id}/{subId}"
            }, function(packet,params) {
                doublePathPacket=packet;
                pathParameters=params;
            });
        });
        
        it("routes to the root path", function() {
            expect(router.routePacket({
                action: "get",
                resource: "/"
            })).toEqual(true);
            expect(rootPacket).toBeDefined();
            expect(idPacket).not.toBeDefined();
            expect(doublePathPacket).not.toBeDefined();
            expect(pathParameters).toEqual({});
        });
        
        it("routes to the id path with the right path parameter", function() {
            expect(router.routePacket({
                action: "get",
                resource: "/1234"
            })).toEqual(true);
            expect(rootPacket).not.toBeDefined();
            expect(idPacket).toBeDefined();
            expect(doublePathPacket).not.toBeDefined();
            expect(pathParameters).toEqual({'id':"1234"});
        });
        
        it("routes with two patterns with the right path parameters", function() {
            expect(router.routePacket({
                action: "get",
                resource: "/1234/foo"
            })).toEqual(true);
            expect(rootPacket).not.toBeDefined();
            expect(idPacket).not.toBeDefined();
            expect(doublePathPacket).toBeDefined();
            expect(pathParameters).toEqual({'id':"1234",'subId':"foo"});
        });
    });
    
    describe("uses template regexes properly",function() {
        it("template declared before static path",function(){
            router.declareRoute({
                action: "get",
                resource: "/{id:\\d+}"
            },function(packet,params) {
            });
            
            expect(router.routePacket({
                action: "get",
                resource: "/1234"
            })).toEqual(true);
            expect(router.routePacket({
                action: "get",
                resource: "/foo"
            })).toEqual(false);
        });
        it("template can eat multiple path segments",function(){
            router.declareRoute({
                action: "get",
                resource: "/{id:\\d+/\\d+}/bar"
            },function(packet,params) {
                expect(params).toEqual({id:"1234/5678"});
            });
            
            expect(router.routePacket({
                action: "get",
                resource: "/1234/5678/bar"
            })).toEqual(true);
            expect(router.routePacket({
                action: "get",
                resource: "/1234/foo/bar"
            })).toEqual(false);
            expect(router.routePacket({
                action: "get",
                resource: "/foo/5678/bar"
            })).toEqual(false);
        });
    });
    
    describe("multiple routes with multiple actions, same templated non-regex resource",function() {
        var handler;
        
        var pathParameters;
        beforeEach(function() {
            handler=undefined;
            pathParameters=undefined;
            
            router.declareRoute({
                action: "get",
                resource: "/{id}"
            }, function(packet,params) {
                handler="get";
                pathParameters=params;
            });
            router.declareRoute({
                action: "set",
                resource: "/{id}"
            }, function(packet,params) {
                handler="set";
                pathParameters=params;
            });
            router.declareRoute({
                action: "delete",
                resource: "/{id}"
            }, function(packet,params) {
                handler="delete";
                pathParameters=params;
            });
        });
        
        it("routes the first handler", function() {
            expect(router.routePacket({
                action: "get",
                resource: "/1234"
            })).toEqual(true);
            expect(handler).toEqual("get");
            expect(pathParameters).toEqual({'id':"1234"});
        });
        
        it("routes the middle handler", function() {
            expect(router.routePacket({
                action: "set",
                resource: "/1234"
            })).toEqual(true);
            expect(handler).toEqual("set");
            expect(pathParameters).toEqual({'id':"1234"});
        });
        
        it("routes the last handler", function() {
            expect(router.routePacket({
                action: "delete",
                resource: "/1234"
            })).toEqual(true);
            expect(handler).toEqual("delete");
            expect(pathParameters).toEqual({'id':"1234"});
        });
    });
    describe("prioritizes routes by the order that they are declared",function() {
        it("template declared before static path",function(){
            router.declareRoute({
                action: "get",
                resource: "/{id}"
            },function(packet,params) {
            });
            router.declareRoute({
                action: "get",
                resource: "/1234"
            },function(packet,params) {
                expect(packet).toEqual("sent to other handler");
            });
            expect(router.routePacket({
                action: "get",
                resource: "/1234"
            })).toEqual(true);
        });
        it("static path declared before template",function(){
            router.declareRoute({
                action: "get",
                resource: "/1234"
            },function(packet,params) {
            });
            router.declareRoute({
                action: "get",
                resource: "/{id}"
            },function(packet,params) {
                expect(packet).toEqual("sent to other handler");
            });
            expect(router.routePacket({
                action: "get",
                resource: "/1234"
            })).toEqual(true);
        });
    });
});