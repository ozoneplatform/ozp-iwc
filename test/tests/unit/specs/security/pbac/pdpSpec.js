describe("Policy Decision Point", function () {

    var pdp, policies, utils;
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

    var mockPRP = {
        'getPolicies': function (policyURIs) {
            return ozpIwc.util.AsyncAction.all([ozpIwc.policyAuth.policies['policy/connect']]);
        }
    };

    beforeEach(function () {
        pdp = new ozpIwc.policyAuth.points.PDP({
            'pip': mockPIP,
            'prp': mockPRP
        });
        policies = ozpIwc.policyAuth.policies;
        utils = ozpIwc.policyAuth.points.utils;
    });

    describe("Permission", function () {
        var request = {
            subject: "urn:subjectId:fake",
            resource: "urn:resourceId:fake",
            action: "write",
            policies: ['policy://policy/fake']
        };

        it("permits", function () {
            pdp.prp.getPolicies = function () {
                return new ozpIwc.util.AsyncAction().resolve("success", [policies.permitAll]);
            };

            pdp.isPermitted(request).success(function (response) {
                expect(response.result).toEqual("Permit");
                expect(response.request).toEqual(request);
                expect(response.formattedRequest).toBeDefined();
            }).failure(function (response) {
                expect(false).toEqual(true);
            });
        });

        it("denies", function () {
            pdp.prp.getPolicies = function () {
                return new ozpIwc.util.AsyncAction().resolve("success", [policies.denyAll]);
            };

            pdp.isPermitted(request)
                .success(function (response) {
                    expect(false).toEqual(true);
                }).failure(function (response) {
                    expect(response.result).toEqual("Deny");
                    expect(response.request).toEqual(request);
                    expect(response.formattedRequest).toBeDefined();
                });
        });
    });

});