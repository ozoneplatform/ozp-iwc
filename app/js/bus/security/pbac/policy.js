ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * 3.3.2 Policy
 * Rules are not exchanged amongst system entities. Therefore, a PAP combines rules in a policy.
 *
 * The <Policy> element is of PolicyType complex type.
 *
 * @class Policy
 * @namespace ozpIwc.policyAuth
 *
 *
 * @param {Object} config
 * @param {Object} config.target
 * @param {Function} config.ruleCombining
 * @param {Array<ozpIwc.policyAuth.Rules>} config.rules
 * @param {Array<Function>} config.obligations
 * @param {Array<Function>} config.advices
 * @constructor
 */
ozpIwc.policyAuth.Policy = ozpIwc.util.extend(ozpIwc.policyAuth.BaseElement,function(config) {
    config=config || {};

    /**
     * @property policyId
     * @type String
     * @default null
     */
    this.policyId = config.policyId;

    /**
     * @property version
     * @type Number
     * @default null
     */
    this.version = config.version;

    /**
     * @property description
     * @type String
     * @default null
     */
    this.description = config.description;

    /**
     * @property ruleCombiningAlgId
     * @type String
     * @default null
     */
    this.ruleCombiningAlgId = config.ruleCombiningAlgId || this.ruleCombiningAlgId;

    /**
     * An array of {{#crossLink "ozpIwc.policyAuth.Rule"}}{{/crossLink}}
     * @property rules
     * @type Array<ozpIwc.policyAuth.Rule>
     * @default []
     */
    this.rule = [];

    for(var i in config.rule){
        // If the rule has an evaluate function, its already constructed
        if(config.rule[i].evaluate){
            this.rule.push(config.rule[i]);
        } else {
            this.rule.push(new ozpIwc.policyAuth.Rule(config.rule[i]));
        }
    }

});

/**
 * Default value
 * @property ruleCombiningAlgId
 * @type {string}
 * @default 'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides'
 */
ozpIwc.policyAuth.Policy.prototype.ruleCombiningAlgId = 'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides';

/**
 *
 * @TODO request is formatted by urn. see a request.category.
 *
 * @method evaluate(request)
 * @param {Object | String} [request.category.subject]  The subject attributes or id performing the action.
 * @param {Object | String} [request.category.resource] The resource attributes or id that is being acted upon.
 * @param {Object | String} [request.category.action]  The action attributes.  A string should be interpreted as the
 *                                            value of the “action-id” attribute.
 * @param {Array<String>} [request.policies]  A list of URIs applicable to this decision.
 * @param {String} [request. combiningAlgorithm]  Only supports “deny-overrides”
 * @returns {Promise}
 */
ozpIwc.policyAuth.Policy.prototype.evaluate = function(request){
    return ozpIwc.policyAuth.RuleCombining[this.ruleCombiningAlgId](this.rule,request);

};