describe("Policy Decision Point",function() {
    describe("Loading", function () {
        it("a policy", function () {
            var pdp = new ozpIwc.policyAuth.PDP();

            pdp.gatherPolicies('/policy/policy.xml');

        });
    });
});