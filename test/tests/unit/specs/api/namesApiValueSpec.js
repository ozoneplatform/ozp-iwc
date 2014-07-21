function namesApiValueContractTests(classUnderTest,baseConfig) {
    describe("Conforms to the CommonApiValue contract", function() {
        commonApiValueContractTests(classUnderTest);
    });

    var value;
    var config;

    beforeEach(function() {
        config = {
            'resource': "/address/testAddress",
            'contentType': "testContentType",
            'permissions': ['perms'],
            'version': 1
        };
        value = new classUnderTest(config);
    });

    it("updates the version when adding an address",function() {
        var originalVersion=value.version;
        value.set({
                resource: '/address/testAddress',
                'entity' : {'pType':"testType", 'address': "testAddress", 'name': "testName" }}
        );
        expect(value.version).toEqual(originalVersion+1);
    });

describe("Names API Value", function() {
    namesApiValueContractTests(ozpIwc.NamesApiValue);
});