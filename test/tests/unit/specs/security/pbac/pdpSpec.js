describe("Policy Decision Point",function() {

    var pdp;
    var mockPIP = {
        'getAttributes': function (id) {
            var obj = {};
            obj[id] = {
                'attributeValue': ["fakeVal"]
            };
            return new ozpIwc.AsyncAction().resolve("success", obj);
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
        it("gets a subject from the PIP if a string is provided",function(){
            pdp.formatRequest({
                'subject': 'urn:subjectId:1'
            }).success(function(formattedRequest){
                expect(formattedRequest.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]).toEqual({
                    'urn:subjectId:1' : {
                        'attributeValue': ["fakeVal"]
                    }
                });
            });
        });

        it("gets a resource from the PIP if a string is provided",function(){
            pdp.formatRequest({
                'resource': 'urn:resourceId:1'
            }).success(function(formattedRequest){
                expect(formattedRequest.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]).toEqual({
                    'urn:resourceId:1' : {
                        'attributeValue': ["fakeVal"]
                    }
                });
            });
        });

        it("formats an action if a string is provided",function(){
            pdp.formatRequest({
                'action': 'write'
            }).success(function(formattedRequest){
                expect(formattedRequest.category["urn:oasis:names:tc:xacml:3.0:attribute-category:action"]).toEqual({
                    "ozp:iwc:action": {
                        "attributeValue": ["write"]
                    }
                });
            });
        });

        it("formats an entire request", function(){
            pdp.formatRequest({
                'subject': "urn:subjectId:1",
                'resource': "urn:resourceId:1",
                'action': "write",
                'combiningAlgorithm' : "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides",
                'policies': ['urn:policyId:1','urn:policyId:2']
            }).success(function(formattedRequest){
                expect(formattedRequest.category).toEqual({
                        "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":{
                            'urn:subjectId:1': {
                                'attributeValue': ["fakeVal"]
                            }
                        },
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":{
                            'urn:resourceId:1': {
                                'attributeValue': ["fakeVal"]
                            }
                        },
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:action":{
                            "ozp:iwc:action": {
                                "attributeValue": ["write"]
                            }
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
            pdp.formatCategory('ozp:fake:attribute')
                .success(function(category){
                    expect(category['ozp:fake:attribute'].attributeValue.length).toEqual(1);
                    expect(category['ozp:fake:attribute'].attributeValue).toEqual(["fakeVal"]);
                });
        });

        it("gathers a categories attributes from the PIP if given as an array",function(){
            pdp.formatCategory(['ozp:fake:attribute','ozp:fake:attribute2'])
                .success(function(category){
                    expect(category['ozp:fake:attribute'].attributeValue).toEqual(["fakeVal"]);
                    expect(category['ozp:fake:attribute2'].attributeValue).toEqual(["fakeVal"]);
                });
        });

        it("gathers multiple categories in an object with a URI given as a string",function(){
            pdp.formatCategories({
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" : 'ozp:fake:attribute',
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource" : 'ozp:fake:attribute'
                }).success(function(categories){
                    expect(categories["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute'].attributeValue).toEqual(["fakeVal"]);
                    expect(categories["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute'].attributeValue).toEqual(["fakeVal"]);
                });
        });


        it("gathers multiple categories in an object with  URIs given as an Array",function(){
            pdp.formatCategories({
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" : ['ozp:fake:attribute','ozp:fake:attribute2'],
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource" : ['ozp:fake:attribute','ozp:fake:attribute2','ozp:fake:attribute3']
            }).success(function(category){
                expect(category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                expect(category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
            });
        });
    });

    describe("rule formatting",function() {
        var rule = {
            "ruleId": "urn:ozp:iwc:xacml:rule:fake",
            "description": "Fake rule.",
            'category': {
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['ozp:fake:attribute', 'ozp:fake:attribute2'],
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['ozp:fake:attribute', 'ozp:fake:attribute2', 'ozp:fake:attribute3']
            }
        };
        it("converts any JSON rule into a Rule object and gathers any needed attribute",function(){
            pdp.formatRule(rule)
                .success(function(rule){
                    expect(rule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                    expect(rule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                    expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
                });
        });
        it("converts any array of JSON rules into an array of Rule objects and gathers any needed attribute",function(){
            pdp.formatRules([rule,rule])
                .success(function(rules){
                    expect(rules[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                    expect(rules[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                    expect(rules[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                    expect(rules[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                    expect(rules[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
                    expect(rules[1].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                    expect(rules[1].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                    expect(rules[1].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                    expect(rules[1].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                    expect(rules[1].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
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
                        "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['ozp:fake:attribute', 'ozp:fake:attribute2'],
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['ozp:fake:attribute', 'ozp:fake:attribute2', 'ozp:fake:attribute3']
                    }
                }
            ]
        });
        it("converts any JSON policy into a Policy object and gathers any needed attributes",function(){
            pdp.formatPolicy(policy)
                .success(function(policy){
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                    expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
                    expect(policy.rule[0].evaluate).toBeDefined();
                    expect(policy.evaluate).toBeDefined();
                });
        });
        it("converts any array of JSON policies into an array of Policy objects and gathers any needed attribute",function(){
            pdp.formatPolicies([policy,policy])
                .success(function(policies){
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                    expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
                    expect(policies[0].rule[0].evaluate).toBeDefined();
                    expect(policies[0].evaluate).toBeDefined();
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute']).toBeDefined();
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]['ozp:fake:attribute2']).toBeDefined();
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute']).toBeDefined();
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute2']).toBeDefined();
                    expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]['ozp:fake:attribute3']).toBeDefined();
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