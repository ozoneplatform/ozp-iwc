var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.points
 */

ozpIwc.policyAuth.points.PDP = (function (policyAuth, util) {
    /**
     * System entity that evaluates applicable policy and renders an authorization decision.
     * @class PDP
     * @namespace ozpIwc.policyAuth.points
     *
     * @param {Object} [config]
     * @param {ozpIwc.policyAuth.points.PRP} [config.prp] Policy Repository Point for the PDP to gather policies from.
     * @param {ozpIwc.policyAuth.points.PIP} [config.pip] Policy Information Point for the PDP to gather attributes
     *     from.
     * @constructor
     */
    var PDP = function (config) {
        config = config || {};

        /**
         * Policy Repository Point
         * @property prp
         * @type {ozpIwc.policyAuth.points.PRP}
         * @default new ozpIwc.policyAuth.points.PRP()
         */
        this.prp = config.prp || new policyAuth.PRP();


        /**
         * Policy Information Point
         * @property pip
         * @type {ozpIwc.policyAuth.points.PIP}
         * @default new ozpIwc.policyAuth.points.PIP()
         */
        this.pip = config.pip || new policyAuth.PIP();

        /**
         * @property policySets
         * @type {Object}
         */
        this.policySets = config.policySets ||
            {
                'connectSet': ["policy://ozpIwc/connect"],
                'apiSet': ["policy://policy/apiNode"],
                'readSet': ["policy://policy/read"],
                'receiveAsSet': ["policy://policy/receiveAs"],
                'sendAsSet': ["policy://policy/sendAs"]
            };
    };


    /**
     * @method isPermitted
     * @param {Object} [request]
     * @param {Object | String} [request.subject]       The subject attributes or id performing the action.
     * @param {Object | String} [request.resource]      The resource attributes or id that is being acted upon.
     * @param {Object | String} [request.action]        The action attributes.  A string should be interpreted as the
     *                                                  value of the “action-id” attribute.
     * @param {Array<String>} [request.policies]        A list of URIs applicable to this decision.
     * @param {String} [request.combiningAlgorithm]    Only supports “deny-overrides”
     * @param {Object} [contextHolder]                  An object that holds 'securityAttribute' attributes to populate
     *     the PIP cache with for request/policy use.
     * @return {ozpIwc.util.AsyncAction} will resolve with 'success' if the policy gives a "Permit".
     *                                    rejects else wise. the async success will receive:
     * ```
     * {
     *     'result': <String>,
     *     'request': <Object> // a copy of the request passed in,
     *     'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
     * }
     * ```
     */
    PDP.prototype.isPermitted = function (request) {
        var asyncAction = new util.AsyncAction();

        var self = this;
        //If there is no request information, its a trivial "Permit"
        if (!request) {
            return asyncAction.resolve('success', {
                'result': "Permit"
            });
        }
        request.combiningAlgorithm = request.combiningAlgorithm || this.defaultCombiningAlgorithm;


        var onError = function (err) {
            asyncAction.resolve('failure', err);
        };
        //Format the request
        policyAuth.points.utils.formatRequest(request, this.pip).success(function onFormattedRequest (formattedRequest) {

                // Get the policies from the PRP
                self.prp.getPolicies(formattedRequest.policies).success(function onGatheredPolicies (policies) {

                        var result = policyAuth.PolicyCombining[formattedRequest.combiningAlgorithm](policies, formattedRequest.category);
                        var response = {
                            'result': result,
                            'request': request,
                            'formattedRequest': formattedRequest
                        };
                        if (result === "Permit") {
                            asyncAction.resolve('success', response);
                        } else {
                            onError(response);
                        }
                    }).failure(onError);
            }).failure(onError);
        return asyncAction;
    };

    /**
     * The URN of the default combining algorithm to use when basing a decision on multiple policies.
     * @property defaultCombiningAlgorithm
     * @type {String}
     * @default "deny-overrides"
     */
    PDP.prototype.defaultCombiningAlgorithm = "deny-overrides";

    return PDP;
}(ozpIwc.policyAuth, ozpIwc.util));
