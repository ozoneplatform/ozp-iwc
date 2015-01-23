describe("Policy Decision Point",function() {

    var pdp;
    var mockPIP = {
        'getAttributes': function(id){
            return {
                'ozp:attribute:1': {
                    'dataType':"http://www.w3.org/2001/XMLSchema#string",
                    'attributeValue': "fakeVal"
                }
            }
        }
    };

    var mockPRP = {
        'getPolicy': function(policyURIs,combiningAlgorithm){

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
                    'ozp:attribute:1': {
                        'dataType':"http://www.w3.org/2001/XMLSchema#string",
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
                    'ozp:attribute:1': {
                        'dataType':"http://www.w3.org/2001/XMLSchema#string",
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
                        'dataType':"http://www.w3.org/2001/XMLSchema#string",
                        'attributeValue': "write"
                });
                done();
            });
        });
    });

    describe("Permission", function(){
        it("permits via a promises then",function(done){
            pdp.prp.getPolicy = function(){
                return new Promise(function(resolve,reject){
                    resolve(function(request){
                            return "Permit";
                    });
                });
            };
            pdp.isPermitted({
                subject: "urn:subjectId:fake",
                resource: "urn:resourceId:fake",
                action: "write"
            }).then(function(response){
                expect(response).toEqual("Permit");
                done();
            })['catch'](function(response){
                expect(false).toEqual(true);
                done();
            });
        });

        it("denies via a promises catch",function(done){
            pdp.prp.getPolicy = function(){
                return new Promise(function(resolve,reject){
                    resolve(function(request){
                        return "Deny";
                    });
                });
            };
            pdp.isPermitted({
                subject: "urn:subjectId:fake",
                resource: "urn:resourceId:fake",
                action: "write"
            }).then(function(response){
                expect(false).toEqual(true);
                done();
            })['catch'](function(response){
                expect(response).toEqual("Deny");
                done();
            });
        });
    });

});