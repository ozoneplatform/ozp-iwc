function dataApiValueContractTests(classUnderTest,baseConfig) {
    describe("Conforms to the CommonApiValue contract", function() {
        commonApiValueContractTests(classUnderTest);
    });
    
    var value;
    var config;

    beforeEach(function() {
        config = {
            'resource': "testResource",
            'entity': {'foo': 1},
            'contentType': "testContentType",
            'permissions': ['perms'],
            'version': 1
        };
        value = new classUnderTest(config);
    });
    
    it("push and pops children",function() {
        value.pushChild("child1");
        value.pushChild("child2");
        value.pushChild("child3");
        
        expect(value.listChildren()).toEqual(["child1","child2","child3"]);
        
        var v=value.popChild();
        
        expect(v).toEqual("child3");
        expect(value.listChildren()).toEqual(["child1","child2"]);
    });
    it("unshifts and shifts children",function() {
        value.unshiftChild("child1");
        value.unshiftChild("child2");
        value.unshiftChild("child3");
        
        expect(value.listChildren()).toEqual(["child3","child2","child1"]);
        
        var v=value.shiftChild();
        
        expect(v).toEqual("child3");
        expect(value.listChildren()).toEqual(["child2","child1"]);
    });

    it("generates changes for added children",function() {
        var snapshot=value.snapshot();
        
        value.unshiftChild("child1");
        value.unshiftChild("child2");
        value.pushChild("child3");
        value.pushChild("child4");
        
        var diff=value.changesSince(snapshot);
        expect(diff.addedChildren).toEqual(["child2","child1","child3","child4"])
        expect(diff.removedChildren).toEqual([]);
    });
    it("generates changes for removed children",function() {
        
        value.unshiftChild("child1");
        value.unshiftChild("child2");
        value.pushChild("child3");
        value.pushChild("child4");
        
        var snapshot=value.snapshot();
        value.shiftChild();
        value.popChild();
        var diff=value.changesSince(snapshot);

        expect(diff.addedChildren).toEqual([]);
        expect(diff.removedChildren).toEqual(["child2","child4"]);
        
    });
       it("generates changes for combined added and removed children",function() {
        
        value.unshiftChild("child1");
        value.unshiftChild("child2");
        value.pushChild("child3");
        value.pushChild("child4");
        
        var snapshot=value.snapshot();
        
        value.shiftChild();
        value.popChild();
        value.unshiftChild("child5");
        value.pushChild("child6");
        
        var diff=value.changesSince(snapshot);

        expect(diff.addedChildren).toEqual(["child5","child6"]);
        expect(diff.removedChildren).toEqual(["child2","child4"]);        
    });
};

describe("Data API Value", function() {
    dataApiValueContractTests(ozpIwc.DataApiValue);
});