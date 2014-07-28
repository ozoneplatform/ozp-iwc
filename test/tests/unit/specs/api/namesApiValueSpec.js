function namesApiValueContractTests(classUnderTest,baseConfig) {
    describe("Conforms to the CommonApiValue contract", function () {
        commonApiValueContractTests(classUnderTest);
    });

    var addressValue;
    var multicastValue;

    beforeEach(function () {
        var addressConfig = {
            'resource': "/address/testAddress",
            'contentType': "testContentType",
            'permissions': ['perms'],
            'version': 1
        };
        var multicastConfig = {
            'resource': "/multicast/testGroup1",
            'contentType': "testContentType",
            'permissions': ['perms'],
            'version': 1
        };
        addressValue = new classUnderTest(addressConfig);
        multicastValue = new classUnderTest(multicastConfig);
    });

    it("updates the version when adding an address", function () {
        var originalVersion = addressValue.version;
        addressValue.set({
                'entity': {'pType': "testType", 'address': "testAddress", 'name': "testName" }}
        );
        expect(addressValue.version).toEqual(originalVersion + 1);
    });

    it("updates the version when adding a multicast address", function () {
        var originalVersion = multicastValue.version;
        multicastValue.set({'entity': 'testAddress'});
        expect(multicastValue.version).toEqual(originalVersion + 1);
    });

    it("resets the version when deleting an address",function() {
        addressValue.deleteData();
        expect(addressValue.version).toEqual(0);
    });

    it("resets the version when deleting a multicast address",function() {
        multicastValue.deleteData();
        expect(multicastValue.version).toEqual(0);
    });

    it("deletes an address idempotently",function() {
        addressValue.deleteData();
        addressValue.deleteData();
        expect(addressValue.version).toEqual(0);
    });

    it("deletes a multicast address idempotently",function() {
        multicastValue.deleteData();
        multicastValue.deleteData();
        expect(multicastValue.version).toEqual(0);
    });
};

describe("Names API Value", function() {
    namesApiValueContractTests(ozpIwc.NamesApiValue);
});