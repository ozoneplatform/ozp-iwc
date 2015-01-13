ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * The <AnyOf> element SHALL contain a disjunctive sequence of <AllOf> elements.
 *
 * The <AnyOf> element is of AnyOfType complex type.
 *
 * @class AnyOf
 * @namespace ozpIwc.policyAuth
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.AnyOf = function(config){

    /**
     * The <AllOf> element SHALL contain a conjunctive sequence of <Match> elements.
     * @property allOf
     * @type {Array<ozpIwc.policyAuth.AllOf>}
     */
    this.allOf = config.allOf || [];
};
