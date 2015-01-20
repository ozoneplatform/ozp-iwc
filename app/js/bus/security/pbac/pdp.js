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

    var self = this;
    if(!this.hasInitialized){
        return self.gatherPolicies(this.loadPolicies).then(function() {
            self.hasInitialized = true;
            return new Promise(function (resolve, reject) {
                var result = self.policies.some(function (policy) {
                    return policy.evaluate(request) === "Permit";
                }, self);

                if (result) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    } else {
            return new Promise(function (resolve, reject) {
                var result = self.policies.some(function (policy) {
                    return policy.evaluate(request) === "Permit";
                }, self);

                if (result) {
                    resolve();
                } else {
                    reject();
                }
            });
    }
};


/**
 * Creates a policy for the given participant to be able to send with its given address
 * @method addSendAsPolicy
 * @param {object} config
 * @param {object} config.subject
 * @param {*} config.subject.value
 * @param [String] config.subject.matchId
 * @param [String] config.subject.dataType
 * @param {object} config.resource
 * @param {*} config.resource.value
 * @param [String] config.resource.matchId
 * @param [String] config.resource.dataType
 * @param {object} config.action
 * @param {*} config.action.value
 * @param [String] config.action.matchId
 * @param [String] config.action.dataType
 */
ozpIwc.policyAuth.PDP.prototype.addPolicy = function(config){
    config = config || {};
    var policyId;

    if(config.subject && config.resource && config.action){
        policyId = 'urn:ozp:iwc:xacml:policy:'+config.subject.value+':'+config.action.value + ":" + config.resource.value;
        this.policies.push(new ozpIwc.policyAuth.Policy({
            policyId : policyId,
            version: '0.1',
            ruleCombiningAlgId: 'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides',
            target: ozpIwc.policyAuth.util.generateEmptyTarget(),
            rule: [new ozpIwc.policyAuth.Rule({
                ruleId: "urn:ozp:iwc:xacml:rule:sendAs:"+this.address,
                effect: "Permit",
                target: new ozpIwc.policyAuth.Target({
                    anyOf: [
                        // subject, additional attributes can be added to the allOf array
                        new ozpIwc.policyAuth.AnyOf({
                            allOf: [new ozpIwc.policyAuth.util.generateAttributeSubject(config.subject)]
                        }),
                        // resource, additional attributes can be added to the allOf array
                        new ozpIwc.policyAuth.AnyOf({
                            allOf: [new ozpIwc.policyAuth.util.generateAttributeResource(config.resource)]
                        }),
                        // action, additional attributes can be added to the allOf array
                        new ozpIwc.policyAuth.AnyOf({
                            allOf: [new ozpIwc.policyAuth.util.generateAttributeAction(config.action)]
                        })
                    ]
                })
            })]
        }));
    }

    return policyId;
};

ozpIwc.policyAuth.PDP.prototype.removePolicy = function(id){
    for(var i in this.policies){
        if(this.policies[i].policyId === id){
            this.policies.splice(i,1);
        }
    }
};
