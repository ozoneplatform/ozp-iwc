var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * @module ozpIwc.policyAuth
 */

/**
 * @class PolicyCombining
 * @namespace ozpIwc.policyAuth
 * @static
 */
ozpIwc.policyAuth.PolicyCombining = (function (PolicyCombining) {

    /**
     * @method deny-overrides
     * @static
     * @param {Object} policies
     * @param {Object} request
     */
    PolicyCombining['deny-overrides'] = function (policies, request) {
        var atLeastOneErrorD,
            atLeastOneErrorP,
            atLeastOneErrorDP,
            atLeastOnePermit = false;

        for (var i in policies) {
            var decision = policies[i](request);
            switch (decision) {
                case "Deny":
                    return "Deny";
                case "Permit":
                    atLeastOnePermit = true;
                    break;
                case "NotApplicable":
                    continue;
                case "Indeterminate{D}":
                    atLeastOneErrorD = true;
                    break;
                case "Indeterminate{P}":
                    atLeastOneErrorP = true;
                    break;
                case "Indeterminate{DP}":
                    atLeastOneErrorDP = true;
                    break;
                default:
                    continue;
            }
        }

        if (atLeastOneErrorDP) {
            return "Indeterminate{DP}";
        } else if (atLeastOneErrorD && (atLeastOneErrorP || atLeastOnePermit)) {
            return "Indeterminate{DP}";
        } else if (atLeastOneErrorD) {
            return "Indeterminate{D}";
        } else if (atLeastOnePermit) {
            return "Permit";
        } else if (atLeastOneErrorP) {
            return "Indeterminate{P}";
        }

        return "NotApplicable";
    };

    /**
     * @method permit-overrides
     * @todo
     */
    PolicyCombining['permit-overrides'] = function () {};

    /**
     * @method first-applicable
     * @todo
     */
    PolicyCombining['first-applicable'] = function () {};

    /**
     * @method only-one-applicable
     * @todo
     */
    PolicyCombining['only-one-applicable'] = function () {};

    /**
     * @method ordered-deny-overrides
     * @todo
     */
    PolicyCombining['ordered-deny-overrides'] = function () {};

    /**
     * @method ordered-permit-overrides
     * @todo
     */
    PolicyCombining['ordered-permit-overrides'] = function () {};

    /**
     * @method deny-unless-permit
     * @todo
     */
    PolicyCombining['deny-unless-permit'] = function () {};

    /**
     * @method permit-unless-deny
     * @todo
     */
    PolicyCombining['permit-unless-deny'] = function () {};

    return PolicyCombining;
}(ozpIwc.policyAuth.PolicyCombining || {}));