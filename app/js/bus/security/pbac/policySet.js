ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * A collection of {{#crossLink "ozpIwc.authorization.Policy"}}{{/crossLink}}.
 * @class PolicySet
 * @namespace ozpIwc.authorization
 *
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.PolicySet = function(config){
    config=config || {};
    /**
     * @property target
     * @type Object
     * @default {}
     */
    this.target = config.target || {};

    /**
     * Specifies the procedure by which the results of evaluating the component policies are combined when
     * evaluating the policy
     *
     * @property ruleCombining
     * @type Function
     * @default null
     */
    this.policyCombining = config.policyCombining || null;

    /**
     * An array of {{#crossLink "ozpIwc.authorization.Policy"}}{{/crossLink}}
     * @property rules
     * @type Array<ozpIwc.authorization.Policy>
     * @default []
     */
    this.policies = config.policies || [];

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