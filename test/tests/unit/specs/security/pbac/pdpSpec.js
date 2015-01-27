describe("Policy Decision Point",function() {
    var mockPolicy = {
        "policyId": "connectPolicy.json",
        "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
        "version": "1.0",
        "description": "Policy for Connection Allowances (testing)",
        "rule": [
            {
                "ruleId": "urn:ozp:iwc:xacml:rule:connect1",
                "description": "The following domains are white-listed to connect to the IWC bus.",
                "category": {
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":{
                        "attributeDesignator": {
                            "attributeId" : "urn:oasis:names:tc:xacml:1.0:subject:subject-id",
                            "dataType" : "http://www.w3.org/2001/XMLSchema#anyURI",
                            "mustBePresent": false
                        },
                        "attributeValue" : [
                            "http://localhost:13000",
                            "http://localhost:15001",
                            "http://ozone-development.github.io"
                        ]
                    },
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":{
                        "attributeDesignator": {
                            "attributeId" : "urn:oasis:names:tc:xacml:1.0:resource:resource-id",
                            "dataType" : "http://www.w3.org/2001/XMLSchema#string",
                            "mustBePresent": false
                        },
                        "attributeValue" : ["$bus.multicast"]
                    },
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:action":{
                        "attributeDesignator": {
                            "attributeId" : "urn:oasis:names:tc:xacml:1.0:action:action-id",
                            "dataType" : "http://www.w3.org/2001/XMLSchema#string",
                            "mustBePresent": false
                        },
                        "attributeValue" : ["connect"]
                    }
                }
            }
        ]
    };
    var pdp;
    var mockPIP = {
        'getAttributes': function (id) {
            return new Promise(function (resolve, reject) {
                resolve({
                    'attr:1': {
                        'dataType': "http://www.w3.org/2001/XMLSchema#string",
                        'attributeValue': "fakeVal"
                    }
                });
            });
        }
    };

    var mockPRP = {
        'getPolicies': function(policyURIs){
            return new Promise(function(resolve,reject){
               resolve([mockPolicy]);
            });
        }
    };

    beforeEach(function(){
        pdp = new ozpIwc.policyAuth.PDP({
            'pip': mockPIP,
            'prp': mockPRP
        });
    });
    describe("Request formatting",function(){
        it("gets a subject from the PIP if a string is provided",function(done){
            pdp.formatRequest({
                'subject': 'urn:subjectId:1'
            }).then(function(formattedRequest){
                expect(formattedRequest.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]).toEqual({
                    'attr:1': {
                        'dataType': "http://www.w3.org/2001/XMLSchema#string",
                        'attributeValue': "fakeVal"
                    }
                });
                done();
            });
        });

        it("gets a resource from the PIP if a string is provided",function(done){
            pdp.formatRequest({
                'resource': 'urn:resourceId:1'
            }).then(function(formattedRequest){
                expect(formattedRequest.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]).toEqual({
                    'attr:1': {
                        'dataType': "http://www.w3.org/2001/XMLSchema#string",
                        'attributeValue': "fakeVal"
                    }
                });
                done();
            });
        });

        it("formats an action if a string is provided",function(done){
            pdp.formatRequest({
                'action': 'write'
            }).then(function(formattedRequest){
                expect(formattedRequest.category["urn:oasis:names:tc:xacml:3.0:attribute-category:action"]).toEqual({
                    'attr:1': {
                        'dataType': "http://www.w3.org/2001/XMLSchema#string",
                            'attributeValue': "write"
                    }
                });
                done();
            });
        });

        it("formats an entire request", function(done){
            pdp.formatRequest({
                'subject': "urn:subjectId:1",
                'resource': "urn:resourceId:1",
                'action': "write",
                'combiningAlgorithm' : "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides",
                'policies': ['urn:policyId:1','urn:policyId:2']
            }).then(function(formattedRequest){
                expect(formattedRequest.category).toEqual({
                        "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": {
                            'attr:1': {
                                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                                'attributeValue': "fakeVal"
                            }
                        },
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": {
                            'attr:1': {
                                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                                'attributeValue': "fakeVal"
                            }
                        },
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:action": {
                            'attr:1' : {
                                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                                'attributeValue': "write"
                            }
                        }
                });
                expect(formattedRequest.combiningAlgorithm)
                    .toEqual("urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides");
                expect(formattedRequest.policies)
                    .toEqual(['urn:policyId:1','urn:policyId:2']);
                done();
            });
        });
    });

    describe("category formatting",function(){
        it("gathers a categories attributes from the PIP if given as a string",function(done){
            pdp.formatCategory('ozp:fake:attribute',
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject").then(function(category){
                    expect(category.attributeValue).toEqual(["fakeVal"]);
                    expect(category.attributeDesignator.attributeId).toEqual("urn:oasis:names:tc:xacml:1.0:subject:subject-id");
                    expect(category.attributeDesignator.dataType).toEqual("http://www.w3.org/2001/XMLSchema#string");
                    done();
                });
        });

        it("gathers a categories attributes from the PIP if given as an array",function(done){
            pdp.formatCategory(['ozp:fake:attribute','ozp:fake:attribute'],
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject").then(function(category){
                    expect(category.attributeValue).toEqual(["fakeVal","fakeVal"]);
                    expect(category.attributeDesignator.attributeId).toEqual("urn:oasis:names:tc:xacml:1.0:subject:subject-id");
                    expect(category.attributeDesignator.dataType).toEqual("http://www.w3.org/2001/XMLSchema#string");
                    done();
                });
        });

        it("gathers multiple categories in an object with a URI given as a string",function(done){
            pdp.formatCategories({
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" : 'ozp:fake:attribute',
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource" : 'ozp:fake:attribute'
                }).then(function(categories){
                    expect(categories["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue).toEqual(["fakeVal"]);
                    expect(categories["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue).toEqual(["fakeVal"]);
                    done();
                });
        });


        it("gathers multiple categories in an object with  URIs given as an Array",function(done){
            pdp.formatCategories({
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" : ['ozp:fake:attribute','ozp:fake:attribute'],
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource" : ['ozp:fake:attribute','ozp:fake:attribute','ozp:fake:attribute']
            }).then(function(category){
                expect(category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                done();
            });
        });
    });

    describe("rule formatting",function() {
        var rule = {
            "ruleId": "urn:ozp:iwc:xacml:rule:fake",
            "description": "Fake rule.",
            'category': {
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['ozp:fake:attribute', 'ozp:fake:attribute'],
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['ozp:fake:attribute', 'ozp:fake:attribute', 'ozp:fake:attribute']
            }
        };
        it("converts any JSON rule into a Rule object and gathers any needed attribute",function(done){
            pdp.formatRule(rule).then(function(rule){
                expect(rule.category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(rule.category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                done();
            });
        });
        it("converts any array of JSON rules into an array of Rule objects and gathers any needed attribute",function(done){

            pdp.formatRules([rule,rule]).then(function(rules){
                expect(rules[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(rules[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                expect(rules[1].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(rules[1].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                done();
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
        var policy = {
            "policyId": "urn:ozp:iwc:xacml:policy:connect1",
            "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
            "version": "1.0",
            "description": "Policy for Connection Allowances (testing)",
            "rule": [
                {
                    "ruleId": "urn:ozp:iwc:xacml:rule:fake",
                    "description": "Fake rule.",
                    'category': {
                        "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": ['ozp:fake:attribute', 'ozp:fake:attribute'],
                        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": ['ozp:fake:attribute', 'ozp:fake:attribute', 'ozp:fake:attribute']
                    }
                }
            ]
        };
        it("converts any JSON policy into a Policy object and gathers any needed attributes",function(done){
            pdp.formatPolicy(policy).then(function(policy){
                expect(policy.rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeDesignator.attributeId)
                    .toEqual("urn:oasis:names:tc:xacml:1.0:subject:subject-id");
                expect(policy.rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(policy.rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                done();
            });
        });
        it("converts any array of JSON policies into an array of Policy objects and gathers any needed attribute",function(done){
            pdp.formatPolicies([policy,policy]).then(function(policies){

                expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeDesignator.attributeId)
                    .toEqual("urn:oasis:names:tc:xacml:1.0:subject:subject-id");
                expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(policies[0].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"].attributeValue)
                    .toEqual(["fakeVal","fakeVal"]);
                expect(policies[1].rule[0].category["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"].attributeValue)
                    .toEqual(["fakeVal","fakeVal","fakeVal"]);
                done();
            });
        });
    });

    describe("Permission", function(){
        var request = {
            subject: "urn:subjectId:fake",
            resource: "urn:resourceId:fake",
            action: "write"
        };
        it("permits via a promises then",function(done){
            pdp.generateEvaluation = function(){
                return function(request){
                    return "Permit";
                };
            };
            pdp.isPermitted({
                subject: "urn:subjectId:fake",
                resource: "urn:resourceId:fake",
                action: "write"
            }).then(function(response){
                expect(response.result).toEqual("Permit");
                expect(response.request).toEqual(request);
                expect(response.formattedRequest).not.toBeUndefined();
                done();
            })['catch'](function(response){
                expect(false).toEqual(true);
                done();
            });
        });

        it("denies via a promises catch",function(done){
            pdp.generateEvaluation = function(){
                return function(request){
                    return "Deny";
                };
            };
            pdp.isPermitted(request).then(function(response){
                expect(false).toEqual(true);
                done();
            })['catch'](function(response){
                expect(response.result).toEqual("Deny");
                expect(response.request).toEqual(request);
                expect(response.formattedRequest).not.toBeUndefined();
                done();
            });
        });
    });

});