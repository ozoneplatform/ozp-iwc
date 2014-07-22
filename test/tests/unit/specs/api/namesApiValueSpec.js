function namesApiValueContractTests(classUnderTest,baseConfig) {
    describe("Conforms to the CommonApiValue contract", function () {
        commonApiValueContractTests(classUnderTest);
    });

    var value;
    var config;

    beforeEach(function () {
        config = {
            'resource': "/address/testAddress",
            'contentType': "testContentType",
            'permissions': ['perms'],
            'version': 1
        };
        value = new classUnderTest(config);
    });

    it("updates the version when adding an address", function () {
        var originalVersion = value.version;
        value.set({
                resource: '/address/testAddress',
                'entity': {'pType': "testType", 'address': "testAddress", 'name': "testName" }}
        );
        expect(value.version).toEqual(originalVersion + 1);
    });

    it("resets the version when deleting an address",function() {
        value.deleteData();
        expect(value.version).toEqual(0);
    });

    it("deletes an address idempotently",function() {
        value.deleteData();
        value.deleteData();
        expect(value.version).toEqual(0);
    });
};

describe("Names API Value", function() {
    namesApiValueContractTests(ozpIwc.NamesApiValue);
});