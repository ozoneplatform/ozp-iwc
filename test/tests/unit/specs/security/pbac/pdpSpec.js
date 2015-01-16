describe("Policy Decision Point",function() {

    beforeEach(function(done){
        pdp = new ozpIwc.policyAuth.PDP();
        pdp.gatherPolicies('/policy/policy.xml').then(function(){
           done();
        });
    });

    describe("Loads", function () {
        var pdp;
        it("a policy", function () {
            expect(pdp.policies.length).toEqual(1);
        });
        it("a policy's description", function () {
            expect(pdp.policies[0].description).not.toBeNull();
            expect(pdp.policies[0].description.value).not.toBeNull();
        });
        it("a policy's target", function () {
            expect(pdp.policies[0].target).not.toBeUndefined();
            expect(pdp.policies[0].target.anyOf).not.toBeUndefined();
        });
        it("a policy's rule", function (done) {
            expect(pdp.policies[0].rule).not.toBeUndefined();
            expect(pdp.policies[0].rule.target).not.toBeUndefined();
            expect(pdp.policies[0].rule.target.anyOf).not.toBeUndefined();
            expect(pdp.policies[0].rule.anyOf.length).toBeGreaterThan(0);
        });
    });

    describe("Request handling", function(){
        var request = {
            'attributes':[
                {
                    'category': 'urn:oasis:names:tc:xacml:1.0:subject-category:access-subject',
                    'attribute':[
                        {
                            'attributeId': 'urn:oasis:names:tc:xacml:1.0:subject:subject-id',
                            'value': 'Julius Hibbert'
                        }
                    ]
                },
                {
                    'category': 'urn:oasis:names:tc:xacml:1.0:subject-category:access-subject',
                    'attribute': [
                        {
                            'attributeId': 'urn:oasis:names:tc:xacml:1.0:subject:resource-id',
                            'value': 'http://medico.com/record/patient/BartSimpson'
                        }
                    ]
                },
                {
                    'category': 'urn:oasis:names:tc:xacml:1.0:subject-category:access-subject',
                    'attribute': [
                        {
                            'attributeId': 'urn:oasis:names:tc:xacml:1.0:action:action-id',
                            'value': 'write'
                        }
                    ]
                }
            ]
        };
        it("handles a request",function(done){
            pdp.handleRequest(request)
                .success(function(){
                    done();
                })
                .failure(function(){
                    expect(false).toEqual(true);
                })
        });
    });
});