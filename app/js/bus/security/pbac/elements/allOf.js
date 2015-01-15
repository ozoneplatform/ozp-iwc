ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * The <AllOf> element SHALL contain a conjunctive sequence of <Match> elements.
 *
 * The <AllOf> element is of AllOfType complex type.
 *
 * @class AllOf
 * @namespace ozpIwc.policyAuth
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.AllOf = ozpIwc.util.extend(ozpIwc.policyAuth.BaseElement,function(config) {

    /**
     * A conjunctive sequence of individual matches of the attributes in the request context and the embedded
     * attribute values
     *
     * @property allOf
     * @type {Array<ozpIwc.policyAuth.Match>}
     */
    this.match = config.allOf || [];
});
