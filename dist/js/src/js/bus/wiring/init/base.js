/**
 * baseInit.js contains any bus component instantiation that does not have a configuration flag that can toggle
 * behavior. defaultWiring.js follows baseInit.js in load order.
 */
var ozpIwc = ozpIwc || {};
ozpIwc.wiring = (function (config, wiring, log) {
    // Configure logging, take precedence of query param over config param.
    var params = ozpIwc.util.parseQueryParams();

    log.setThreshold(ozpIwc.config.logLevel);
    if (params.log) {
        try {
            console.log("Setting log level to ", params.log);
            log.setThreshold(ozpIwc.log[params.log.toUpperCase()]);
        } catch (e) {
            // just ignore it and leave the default level
        }
    }

    // Initialize metrics
    wiring.metrics = new ozpIwc.metric.Registry();

    // Initialize authorization
    wiring.authorization = new ozpIwc.policyAuth.points.PDP({
        'pip': new ozpIwc.policyAuth.points.PIP(),
        'prp': new ozpIwc.policyAuth.points.PRP(),
        'setsEndpoint': config.policyRootUrl
    });

    wiring.ajaxQueue = new ozpIwc.util.AjaxPersistenceQueue({
        poolSize: config.ajaxPoolSize
    });

    return wiring;

})(ozpIwc.config, ozpIwc.wiring || {}, ozpIwc.log);