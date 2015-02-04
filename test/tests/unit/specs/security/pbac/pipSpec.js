describe("Policy Information Point",function() {

    var pip;

    beforeEach(function(){

        spyOn(ozpIwc.util,"ajax").and.callFake(function(){
            return new Promise(function(resolve,reject){
               resolve({
                   'attributeValue': "serverLoadedVal"
                });
            });
        });

        pip = new ozpIwc.policyAuth.PIP({
            informationCache : {
                'ozp:attributeCollection:fake': [
                    {
                        'attributeValue': "fakeVal"
                    },
                    {
                        'attributeValue': "otherFakeVal"
                    }
                ]
            }
        });
    });

    it("returns an attribute from the cache if possible",function(done){
        pip.getAttributes('ozp:attributeCollection:fake').then(function(attr){
            expect(attr).toEqual({
                'ozp:attributeCollection:fake': pip.informationCache['ozp:attributeCollection:fake']
            });
            done();
        });
    });

    it('sends a request to the attributes URI/URN to gather attributes not in the cache',function(done){
        pip.getAttributes('ozp:attributeCollection:NOTINCACHE').then(function(attr){
            expect(attr).toEqual({
                'ozp:attributeCollection:NOTINCACHE': {
                    'attributeValue': ["serverLoadedVal"]
                }
            });
            done();
        });
    });

    it('grants Attributes to an existing attributeId',function(){
        pip.grantAttributes('ozp:attributeCollection:fake',[
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ]);
        expect(pip.informationCache['ozp:attributeCollection:fake']).toEqual([
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ]);
    });

    it('grants Attributes to a non existing attributeId ',function(){
        pip.grantAttributes('ozp:attributeCollection:fake2',[
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ]);
        expect(pip.informationCache['ozp:attributeCollection:fake2']).toEqual([
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ]);
    });

    it('grants Attributes from a parent to an existing attributeId',function(done){
        pip.informationCache['ozp:attributeCollection:parent'] = [
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ];

        pip.grantParent('ozp:attributeCollection:fake','ozp:attributeCollection:parent').then(function(){
            expect(pip.informationCache['ozp:attributeCollection:fake']).toEqual([

                {
                    'attributeValue': "fakeVal"
                },
                {
                    'attributeValue': "otherFakeVal"
                },
                {
                    'attributeValue' : 'newVal'
                },
                {
                    'attributeValue' : 'newVal2'
                }
            ]);
            done();
        });
    });

    it('grants Attributes from a parent to a non existing attributeId',function(){
        pip.informationCache['ozp:attributeCollection:parent'] = [
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ];

        pip.grantParent('ozp:attributeCollection:fake2','ozp:attributeCollection:parent');


        expect(pip.informationCache['ozp:attributeCollection:fake2']).toEqual([
            {
                'attributeValue' : 'newVal'
            },
            {
                'attributeValue' : 'newVal2'
            }
        ]);
    });

});