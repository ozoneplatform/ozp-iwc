describe("Policy Information Point",function() {

    var pip;

    beforeEach(function(){

        spyOn(ozpIwc.util,"ajax").and.callFake(function(){
            return new Promise(function(resolve,reject){
               resolve({
                    "ozp:attribute:1" : {
                       'dataType': "http://www.w3.org/2001/XMLSchema#string",
                       'attributeValue': "serverLoadedVal"
                    }
                });
            });
        });

        pip = new ozpIwc.policyAuth.PIP({
            informationCache : {
                'ozp:attributeCollection:fake': {
                    'ozp:attribute:1': {
                        'dataType':"http://www.w3.org/2001/XMLSchema#string",
                        'attributeValue': "fakeVal"
                    },
                    'ozp:attribute:2': {
                        'dataType':"http://www.w3.org/2001/XMLSchema#string",
                        'attributeValue': "otherFakeVal"
                    }
                }
            }
        });
    });

    it("returns an attribute from the cache if possible",function(done){
        pip.getAttributes('ozp:attributeCollection:fake').then(function(attr){
            expect(attr).toEqual(pip.informationCache['ozp:attributeCollection:fake']);
            done();
        });
    });

    it('sends a request to the attributes URI/URN to gather attributes not in the cache',function(done){
        pip.getAttributes('ozp:attributeCollection:NOTINCACHE').then(function(attr){
            expect(attr).toEqual({
            'ozp:attribute:1' : {
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'attributeValue': "serverLoadedVal"
                }
            });
            done();
        });
    });

    it('grants Attributes an existing attributeId',function(){
        pip.grantAttributes('ozp:attributeCollection:fake',{
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        });
        expect(pip.informationCache['ozp:attributeCollection:fake']).toEqual({
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:2': {
                'dataType':"http://www.w3.org/2001/XMLSchema#string",
                'attributeValue': "otherFakeVal"
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        });
    });

    it('grants Attributes a non existing attributeId ',function(){
        pip.grantAttributes('ozp:attributeCollection:fake2',{
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        });
        expect(pip.informationCache['ozp:attributeCollection:fake2']).toEqual({
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        });
    });

    it('grants Attributes from a parent to an existing attributeId',function(done){
        pip.informationCache['ozp:attributeCollection:parent'] = {
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        };

        pip.grantParent('ozp:attributeCollection:fake','ozp:attributeCollection:parent').then(function(){
            expect(pip.informationCache['ozp:attributeCollection:fake']).toEqual({
                'ozp:attribute:1': {
                    'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                    'attributevalue' : 'newVal'
                },
                'ozp:attribute:2': {
                    'dataType':"http://www.w3.org/2001/XMLSchema#string",
                    'attributeValue': "otherFakeVal"
                },
                'ozp:attribute:3' : {
                    'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                    'attributevalue' : 'newVal2'
                }
            });
            done();
        });
    });

    it('grants Attributes from a parent to a non existing attributeId',function(){
        pip.informationCache['ozp:attributeCollection:parent'] = {
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        };

        pip.grantParent('ozp:attributeCollection:fake2','ozp:attributeCollection:parent');


        expect(pip.informationCache['ozp:attributeCollection:fake2']).toEqual({
            'ozp:attribute:1': {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal'
            },
            'ozp:attribute:3' : {
                'dataType' : 'http://www.w3.org/2001/XMLSchema#string',
                'attributevalue' : 'newVal2'
            }
        });
    });

});