describe("Endpoint Registry",function() {
    var responses={
        'api': {
            '_links': {
                "data" : "data/v1",
                "intents" : "intents/v1",
                "applications": "applications/v2"
            }
        }
    };

    beforeEach(function() {
        spyOn(ozpIwc.util,"ajax").and.callFake(function(config) {
            var result=new ozpIwc.AsyncAction();
            if(config.href in responses) {
                result.resolve("success",responses[config.href]);
            }else{
                result.resolve("failure","Not Found","");
            }
            return result;
        });
    });


    it("loads the API from the default root",function() {
        var e=new ozpIwc.Endpoints();
        expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href':"api"}));
    });
    
    it("loads the API from a specified root",function() {
        var e=new ozpIwc.Endpoints({'apiRoot':"foo/bar"});
        expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href':"foo/bar"}));
    });
    
    it("contains the linked endpoints",function() {
        var e=new ozpIwc.Endpoints();
        expect(e.endpoint("data")).toBeDefined();
        expect(e.endpoint("intents")).toBeDefined();
        expect(e.endpoint("applications")).toBeDefined();
        expect(e.endpoint("doesNotExist")).toBeNull();
    });
    
    [["data","/foo/bar","data/v1/foo/bar"],
     ["applications","/1/2/3/4","applications/v2/1/2/3/4"],    
     ["data","","data/v1"],    
     ["data","/","data/v1/"]
    ].forEach(function(d) {
        it("endpoint " + d[0]+ " gets " +d[1] + " from " + d[2],function() {
            var e=new ozpIwc.Endpoints();

            e.endpoint(d[0]).get(d[1]);
            expect(ozpIwc.util.ajax).toHaveBeenCalledWith(jasmine.objectContaining({'href':d[2]}));
        });
    });
    
});