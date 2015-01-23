describe("Policy Repository Point",function() {
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

    var prp;
    describe("default behavior and policy acquisition failure.",function(){
        beforeEach(function(){

            // make all policy requests reject to test the denyAll functionality
            spyOn(ozpIwc.util,"ajax").and.callFake(function(){
                return new Promise(function(resolve,reject){
                    reject();
                });
            });

            prp = new ozpIwc.policyAuth.PRP();

        });

        it("formats server loaded policies as Policy Elements",function(){
            var policy = prp.formatPolicy(mockPolicy);
            expect(policy.evaluate).not.toBeUndefined();
        });

        it('sets any policy that cannot be acquired to denyAll',function(done){

            ozpIwc.policyAuth.PolicyCombining['urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides']
                = function(policies,request){
                expect(policies.length).toEqual(1);
                expect(policies[0]).toEqual(ozpIwc.abacPolicies.denyAll);
                done();
            };

            prp.getPolicy("SOMEFAKEPOLICY",'urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides').then(
                function(eval){
                    eval();
                }
            );
        });

        it('always applies persistent policies to any policy request',function(done){

            prp = new ozpIwc.policyAuth.PRP({
                'persistentPolicies': ['somePolicy']
            });

            ozpIwc.policyAuth.PolicyCombining['urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides']
                = function(policies,request){
                expect(policies.length).toEqual(1);
                done();
            };

            prp.getPolicy([],'urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides').then(function(eval){
                eval();
            });
        });


        it("applies a default combining algorithm if one is not provided",function(done){
            // override the function, just testing that the default is called
            ozpIwc.policyAuth.PolicyCombining[prp.defaultCombiningAlgorithm]
                = function(policies,request){
                done();
            };

            prp.getPolicy().then(function(eval){
                eval();
            });
        });
    });

    describe("policy acquisition success",function(){
        beforeEach(function(){

            // make all policy requests reject to test the denyAll functionality
            spyOn(ozpIwc.util,"ajax").and.callFake(function(){
                return new Promise(function(resolve,reject){
                    resolve(mockPolicy);
                });
            });

            prp = new ozpIwc.policyAuth.PRP();
        });

        it("fetches desired policies.",function(done){
            prp.fetchPolicy("connectionPolicy.json").then(function(policy){
                expect(policy.policyId).toEqual(mockPolicy.policyId);
                expect(policy.version).toEqual(mockPolicy.version);
                expect(policy.description).toEqual(mockPolicy.description);
                expect(policy.rule).toEqual(mockPolicy.rule);
                expect(policy.ruleCombiningAlgId).toEqual(mockPolicy.ruleCombiningAlgId);
                expect(policy.evaluate).not.toBeUndefined();
                done();
            })
        });


        it("returns a promise chain with policy evaluation call for the PDP",function(done){
            prp.getPolicy("connectionPolicy.json").then(function(evaluate){
                expect(typeof evaluate).toEqual("function");
                done();
            });
        });

    });
});
