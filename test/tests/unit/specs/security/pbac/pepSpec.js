describe("Policy Enforcement Point",function() {

    var pep;
    var mockPermitPDP = {
        handleRequest: function(request){
            return new ozpIwc.AsyncAction().resolve('success');
        }
    };
    var mockDenyPDP = {
        handleRequest: function(request){
            return new ozpIwc.AsyncAction().resolve('failure');
        }
    };

    describe("Permission",function(){
        beforeEach(function () {
            pep = new ozpIwc.policyAuth.PEP({
                PDP: mockPermitPDP
            });
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
        });

        it("permits if the decision is 'Permit'",function(done){
            pep.request(request)
                .success(function(){
                    done();
                })
                .failure(function(){
                    expect(false).toEqual(true);
                })
        });
        xit("permits access with a 'Permit' decision when obligations accompany the decision only if it understands and " +
            "can/will discharge those obligations",function(){});
    });

    describe("Denial",function(done){
        beforeEach(function () {
            pep = new ozpIwc.policyAuth.PEP({
                PDP: mockDenyPDP
            });
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
        });
        it("denies if the decision is 'Deny'",function(){
            pep.request(request)
                .success(function(){
                    expect(false).toEqual(true);
                })
                .failure(function(){
                    done();
                })
        });
        xit("denies access with a  'Deny' decision when obligations accompany the decision only if it understands and " +
            "can/will discharge those obligations",function(){});
    });

    describe("Indeterminate",function(){
        it("behavior is undefined if the decision is 'Not Applicable'",function(){});
        it("behavior is undefined if the decision is 'Indeterminate'",function(){});

    });
});
