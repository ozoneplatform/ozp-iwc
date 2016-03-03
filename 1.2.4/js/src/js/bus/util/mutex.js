var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

/**
 * @class mutex
 * @namespace ozpIwc.util
 * @static
 */
ozpIwc.util.mutex = (function (util) {
    var mutex = function (config) {
        config = config || {};
        if (!config.requester) {
            throw "A mutex requires a requester.";
        }
        var requester = config.requester;
        if (!config.resource) {
            throw "A resource is required to lock on.";
        }


        if (config.onUnlock) {
            config.requester.send({
                dst: "locks.api",
                action: "watch",
                resource: config.resource
            }, function (response, done) {
                response = response || {};
                response.entity = response.entity || {};
                response.entity.oldValue = response.entity.oldValue || {};
                response.entity.newValue = response.entity.newValue || {};
                var prevOwner = response.entity.oldValue.owner || {};
                var newOwner = response.entity.newValue.owner || {};

                if (prevOwner.src === requester.address && newOwner.src !== requester.address) {
                    config.onUnlock(response);
                    done();
                }
            });
        }
        return config.requester.send({
            dst: "locks.api",
            action: "lock",
            resource: config.resource
        });
    };

    return mutex;
}(ozpIwc.util));