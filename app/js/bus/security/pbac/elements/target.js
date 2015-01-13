ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};


/**
 * The <Target> element identifies the set of decision requests that the parent element is intended to evaluate.
 * The <Target> element SHALL appear as a child of a <PolicySet> and <Policy> element and MAY appear as a child of
 * a <Rule> element.
 *
 * The <Target> element is of TargetType complex type.
 *
 * @class Target
 * @namespace ozpIwc.policyAuth
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.Target = function(config){

    /**
     * Matching specification for attributes in the context.  If this element is missing, then the target
     * SHALL match all contexts.
     * @property anyOf
     * @type {Array<ozpIwc.policyAuth.AnyOf>}
     */
    this.anyOf = config.anyOf || [];
}