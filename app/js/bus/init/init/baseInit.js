/**
 * baseInit.js contains any bus component instantiation that does not have a configuration flag that can toggle behavior.
 * defaultWiring.js follows baseInit.js in load order.
 */
var ozpIwc=ozpIwc || {};

(function () {
    // Configure logging, take precedence of query param over config param.
    var params = ozpIwc.util.parseQueryParams();
    ozpIwc.log.setThreshold(ozpIwc.config.logLevel);
    if (params.log) {
        try {
            console.log("Setting log level to ", params.log);
            ozpIwc.log.setThreshold(ozpIwc.log[params.log.toUpperCase()]);
        } catch (e) {
            // just ignore it and leave the default level
        }
    }

    // Initialize authorization
    ozpIwc.authorization = new ozpIwc.policyAuth.PDP({
        'pip': new ozpIwc.policyAuth.PIP(),
        'prp': new ozpIwc.policyAuth.PRP(),
        'setsEndpoint': ozpIwc.policyRootUrl
    });

})();