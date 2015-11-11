describe("Supplied ABAC policies", function () {
    var policies;

    beforeEach(function () {
        policies = ozpIwc.policyAuth.policies;
    });

    describe("permit when object has no attributes", function () {
        it("permits with trivial request", function () {
            var request = {
                'subject': {},
                'object': {}
            };
            expect(policies.permitWhenObjectHasNoAttributes(request)).toEqual("Permit");
        });
        it("permits when the subject has an attribute", function () {
            var request = {
                'subject': {
                    'a': 1
                },
                'object': {}
            };
            expect(policies.permitWhenObjectHasNoAttributes(request)).toEqual("Permit");
        });
        it("defers when the object has an attribute", function () {
            var request = {
                'subject': {
                    'a': 1
                },
                'object': {
                    'a': 1
                }
            };
            expect(policies.permitWhenObjectHasNoAttributes(request)).toEqual("Undetermined");
        });
    });

    describe("subject has all object attributes", function () {
        it("permits with trivial request", function () {
            var request = {
                'subject': {},
                'object': {}
            };
            expect(policies.subjectHasAllObjectAttributes(request)).toEqual("Permit");
        });
        it("permits when the object has no attributes", function () {
            var request = {
                'subject': {
                    'a': 1
                },
                'object': {}
            };
            expect(policies.subjectHasAllObjectAttributes(request)).toEqual("Permit");
        });
        it("permits when the attributes match", function () {
            var request = {
                'subject': {
                    'a': 1
                },
                'object': {
                    'a': 1
                }
            };
            expect(policies.subjectHasAllObjectAttributes(request)).toEqual("Permit");
        });
        it("denies when the attributes don't match", function () {
            var request = {
                'subject': {
                    'a': 1
                },
                'object': {
                    'a': 2
                }
            };
            expect(policies.subjectHasAllObjectAttributes(request)).toEqual("Deny");
        });
        it("permits when subject has all object attributes", function () {
            var request = {
                'subject': {
                    'a': 1,
                    'b': 2
                },
                'object': {
                    'a': 1
                }
            };
            expect(policies.subjectHasAllObjectAttributes(request)).toEqual("Permit");
        });
        it("denies when subject has a subset of object attributes", function () {
            var request = {
                'subject': {
                    'a': 1
                },
                'object': {
                    'a': 1,
                    'b': 2
                }
            };
            expect(policies.subjectHasAllObjectAttributes(request)).toEqual("Deny");
        });
    });
});