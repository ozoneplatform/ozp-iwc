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
 * @method getPolicy(policyURIs)
 * @param {String | Array<String> } [policyURIs] The subject attributes or id performing the action.
 * @param {String} [combiningAlgorithm] Defaults to “deny-overrides”.
 * @return {Promise} promise chain, An array of policy data will be passed to the
 *                   chained "then".
 */
ozpIwc.policyAuth.PRP.prototype.getPolicies = function(policyURIs){
    var asyncAction = new ozpIwc.AsyncAction();
    policyURIs = policyURIs || [];
    policyURIs = Array.isArray(policyURIs)? policyURIs : [policyURIs];
    var policies = [];

    var policiesToGather = this.persistentPolicies.concat(policyURIs);
    for(var i in policiesToGather){
        if(this.policyCache[policiesToGather[i]]){
            policies.push(ozpIwc.util.clone(this.policyCache[policiesToGather[i]]));
        } else {
            var async = this.fetchPolicy(policiesToGather[i]);

            //Push the policy fetch to the array, when it resolves its value (policy) will be part of the array
            policies.push(async);
        }
    }

    // If there are no policies to check against, assume trivial and permit
    if(policies.length === 0){
        asyncAction.resolve('success',[this.getPermitAll()]);
    }

    return ozpIwc.AsyncAction.all(policies);
};



ozpIwc.policyAuth.PRP.prototype.defaultCombiningAlgorithm =
    "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides";

/**
 * Fetches the requested policy and stores a copy of it in the cache. Returns a denyAll if policy is unobtainable.
 * @method fetchPolicy
 * @param {String} policyURI the uri to gather the policy from
 * @returns {AsyncAction} promise chain, the policy will be passed to the chained "then".
 */
ozpIwc.policyAuth.PRP.prototype.fetchPolicy = function(policyURI){
    var asyncAction = new ozpIwc.AsyncAction();
    var self = this;
    ozpIwc.util.ajax({
        'method': "GET",
        'href': policyURI
    }).then(function(data){
        self.policyCache[policyURI] = self.formatPolicy(data.response);
        asyncAction.resolve('success',ozpIwc.util.clone(self.policyCache[policyURI]));
    })['catch'](function(e){
        //Note: failure resolves success because we force a denyAll policy.
        asnyAction.resolve('success',self.getDenyall(policyURI));
    });
    return asyncAction;
};

ozpIwc.policyAuth.PRP.prototype.formatPolicy = function(data){
    return new ozpIwc.policyAuth.Policy(data);
};

ozpIwc.policyAuth.PRP.prototype.getDenyall = function(uri){
    if(this.policyCache[uri]){
        return this.policyCache[uri];
    } else {
        var policy = new ozpIwc.policyAuth.Policy({
            policyId: uri
        });
        policy.evaluate = ozpIwc.abacPolicies.denyAll;
        this.policyCache[uri] = policy;
        return policy;
    }
};

ozpIwc.policyAuth.PRP.prototype.getPermitAll = function(){
    if(this.policyCache['ozp:iwc:policy:none']){
        return this.policyCache['ozp:iwc:policy:none'];
    } else {
        var policy = new ozpIwc.policyAuth.Rule({
            ruleId: 'ozp:iwc:policy:none'
        });
        policy.evaluate = ozpIwc.abacPolicies.permitAll;
        this.policyCache['ozp:iwc:policy:none'] = policy;
        return policy;
    }
};