describe("Policy Decision Point",function() {

    var pdp;
    beforeEach(function(done){
        pdp = new ozpIwc.policyAuth.PDP();
        pdp.gatherPolicies('/policy/policy.xml').then(function(){
           done();
        });
    });

    describe("Loads", function () {
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
        it("a policy's rule", function () {
            expect(pdp.policies[0].rule[0]).not.toBeUndefined();
            expect(pdp.policies[0].rule[0].target).not.toBeUndefined();
            expect(pdp.policies[0].rule[0].target.anyOf).not.toBeUndefined();
            expect(pdp.policies[0].rule[0].target.anyOf.length).toBeGreaterThan(0);
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
                            'dataType': "http://www.w3.org/2001/XMLSchema#string",
                            'value': 'Julius Hibbert'
                        }
                    ]
                },
                {
                    'category': 'urn:oasis:names:tc:xacml:3.0:attribute-category:resource',
                    'attribute': [
                        {
                            'attributeId': 'urn:oasis:names:tc:xacml:1.0:resource:resource-id',
                            'dataType': "http://www.w3.org/2001/XMLSchema#anyURI",
                            'value': 'http://medico.com/record/patient/BartSimpson'
                        }
                    ]
                },
                {
                    'category': 'urn:oasis:names:tc:xacml:3.0:attribute-category:action',
                    'attribute': [
                        {
                            'attributeId': 'urn:oasis:names:tc:xacml:1.0:action:action-id',
                            'dataType': "http://www.w3.org/2001/XMLSchema#string",
                            'value': 'write'
                        }
                    ]
                }
            ]
        };
        it("Permits a valid request",function(done){
            pdp.handleRequest(request)
                .success(function(){
                    done();
                })
                .failure(function(){
                    expect(false).toEqual(true);
                })
        });
        it("Denies an invalid request",function(done){

            // Julius wants to delete Bart's medical records!
            request.attributes[2].attribute[0].value = 'delete';
            pdp.handleRequest(request)
                .success(function(){
                    expect(false).toEqual(true);
                })
                .failure(function(){
                    done();
                })
        });
    });
});