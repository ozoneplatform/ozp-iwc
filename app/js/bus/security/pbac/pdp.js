ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * System entity that evaluates applicable policy and renders an authorization decision.
 * @class PDP
 * @namespace ozpIwc.policyAuth
 *
 * @param {Object} config
 * @constructor
 */
ozpIwc.policyAuth.PDP = function(config){
    config=config || {};
    /**
     * An events module for the API.
     * @property events
     * @type Event
     */
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);

    /**
     * A cache of policies
     * @TODO define how desired policies will be loaded in from the back-end
     * @property policies
     */
    this.policies= config.policies || [];

    /**
     * An array of policy URIs to load.
     * @property loadPolicies
     * @type {Array<String>}
     */
    this.loadPolicies = config.loadPolicies || [];

    this.hasInitialized = false;
};

/**
 *  Sends a request to the given URI to retrieve the desired Policy Set.
 *  If the set cannot be retrieved, the desired set will default to always deny.
 * @TODO
 * @method gatherPolicies
 * @param {Object} config
 * @param {String} config.policyID The unique ID of the policy to gather
 * @param {String} config.uri The uri path of where the policy is expected to be found.
 */
ozpIwc.policyAuth.PDP.prototype.gatherPolicies = function(uri){
        var uriArray = Array.isArray(uri) ? uri : [uri];
        var promiseArray = [];
        var self = this;
        for(var i in uriArray){
            var promise = ozpIwc.util.ajax({
                href: uri[i],
                method: "GET"
            }).then(function (resp) {
                var response = resp.response;
                // We have to catch because onload does json.parse.... and this is xml... @TODO fix...
                var policies = [];
                for (var i in response.children) {
                    if (response.children[i].tagName === "Policy") {
                        policies.push(response.children[i]);
                    }
                }

                for (var i in policies) {
                    var policy = new ozpIwc.policyAuth.Policy({element: policies[i]});
                    self.policies.push(policy);
                }
            });
            promiseArray.push(promise);
        }
        return Promise.all(promiseArray);
};

/**
 * Processes an {{#crossLink "ozpIwc.policyAuth.PEP"}}{{/crossLink}} request.
 * @method handleRequest
 * @param request
 * @returns {Promise}
 */
ozpIwc.policyAuth.PDP.prototype.handleRequest = function(request) {
    var process = function() {
        return new Promise(function (resolve, reject) {
            var result = self.policies.some(function (policy) {
                return policy.evaluate(request) === "Permit";
            }, self);

            if (result) {
                resolve();
            } else {
                reject();
            }
        })
    };

    if(!this.hasInitialized){
        var self = this;
        return self.gatherPolicies(this.loadPolicies).then(function() {
            self.hasInitialized = true;
            return process();
        });
    } else {
        return process();
    }
};
