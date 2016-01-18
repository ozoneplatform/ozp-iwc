var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.points
 */

ozpIwc.policyAuth.points.PRP = (function (policyAuth, util) {
    /**
     * Policy Repository Point
     * @class PRP
     * @namespace ozpIwc.policyAuth.points
     * @param [config]
     * @param {Array} [config.persistentPolicies]
     * @param {Object} [config.policyCache]
     * @constructor
     */
    var PRP = function (config) {
        config = config || {};

        /**
         * @property persistentPolicies
         * @type {Array}
         */
        this.persistentPolicies = config.persistentPolicies || [];

        /**
         * @property policyCache
         * @type {Object}
         */
        this.policyCache = config.policyCache || policyAuth.policies;
    };

    /**
     * Gathers policies by their URN. These policies may need formatting by the formatPolicies function to gather any
     * attribute data needed for the policy evaluation.
     * If a policy cannot be found, it is labeled as a "denyAll" policy and placed in the cache. Thus, making any
     * permission check using said policy always deny.
     *
     * @method getPolicy(policyURIs)
     * @param {String | Array<String> } [policyURIs] The subject attributes or id performing the action.
     * @param {String} [combiningAlgorithm] Defaults to “deny-overrides”.
     * @return {ozpIwc.util.AsyncAction} will resolve with an array of policy data.
     */
    PRP.prototype.getPolicies = function (policyURIs) {
        var asyncAction = new util.AsyncAction();
        policyURIs = policyURIs || [];
        policyURIs = util.ensureArray(policyURIs);
        var policies = [];

        var policiesToGather = this.persistentPolicies.concat(policyURIs);
        for (var i in policiesToGather) {
            if (this.policyCache[policiesToGather[i]]) {
                policies.push(util.clone(this.policyCache[policiesToGather[i]]));
            } else {
                var async = this.fetchPolicy(policiesToGather[i]);

                //Push the policy fetch to the array, when it resolves its value (policy) will be part of the array
                policies.push(async);
            }
        }

        // If there are no policies to check against, assume trivial and permit
        if (policies.length === 0) {
            return asyncAction.resolve('success', [policyAuth.policies.permitAll]);
        }

        return util.AsyncAction.all(policies);
    };


    /**
     * The URN of the default combining algorithm to use when basing a decision on multiple rules in a policy.
     * @TODO not used.
     * @property defaultCombiningAlgorithm
     * @type {String}
     * @default 'deny-overrides'
     */
    PRP.prototype.defaultCombiningAlgorithm = 'deny-overrides';

    /**
     * Fetches the requested policy and stores a copy of it in the cache. Returns a denyAll if policy is unobtainable.
     * @method fetchPolicy
     * @param {String} policyURI the uri to gather the policy from
     * @return {util.AsyncAction} will resolve with the gathered policy constructed as an ozpIwc.policyAuth.Policy.
     */
    PRP.prototype.fetchPolicy = function (policyURI) {
        var asyncAction = new util.AsyncAction();
        var self = this;
        util.ajax({
            'method': "GET",
            'href': policyURI
        }).then(function (data) {
            self.policyCache[policyURI] = self.formatPolicy(data.response);
            asyncAction.resolve('success', util.clone(self.policyCache[policyURI]));
        })['catch'](function (e) {
            //Note: failure resolves success because we force a denyAll policy.
            asyncAction.resolve('success', self.getDenyall(policyURI));
        });
        return asyncAction;
    };

    /**
     * Turns JSON data in to ozpIwc.policyAuth.Policy
     * @method formatPolicy
     * @param data
     * @return {ozpIwc.policyAuth.Policy}
     */
    PRP.prototype.formatPolicy = function (data) {
        return new policyAuth.Policy(data);
    };

    /**
     * Returns a policy that will always deny any request. Said policy is stored in the cache under the given URN
     * @param urn
     * @return {ozpIwc.policyAuth.Policy} a denyAll policy
     */
    PRP.prototype.getDenyall = function (urn) {
        if (this.policyCache[urn]) {
            return this.policyCache[urn];
        } else {
            this.policyCache[urn] = policyAuth.policies.denyAll;
            return this.policyCache[urn];
        }
    };

    return PRP;
}(ozpIwc.policyAuth, ozpIwc.util));
