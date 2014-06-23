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
    
    xit("push and pops children",function() {
        value.push("")
    });
    xit("unshifts and shifts children",function() {
        
    });
    xit("generates changes for children",function() {
        
    });
    
};

describe("Data API Value", function() {
    dataApiValueContractTests(ozpIwc.DataApiValue);
});