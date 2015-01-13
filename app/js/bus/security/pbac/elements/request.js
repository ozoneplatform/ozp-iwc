ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * The <Request> element is an abstraction layer used by the policy language.  For simplicity of expression, this
 * document describes policy evaluation in terms of operations on the context.  However a conforming PDP is not
 * required to actually instantiate the context in the form of an XML document.  But, any system conforming to the
 * XACML specification MUST produce exactly the same authorization decisions as if all the inputs had been transformed
 * into the form of an <Request> element.
 *
 * The <Request> element contains <Attributes> elements.  There may be multiple <Attributes> elements with the same
 * Category attribute if the PDP implements the multiple decision profile, see [Multi].  Under other conditions, it
 * is a syntax error if there are multiple <Attributes> elements with the same Category (see Section 7.19.2 for
 * error codes).
 *
 * The <Request> element is of RequestType complex type.
 *
 * @class Request
 * @namespace ozpIwc.policyAuth
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.Request = function(config){

    /**
     * This attribute is used to request that the PDP return a list of all fully applicable policies and policy sets
     * which were used in the decision as a part of the decision response.
     *
     * @property returnPolicyIdList
     * @type {Boolean}
     * @default false
     */
    this.returnPolicyIdList = config.returnPolicyIdList;

    /**
     * This attribute is used to request that the PDP combines multiple decisions into a single decision. The use of
     * this attribute is specified in [Multi]. If the PDP does not implement the relevant functionality in [Multi],
     * then the PDP must return an Indeterminate with a status code of
     * urn:oasis:names:tc:xacml:1.0:status:processing-error if it receives a request with this attribute set to “true”.
     *
     * @property combinedDecision
     * @type {Boolean}
     * @default false
     */
    this.combinedDecision = config.combinedDecision;

    /**
     * Optional. Contains default values for the request, such as XPath version. See section 5.43.
     *
     * @proerty requestDefaults
     * @type {ozpIwc.policyAuth.RequestDefaults}
     */
    this.requestDefaults = config.requestDefaults;

    /**
     * Specifies information about attributes of the request context by listing a sequence of <Attribute> elements
     * associated with an attribute category.  One or more <Attributes> elements are allowed.  Different <Attributes>
     * elements with different categories are used to represent information about the subject, resource, action,
     * environment or other categories of the access request.
     *
     * @property attributes
     * @type {Array<ozpIwc.policyAuth.Attributes>}
     */
    this.attributes = config.attributes;

    /**
     * Lists multiple request contexts by references to the <Attributes> elements. Implementation of this element is
     * optional. The semantics of this element is defined in [Multi]. If the implementation does not implement this
     * element, it MUST return an Indeterminate result if it encounters this element. See section 5.50.
     *
     * @property multiRequests
     * @type {Array<ozpIwc.policyAuth.MultiRequests>}
     */
    this.multiRequests = config.multiRequests;

};