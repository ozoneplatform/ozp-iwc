describe("Policy Auth Point Utils", function () {

    var request, utils;
    var mockPIP = {
        'getAttributes': function (id) {
            var obj = this.attributes[id] || {};
            return new ozpIwc.util.AsyncAction().resolve("success", obj);
        },
        'attributes': {
            'urn:subjectId:1': {
                'ozp:iwc:fakeAttribute1': ['fakeVal']
            },
            'urn:subjectId:2': {
                'ozp:iwc:fakeAttribute2': ['fakeVal']
            },
            'urn:subjectId:3': {
                'ozp:iwc:fakeAttribute3': ['fakeVal'],
                'ozp:iwc:fakeAttributea': ['afakeVal']
            },
            'urn:subjectId:4': {
                'ozp:iwc:fakeAttribute3': ['fakeVal'],
                'ozp:iwc:fakeAttributeb': ['bfakeVal']
            }
        }
    };


    beforeEach(function () {
        utils = ozpIwc.policyAuth.points.utils;
        request = {
            combiningAlgorithm: "deny-overrides"
        };
    });

    describe("Request formatting", function () {
        describe("subject", function () {
            var categoryId = "subject";

            it("formats an undefined subject", function (done) {
                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({});
                        done();
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats an empty subject object", function (done) {
                request.subject = {};

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({});
                        done();
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });
            it("formats an empty subject array", function (done) {
                request.subject = [];

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({});
                        done();
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("gets attributes from the PIP if a URN string is provided", function () {
                request.subject = 'urn:subjectId:1';
                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            'ozp:iwc:fakeAttribute1': ['fakeVal']
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("gets attributes from the PIP if an array of URNs are provided", function () {
                request.subject = ['urn:subjectId:1', 'urn:subjectId:2'];

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        var subject = formattedRequest.category[categoryId];
                        expect(subject['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                        expect(subject['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats a subject from an object", function () {
                request.subject = {
                    'urn:subjectId:1': 1,
                    'urn:subjectId:2': true,
                    'urn:subjectId:3': "string",
                    'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                };

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        var subject = formattedRequest.category[categoryId];
                        expect(subject).toBeDefined();
                        expect(subject['urn:subjectId:1']).toEqual([1]);
                        expect(subject['urn:subjectId:2']).toEqual([true]);
                        expect(subject['urn:subjectId:3']).toEqual(["string"]);
                        expect(subject['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);

                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats a subject from an  array of objects", function () {
                request.subject = [
                    {
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true
                    },
                    {
                        'urn:subjectId:3': "string",
                        'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                    }
                ];

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        var subject = formattedRequest.category[categoryId];
                        expect(subject).toBeDefined();
                        expect(subject['urn:subjectId:1']).toEqual([1]);
                        expect(subject['urn:subjectId:2']).toEqual([true]);
                        expect(subject['urn:subjectId:3']).toEqual(["string"]);
                        expect(subject['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats a subject from a mixed array", function () {
                request.subject = [
                    {
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true,
                        'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                    },
                    'urn:subjectId:3'
                ];

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        var subject = formattedRequest.category[categoryId];
                        expect(subject).toBeDefined();
                        expect(subject['urn:subjectId:1']).toEqual([1]);
                        expect(subject['urn:subjectId:2']).toEqual([true]);
                        expect(subject['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);
                        expect(subject['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                        expect(subject['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });
        });

        describe("resource", function () {
            var categoryId = "resource";
            it("formats an undefined resource", function () {
                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({});
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats an empty resource object", function () {
                request.resource = {};
                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({});
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });
            it("formats an empty resource array", function () {
                request.resource = [];
                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({});
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("gets attributes from the PIP if a URN string is provided", function () {
                request.resource = 'urn:subjectId:1';

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("gets a resource from the PIP if a string is provided", function () {
                request = 'urn:subjectId:1';

                utils.formatRequest(request).success(function (formattedRequest) {
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:fakeAttribute1': ["fakeVal"]
                    });
                });
            });

            it("formats a resource from an object", function () {
                request.resource = {
                    'urn:subjectId:1': 1,
                    'urn:subjectId:2': true,
                    'urn:subjectId:3': "string",
                    'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                };

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        var resource = formattedRequest.category[categoryId];
                        expect(resource).toBeDefined();
                        expect(resource['urn:subjectId:1']).toEqual([1]);
                        expect(resource['urn:subjectId:2']).toEqual([true]);
                        expect(resource['urn:subjectId:3']).toEqual(["string"]);
                        expect(resource['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats a resource from a mixed array", function () {
                request.resource = {
                    'urn:subjectId:1': 1,
                    'urn:subjectId:2': true,
                    'urn:subjectId:3': "string",
                    'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                };

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        var resource = formattedRequest.category[categoryId];
                        expect(resource).toBeDefined();
                        expect(resource['urn:subjectId:1']).toEqual([1]);
                        expect(resource['urn:subjectId:2']).toEqual([true]);
                        expect(resource['urn:subjectId:3']).toEqual(["string"]);
                        expect(resource['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });
        });
        describe("action", function () {
            var categoryId = "action";
            it("formats an undefined action", function () {
                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            'ozp:iwc:action': []
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats an empty action object", function () {
                request.action = {};

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            'ozp:iwc:action': []
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats an empty action array", function () {
                request.action = [];

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            'ozp:iwc:action': []
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats an action if a string is provided", function () {
                request.action = 'write';

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            "ozp:iwc:action": ["write"]
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

            it("formats an action if an array of strings is provided", function () {
                request.action = ['write', 'read'];

                utils.formatRequest(request, mockPIP)
                    .success(function (formattedRequest) {
                        expect(formattedRequest.category[categoryId]).toEqual({
                            "ozp:iwc:action": ["write", "read"]
                        });
                    })
                    .failure(function (err) {
                        expect(err).not.toHappen();
                    });
            });

        });

        it("formats an entire request", function () {
            request.subject = "urn:subjectId:1";
            request.resource = "urn:subjectId:1";
            request.action = "write";
            request.policies = ['urn:policyId:1', 'urn:policyId:2'];

            utils.formatRequest(request, mockPIP)
                .success(function (formattedRequest) {
                    expect(formattedRequest.category).toEqual({
                        "subject": {
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        },
                        "resource": {
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        },
                        "action": {
                            "ozp:iwc:action": ["write"]
                        }
                    });
                    expect(formattedRequest.combiningAlgorithm).toEqual("deny-overrides");
                    expect(formattedRequest.policies).toEqual(['urn:policyId:1', 'urn:policyId:2']);
                })
                .failure(function (err) {
                    expect(err).not.toHappen();
                });
        });
    });

    describe("attribute formatting", function () {
        it("gathers a categories attributes from the PIP if given as a string", function () {
            utils.formatAttribute('urn:subjectId:1', mockPIP)
                .success(function (category) {
                    expect(category['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                })
                .failure(function (err) {
                    expect(err).not.toHappen();
                });
        });

        it("gathers a categories attributes from the PIP if given as an array", function () {
            utils.formatAttribute(['urn:subjectId:1', 'urn:subjectId:2'], mockPIP)
                .success(function (category) {
                    expect(category['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(category['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                })
                .failure(function (err) {
                    expect(err).not.toHappen();
                });
        });

        it("gathers multiple categories in an object with a URI given as a string", function () {
            request.subject = 'urn:subjectId:1';
            request.resource = 'urn:subjectId:2';
            utils.formatCategories(request, mockPIP)
                .success(function (categories) {
                    expect(categories.subject['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(categories.resource['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                })
                .failure(function (err) {
                    expect(err).not.toHappen();
                });
        });


        it("gathers multiple categories in an object with  URIs given as an Array", function () {
            utils.formatCategories({
                "subject": ['urn:subjectId:1', 'urn:subjectId:2'],
                "resource": ['urn:subjectId:1', 'urn:subjectId:2', 'urn:subjectId:3']
            }, mockPIP)
                .success(function (category) {
                    expect(category.subject['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                    expect(category.subject['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(category.resource['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(category.resource['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(category.resource['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                    expect(category.resource['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                })
                .failure(function (err) {
                    expect(err).not.toHappen();
                });

        });
    });

})
;