describe("Endpoint Registry", function () {
    var responses = {
        '/api': {
            '_links': {
                "ozp:user-data": {'href': "data/v1"},
                "intents": {'href': "intents/v1"},
                "applications": {'href': "applications/v2"},
                "template": {'href': "https://example.com/{foo}", type: "application/json", templated: true}

            }
        },
        'foo/bar': {'_links': []}
    };
    var ajaxQueue = new ozpIwc.util.AjaxPersistenceQueue();

    beforeEach(function () {
        spyOn(ozpIwc.util, "ajax").and.callFake(function (config) {
            return Promise.resolve({
                response: responses[config.href]
            });
        });
    });

    it("Requires an ajaxQueue ", function () {
        try {
            new ozpIwc.api.EndpointRegistry();
        } catch (e) {
            expect(e).toEqual("Endpoints require AjaxPersistenceQueue.");
        }
    });

    pit("loads the API from the default root", function () {
        return new ozpIwc.api.EndpointRegistry({ajaxQueue: ajaxQueue}).loadPromise.then(function () {
            expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href': "/api", 'method': "GET"}));
        });
    });

    pit("loads the API from a specified root", function () {
        return new ozpIwc.api.EndpointRegistry({
            ajaxQueue: ajaxQueue,
            'apiRoot': "foo/bar"
        }).loadPromise.then(function () {
            expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href': "foo/bar"}));
        });
    });

    pit("contains the linked endpoints", function () {
        var e = new ozpIwc.api.EndpointRegistry({ajaxQueue: ajaxQueue});
        return e.loadPromise.then(function () {
            expect(e.endpoint("data")).toBeDefined();
            expect(e.endpoint("intents")).toBeDefined();
            expect(e.endpoint("applications")).toBeDefined();
        });
    });

    pit("contains the linked templates", function () {
        var e = new ozpIwc.api.EndpointRegistry({ajaxQueue: ajaxQueue});
        return e.loadPromise.then(function () {
            expect(e.template.template.href).toEqual("https://example.com/{foo}");
            expect(e.template.template.type).toEqual("application/json");
        });
    });

    [["data", "data/foo/bar", "data/foo/bar"],
        ["applications", "applications/1/2/3/4", "applications/1/2/3/4"],
        ["ozp:user-data", "", "data/v1"],
        ["ozp:user-data", "/", "data/v1"]
    ].forEach(function (d) {
            pit("endpoint " + d[0] + " gets " + d[1] + " from " + d[2], function () {
                var e = new ozpIwc.api.EndpointRegistry({ajaxQueue: ajaxQueue});

                var point = e.endpoint(d[0]);
                point.baseUrl = d[0];
                return point.get(d[1]).then(function () {
                    expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                        'href': d[2],
                        'method': "GET"
                    }));
                });
            });
        });

});