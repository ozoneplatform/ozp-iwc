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


        it("Permits a valid request",function(done){
            var request = new ozpIwc.policyAuth.Request();
            request.addSubject({
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'value': 'Julius Hibbert'
            });
            request.addResource({
                'dataType': "http://www.w3.org/2001/XMLSchema#anyURI",
                'value': 'http://medico.com/record/patient/BartSimpson'
            });

            request.addAction({
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'value': 'write'
            });

            pdp.handleRequest(request)
                .success(function(){
                    done();
                })
                .failure(function(){
                    expect(false).toEqual(true);
                })
        });
        it("Denies an invalid request",function(done){
            var request = new ozpIwc.policyAuth.Request();
            request.addSubject({
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'value': 'Julius Hibbert'
            });
            request.addResource({
                'dataType': "http://www.w3.org/2001/XMLSchema#anyURI",
                'value': 'http://medico.com/record/patient/BartSimpson'
            });

            request.addAction({
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'value': 'delete'
            });

            // Julius wants to delete Bart's medical records!
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