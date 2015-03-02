describe("Policy Decision Point",function() {

    var pdp;
    var mockPIP = {
        'getAttributes': function (id) {
            var obj = this.attributes[id] || {};
            return new ozpIwc.AsyncAction().resolve("success", obj);
        },
        'attributes' : {
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
            return ozpIwc.AsyncAction.all([ozpIwc.policyAuth.defaultPolicies['policy/connect']]);
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
            var categoryId = "subject";
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

                });
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
                });
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

                });
            });
        });

        describe("resource",function() {
            var categoryId = "resource";
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
            var categoryId = "action";
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
                'combiningAlgorithm' : "deny-overrides",
                'policies': ['urn:policyId:1','urn:policyId:2']
            }).success(function(formattedRequest){
                expect(formattedRequest.category).toEqual({
                        "subject":{
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        },
                        "resource":{
                            'ozp:iwc:fakeAttribute1': ["fakeVal"]
                        },
                        "action":{
                            "ozp:iwc:action": ["write"]
                        }
                });
                expect(formattedRequest.combiningAlgorithm)
                    .toEqual("deny-overrides");
                expect(formattedRequest.policies)
                    .toEqual(['urn:policyId:1','urn:policyId:2']);
            });
        });
    });

    describe("attribute formatting",function(){
        it("gathers a categories attributes from the PIP if given as a string",function(){
            pdp.formatAttribute('urn:subjectId:1')
                .success(function(category){
                    expect(category['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                });
        });

        it("gathers a categories attributes from the PIP if given as an array",function(){
            pdp.formatAttribute(['urn:subjectId:1','urn:subjectId:2'])
                .success(function(category){
                    expect(category['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(category['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                });
        });

        it("gathers multiple categories in an object with a URI given as a string",function(){
            pdp.formatCategories({
                    "subject" : 'urn:subjectId:1',
                    "resource" : 'urn:subjectId:2'
                }).success(function(categories){
                    expect(categories.subject['ozp:iwc:fakeAttribute1']).toEqual(["fakeVal"]);
                    expect(categories.resource['ozp:iwc:fakeAttribute2']).toEqual(["fakeVal"]);
                });
        });


        it("gathers multiple categories in an object with  URIs given as an Array",function(){
            pdp.formatCategories({
                "subject": ['urn:subjectId:1', 'urn:subjectId:2'],
                "resource": ['urn:subjectId:1', 'urn:subjectId:2', 'urn:subjectId:3']
            }).success(function(category){
                expect(category.subject['ozp:iwc:fakeAttribute1']).toEqual(['fakeVal']);
                expect(category.subject['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                expect(category.resource['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                expect(category.resource['ozp:iwc:fakeAttribute2']).toEqual(['fakeVal']);
                expect(category.resource['ozp:iwc:fakeAttribute3']).toEqual(['fakeVal']);
                expect(category.resource['ozp:iwc:fakeAttributea']).toEqual(['afakeVal']);
            });
        });
    });


    describe("Permission", function(){
        var request = {
            subject: "urn:subjectId:fake",
            resource: "urn:resourceId:fake",
            action: "write",
            policies: ['policy://policy/fake']
        };

        it("permits",function(){
            pdp.prp.getPolicies = function(){
                return new ozpIwc.AsyncAction().resolve("success", [ozpIwc.ozpIwcPolicies.permitAll]);
            };

            pdp.isPermitted(request).success(function(response){
                expect(response.result).toEqual("Permit");
                expect(response.request).toEqual(request);
                expect(response.formattedRequest).toBeDefined();
            }).failure(function(response){
                expect(false).toEqual(true);
            });
        });

        it("denies",function(){
            pdp.prp.getPolicies = function(){
                return new ozpIwc.AsyncAction().resolve("success", [ozpIwc.ozpIwcPolicies.denyAll]);
            };

            pdp.isPermitted(request)
                .success(function(response){
                    expect(false).toEqual(true);
                }).failure(function(response){
                    expect(response.result).toEqual("Deny");
                    expect(response.request).toEqual(request);
                    expect(response.formattedRequest).toBeDefined();
                });
        });
    });

});