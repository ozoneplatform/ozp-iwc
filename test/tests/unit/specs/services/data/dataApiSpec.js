describe("Data API data loading", function () {
    var dataApi;
    var endpoint;

    var data = {
        "http://example.com/data/1": {
            response: {
                _links: {
                    self: {
                        type: "application/vnd.ozp-iwc-data-object+json;version=1",
                        href: "http://example.com/data/1"
                    }
                }
            },
            header: {
                'Content-Type': "application/vnd.ozp-iwc-data-object+json;version=1",
            },
            url: "http://example.com/data/1"
        },
        "http://example.com/data/2": {
            response: {
                _links: {
                    self: {href: "http://example.com/data/2"}
                }
            },
            header: {
                'Content-Type': "application/vnd.ozp-iwc-data-object+json;version=2"
            },
            url: "http://example.com/data/2"
        }
    };
    data["/"] = {
        response: {
            _links: {
                item: Object.keys(data).map(function (k) {
                    return data[k].response._links.self;
                })
            },
            _embedded: {
                item: []
            }
        },
        header: {
            'Content-Type': "application/json"
        }
    };

    beforeEach(function () {
        var fakeRouter = new FakeRouter();
        dataApi = new ozpIwc.api.data.Api({
            authorization: ozpIwc.wiring.authorization,
            'participant': new TestClientParticipant({
                authorization: ozpIwc.wiring.authorization,
                router: fakeRouter
            }),
            'name': "testData.api",
            'router': fakeRouter,
            'ajaxQueue': new ozpIwc.util.AjaxPersistenceQueue()
        });
        dataApi.isRequestQueueing = false;

        endpoint = jasmine.createSpyObj('endpoint', ['get', 'put', 'delete']);
        ozpIwc.api.endpoint = function () { return endpoint; };
        endpoint.get.and.callFake(function (url) {
            return Promise.resolve(data[url]);
        });

    });

    pit("fetches data from the server", function () {
        return dataApi.transitionToLoading().then(function () {
            expect(endpoint.get).toHaveBeenCalledWith("/", []);
            expect(endpoint.get).toHaveBeenCalledWith("http://example.com/data/1", [{name: "Accept", value: "application/vnd.ozp-iwc-data-object+json;version=1"}]);
            expect(endpoint.get).toHaveBeenCalledWith("http://example.com/data/2", []);
        });

    });
});