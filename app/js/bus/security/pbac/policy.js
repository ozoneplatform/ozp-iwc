ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * 3.3.2 Policy
 * Rules are not exchanged amongst system entities. Therefore, a PAP combines rules in a policy.
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
ozpIwc.policyAuth.Policy = function(config){
    config=config || {};

    /**
     * @property target
     * @type Object
     * @default {}
     */
    this.target = config.target || {};

    /**
     * Specifies the procedure by which the results of evaluating the component rules are combined when
     * evaluating the policy
     *
     * @property ruleCombining
     * @type Function
     * @default null
     */
    this.ruleCombining = config.ruleCombining || null;

    /**
     * An array of {{#crossLink "ozpIwc.policyAuth.Rule"}}{{/crossLink}}
     * @property rules
     * @type Array<ozpIwc.policyAuth.Rule>
     * @default []
     */
    this.rules = config.rules || [];

    /**
     * An array of Obligations expressions to be evaluated and returned to the PEP in the response context.
     *
     * @property obligations
     * @type Array<Function>
     * @default []
     */
    this.obligations = config.obligations || [];

    /**
     * An array of Advice expressions to be evaluated and returned to the PEP in the response context. Advices can be
     * ignored by the PEP.
     *
     * @property advices
     * @type Array<Function>
     * @default []
     */
    this.advices = config.advices || [];

};