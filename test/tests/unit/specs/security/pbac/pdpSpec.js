describe("Policy Decision Point",function() {

    var pdp;
    var mockPIP = {
        'getAttributes': function (id) {
            var obj = this.informationCache[id] || {};
            return new ozpIwc.AsyncAction().resolve("success", obj);
        },
        'informationCache' : {
            'urn:subjectId:1': {
                'ozp:iwc:fakeAttribute1' : ['fakeVal']
            },
            'urn:subjectId:2': {
                'ozp:iwc:fakeAttribute2' : ['fakeVal']
            },
            'urn:subjectId:3': {
                'ozp:iwc:fakeAttribute3' : ['fakeVal'],
                'ozp:iwc:fakeAttributea' : ['afakeVal']
            },
            'urn:subjectId:4': {
                'ozp:iwc:fakeAttribute3' : ['fakeVal'],
                'ozp:iwc:fakeAttributeb' : ['bfakeVal']
            }
        }
    };

    var mockPRP = {
        'getPolicies': function(policyURIs){
            return ozpIwc.AsyncAction.all([mockPolicies['policy/connectPolicy.json']]);
        }
    };

    beforeEach(function(){
        pdp = new ozpIwc.policyAuth.PDP({
            'pip': mockPIP,
            'prp': mockPRP
        });
    });
    describe("Request formatting",function(){
        describe("subject",function(){
            var categoryId = "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject";
            it("formats an empty subject",function(){
                pdp.formatRequest({}).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId])
                        .toEqual({});
                });

                pdp.formatRequest({
                    'subject': {}
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId])
                        .toEqual({});
                });

                pdp.formatRequest({
                    'subject': []
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId])
                        .toEqual({});
                });
            });

            it("gets attributes from the PIP if a URN string is provided",function(){
                pdp.formatRequest({
                    'subject': 'urn:subjectId:1'
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:fakeAttribute1' : ['fakeVal']
                    });
                });
            });

            it("gets attributes from the PIP if an array of URNs are provided",function(){
                pdp.formatRequest({
                    'subject': ['urn:subjectId:1','urn:subjectId:2']
                }).success(function(formattedRequest){
                    var subject = formattedRequest.category[categoryId];
                    expect(subject['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(subject['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                });
            });

            it("formats a subject from an object", function(){
                pdp.formatRequest({
                    'subject': {
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true,
                        'urn:subjectId:3': "string",
                        'urn:subjectId:4': ['a','r','r','a','y']
                    }
                }).success(function(formattedRequest){
                    var subject = formattedRequest.category[categoryId];
                    expect(subject).toBeDefined();
                    expect(subject['urn:subjectId:1']).toEqual([1]);
                    expect(subject['urn:subjectId:2']).toEqual([true]);
                    expect(subject['urn:subjectId:3']).toEqual(["string"]);
                    expect(subject['urn:subjectId:4']).toEqual(['a','r','r','a','y']);

                })
            });

            it("formats a subject from an  array of objects", function(){
                pdp.formatRequest({
                    'subject': [
                        {
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true
                        },
                        {
                        'urn:subjectId:3': "string",
                        'urn:subjectId:4': ['a','r','r','a','y']
                        }
                    ]
                }).success(function(formattedRequest){
                    var subject = formattedRequest.category[categoryId];
                    expect(subject).toBeDefined();
                    expect(subject['urn:subjectId:1']).toEqual([1]);
                    expect(subject['urn:subjectId:2']).toEqual([true]);
                    expect(subject['urn:subjectId:3']).toEqual(["string"]);
                    expect(subject['urn:subjectId:4']).toEqual(['a','r','r','a','y']);
                })
            });
            it("formats a subject from a mixed array", function(){
                pdp.formatRequest({
                    'subject': [{
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true,
                        'urn:subjectId:4': ['a','r','r','a','y']
                    },'urn:subjectId:3']
                }).success(function(formattedRequest){
                    var subject = formattedRequest.category[categoryId];
                    expect(subject).toBeDefined();
                    expect(subject['urn:subjectId:1']).toEqual([1]);
                    expect(subject['urn:subjectId:2']).toEqual([true]);
                    expect(subject['urn:subjectId:4']).toEqual(['a','r','r','a','y']);
                    expect(subject['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                    expect(subject['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);

                })
            });
        });

        describe("resource",function() {
            var categoryId = "urn:oasis:names:tc:xacml:3.0:attribute-category:resource";
            it("formats an empty resource",function(){
                pdp.formatRequest({}).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({});
                });

                pdp.formatRequest({
                    'resource': {}
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({});
                });

                pdp.formatRequest({
                    'resource': []
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({});
                });
            });

            it("gets attributes from the PIP if a URN string is provided",function(){
                pdp.formatRequest({
                    'resource': 'urn:subjectId:1'
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:fakeAttribute1' : ["fakeVal"]
                    });
                });
            });
            it("gets a resource from the PIP if a string is provided", function () {
                pdp.formatRequest({
                    'resource': 'urn:subjectId:1'
                }).success(function (formattedRequest) {
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:fakeAttribute1' : ["fakeVal"]
                    });
                });
            });
            it("formats a resource from an object", function () {
                pdp.formatRequest({
                    'resource': {
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true,
                        'urn:subjectId:3': "string",
                        'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                    }
                }).success(function (formattedRequest) {
                    var resource = formattedRequest.category[categoryId];
                    expect(resource).toBeDefined();
                    expect(resource['urn:subjectId:1']).toEqual([1]);
                    expect(resource['urn:subjectId:2']).toEqual([true]);
                    expect(resource['urn:subjectId:3']).toEqual(["string"]);
                    expect(resource['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);
                });
            });
            it("formats a resource from a mixed array", function () {
                pdp.formatRequest({
                    'resource': {
                        'urn:subjectId:1': 1,
                        'urn:subjectId:2': true,
                        'urn:subjectId:3': "string",
                        'urn:subjectId:4': ['a', 'r', 'r', 'a', 'y']
                    }
                }).success(function (formattedRequest) {
                    var resource = formattedRequest.category[categoryId];
                    expect(resource).toBeDefined();
                    expect(resource['urn:subjectId:1']).toEqual([1]);
                    expect(resource['urn:subjectId:2']).toEqual([true]);
                    expect(resource['urn:subjectId:3']).toEqual(["string"]);
                    expect(resource['urn:subjectId:4']).toEqual(['a', 'r', 'r', 'a', 'y']);
                });
            });
        });
        describe("action",function(){
            var categoryId = "urn:oasis:names:tc:xacml:3.0:attribute-category:action";
            it("formats an empty action",function(){
                pdp.formatRequest({}).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:action': []
                    });
                });

                pdp.formatRequest({
                    'action': {}
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:action': []
                    });
                });

                pdp.formatRequest({
                    'action': []
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        'ozp:iwc:action': []
                    });
                });
            });

            it("formats an action if a string is provided",function(){
                pdp.formatRequest({
                    'action': 'write'
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        "ozp:iwc:action": ["write"]
                    });
                });
            });
            it("formats an action if an array of strings is provided",function(){
                pdp.formatRequest({
                    'action': ['write','read']
                }).success(function(formattedRequest){
                    expect(formattedRequest.category[categoryId]).toEqual({
                        "ozp:iwc:action": ["write","read"]
                    });
                });
            });

        });

        it("formats an entire request", function(){
            pdp.formatRequest({
                'subject': "urn:subjectId:1",
                'resource': "urn:subjectId:1",
                'action': "write",
                'combiningAlgorithm' : "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides",
                'policies': ['urn:policyId:1','urn:policyId:2']
            }).success(function(formattedRequest){
                expect(formattedRequest.category).toEqual({
                        "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":{
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        },
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":{
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        },
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:action":{
                            "ozp:iwc:action": ["write"]
                        }
                });
                expect(formattedRequest.combiningAlgorithm)
                    .toEqual("urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides");
                expect(formattedRequest.policies)
                    .toEqual(['urn:policyId:1','urn:policyId:2']);
            });
        });
    });

    describe("category formatting",function(){
        it("gathers a categories attributes from the PIP if given as a string",function(){
            pdp.formatCategory('urn:subjectId:1')
                .success(function(category){
                    expect(category['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                });
        });

        it("gathers a categories attributes from the PIP if given as an array",function(){
            pdp.formatCategory(['urn:subjectId:1','urn:subjectId:2'])
                .success(function(category){
                    expect(category['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(category['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                });
        });

        it("gathers multiple categories in an object with a URI given as a string",function(){
            pdp.formatCategories({
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" : 'urn:subjectId:1',
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource" : 'urn:subjectId:2'
                }).success(function(categories){
                    expect(categories["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(categories["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                });
        });


        it("gathers multiple categories in an object with  URIs given as an Array",function(){
            pdp.formatCategories({
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['urn:subjectId:1', 'urn:subjectId:2'],
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['urn:subjectId:1', 'urn:subjectId:2', 'urn:subjectId:3']
            }).success(function(category){
                expect(category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                expect(category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
            });
        });
    });

    describe("rule formatting",function() {
        var rule = {
            "ruleId": "urn:ozp:iwc:xacml:rule:fake",
            "description": "Fake rule.",
            'category': {
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['urn:subjectId:1', 'urn:subjectId:2'],
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['urn:subjectId:1', 'urn:subjectId:2', 'urn:subjectId:3']
            }
        };
        it("converts any JSON rule into a Rule object and gathers any needed attribute",function(){
            pdp.formatRule(rule)
                .success(function(rule){
                    expect(rule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                    expect(rule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                });
        });
        it("converts any array of JSON rules into an array of Rule objects and gathers any needed attribute",function(){
            pdp.formatRules([rule,rule])
                .success(function(rules){
                    rules.forEach(function(formattedRule) {
                        expect(formattedRule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                        expect(formattedRule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                        expect(formattedRule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                        expect(formattedRule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                        expect(formattedRule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                        expect(formattedRule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                    });
                });
        });
    });

    describe("Category attributeId mapping", function(){
        it("maps the subject attribute Id for the designator",function(){
            expect(pdp.mappedId("urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"))
                .toEqual("urn:oasis:names:tc:xacml:1.0:subject:subject-id");
        });
        it("maps the resource attribute Id for the designator",function(){
            expect(pdp.mappedId("urn:oasis:names:tc:xacml:3.0:attribute-category:resource"))
                .toEqual("urn:oasis:names:tc:xacml:1.0:resource:resource-id");
        });
        it("maps the action attribute Id for the designator",function(){
            expect(pdp.mappedId("urn:oasis:names:tc:xacml:3.0:attribute-category:action"))
                .toEqual("urn:oasis:names:tc:xacml:1.0:action:action-id");
        });
        it("maps undefined for an unsupported category", function(){
            expect(pdp.mappedId("urn:some:random:not:supported:category")).toBeUndefined();
        });
    });

    describe("Policy formatting", function(){
        var policy = new ozpIwc.policyAuth.Policy({
            "policyId": "urn:ozp:iwc:xacml:policy:connect1",
            "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
            "version": "1.0",
            "description": "Policy for Connection Allowances (testing)",
            "rule": [
                {
                    "ruleId": "urn:ozp:iwc:xacml:rule:fake",
                    "description": "Fake rule.",
                    'category': {
                        "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['urn:subjectId:1', 'urn:subjectId:2'],
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['urn:subjectId:1', 'urn:subjectId:2', 'urn:subjectId:3']
                    }
                }
            ]
        });
        it("converts any JSON policy into a Policy object and gathers any needed attributes",function(){
            pdp.formatPolicy(policy)
                .success(function(policy){
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                    expect(policy.rule[0].evaluate).toBeDefined();
                    expect(policy.evaluate).toBeDefined();
                });
        });
        it("converts any array of JSON policies into an array of Policy objects and gathers any needed attribute",function(){
            pdp.formatPolicies([policy,policy])
                .success(function(policies){
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                    expect(policies[0].rule[0].evaluate).toBeDefined();
                    expect(policies[0].evaluate).toBeDefined();
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
                    expect(policies[1].rule[0].evaluate).toBeDefined();
                    expect(policies[1].evaluate).toBeDefined();
                });
        });
    });

    describe("Permission", function(){
        var request = {
            subject: "urn:subjectId:fake",
            resource: "urn:resourceId:fake",
            action: "write"
        };
        it("permits",function(){
            pdp.generateEvaluation = function(){
                return function(request){
                    return "Permit";
                };
            };
            pdp.isPermitted({
                subject: "urn:subjectId:fake",
                resource: "urn:resourceId:fake",
                action: "write"
            }).success(function(response){
                expect(response.result).toEqual("Permit");
                expect(response.request).toEqual(request);
                expect(response.formattedRequest).toBeDefined();
                expect(response.formattedPolicies).toBeDefined();
            }).failure(function(response){
                expect(false).toEqual(true);
            });
        });

        it("denies",function(){
            pdp.generateEvaluation = function(){
                return function(request){
                    return "Deny";
                };
            };
            pdp.isPermitted(request)
                .success(function(response){
                    expect(false).toEqual(true);
                }).failure(function(response){
                    expect(response.result).toEqual("Deny");
                    expect(response.request).toEqual(request);
                    expect(response.formattedRequest).toBeDefined();
                    expect(response.formattedPolicies).toBeDefined();
                });
        });
    });

});