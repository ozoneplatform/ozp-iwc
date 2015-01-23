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
    this.ruleCombiningAlgId = config.ruleCombiningAlgId;

    /**
     * An array of {{#crossLink "ozpIwc.policyAuth.Rule"}}{{/crossLink}}
     * @property rules
     * @type Array<ozpIwc.policyAuth.Rule>
     * @default []
     */
    this.rule = config.rule || [];

});

/**
 *
 * @TODO request is formatted by urn. see a request.category.
 *
 * @method evaluate(request)
 * @param {Object | String} [request.subject]  The subject attributes or id performing the action.
 * @param {Object | String} [request.resource] The resource attributes or id that is being acted upon.
 * @param {Object | String} [request.action]  The action attributes.  A string should be interpreted as the
 *                                            value of the “action-id” attribute.
 * @param {Array<String>} [request.policies]  A list of URIs applicable to this decision.
 * @param {String} [request. combiningAlgorithm]  Only supports “deny-overrides”
 * @returns {Promise}
 */
ozpIwc.policyAuth.Policy.prototype.evaluate = function(request){

    //@TODO implement a rule constructor.
    return "Permit";
};