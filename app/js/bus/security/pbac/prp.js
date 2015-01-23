ozpIwc = ozpIwc || {};


ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * Policy Repository Point
 *
 * @param config
 * @param {Object} config.policyCache
 * @constructor
 */
ozpIwc.policyAuth.PRP = function(config){
    config = config || {};

    this.persistentPolicies = config.persistentPolicies || [];
    this.policyCache = config.policyCache || {};


};


/**
 * @method getPolicy(policyURIs,combiningAlgorithm)
 * @param {String | Array<String> } [policyURIs] The subject attributes or id performing the action.
 * @param {String} [combiningAlgorithm] Defaults to “deny-overrides”.
 * @return {Promise} promise chain, A function that evaluates the policies and returns a decision will be passed to the
 *                   chained "then".
 */
ozpIwc.policyAuth.PRP.prototype.getPolicy = function(policyURIs,combiningAlgorithm){
    policyURIs = policyURIs || [];
    Array.isArray(policyURIs)? policyURIs : [policyURIs];
    var policies = [];

    var combiningFunction = ozpIwc.policyAuth.PolicyCombining[combiningAlgorithm] ||
        ozpIwc.policyAuth.PolicyCombining[this.defaultCombiningAlgorithm];

    var policiesToGather = this.persistentPolicies.concat(policyURIs);
    for(var i in policiesToGather){
        if(this.policyCache[policiesToGather[i]]){
            policies.push(this.policyCache[policiesToGather[i]]);
        } else {
            var promise = this.fetchPolicy(policiesToGather [i]);

            //Push the policy fetch to the array, when it resolves its value (policy) will be part of the array
            policies.push(promise);
        }
    }

    // If there are no policies to check against, assume trivial and permit
    if(policies.length === 0){
        return new Promise(function(resolve,reject){
            resolve(ozpIwc.abacPolicies.permitAll);
        });
    }

    return Promise.all(policies).then(function(policies){
        return function(request){
            return combiningFunction(policies,request);
        };
    });
};

ozpIwc.policyAuth.PRP.prototype.defaultCombiningAlgorithm =
    "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides";

/**
 * @method fetchPolicy
 * @param {String} policyURI the uri to gather the policy from
 * @returns {Promise} promise chain, the policy will be passed to the chained "then".
 */
ozpIwc.policyAuth.PRP.prototype.fetchPolicy = function(policyURI){
    var self = this;
    return ozpIwc.util.ajax({
        'method': "GET",
        'href': policyURI
    }).then(function(data){
        self.policyCache[policyURI] = self.formatPolicy(data.response);
        return self.policyCache[policyURI];
    })['catch'](function(e){
        self.policyCache[policyURI] = ozpIwc.abacPolicies.denyAll;
        return self.policyCache[policyURI];
    });
};

ozpIwc.policyAuth.PRP.prototype.formatPolicy = function(data){
    return new ozpIwc.policyAuth.Policy(data);
};