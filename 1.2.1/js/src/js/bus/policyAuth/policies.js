var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * @module ozpIwc.policyAuth
 */
/**
 * Attribute Based Access Control policies.
 * @class policies
 * @namespace ozpIwc.policyAuth
 * @static
 */
ozpIwc.policyAuth.policies = (function (policies, util) {

//---------------------------------------------------------
//  Private Methods
//---------------------------------------------------------
    /**
     * Determines if a request should be permitted by comparing its action to the requested policies action. Then
     * testing if the request subject passes all of the request resources.
     * @method defaultPolicy
     * @private
     * @param {Object} request
     * @param {Object} action
     * @return {String} NotApplicable, Deny, or Permit
     */
    var defaultPolicy = function (request, action) {
        action = util.ensureArray(action);
        if (!util.arrayContainsAll(action, request.action['ozp:iwc:action'])) {
            return "NotApplicable";
        } else if (!util.objectContainsAll(request.subject, request.resource, policies.implies)) {
            return "Deny";
        } else {
            return "Permit";
        }
    };

//---------------------------------------------------------
//  Public Methods
//---------------------------------------------------------
    /**
     * Returns `permit` when the request's object exists and is empty.
     *
     * @static
     * @method permitWhenObjectHasNoAttributes
     * @param request
     * @return {String}
     */
    policies.permitWhenObjectHasNoAttributes = function (request) {
        if (request.object && Object.keys(request.object).length === 0) {
            return "Permit";
        }
        return "Undetermined";
    };

    /**
     * Returns `permit` when the request's subject contains all of the request's object.
     *
     * @static
     * @method subjectHasAllObjectAttributes
     * @param request
     * @return {String}
     */
    policies.subjectHasAllObjectAttributes = function (request) {
        // if no object permissions, then it's trivially true
        if (!request.object) {
            return "Permit";
        }
        var subject = request.subject || {};
        if (util.objectContainsAll(subject, request.object, this.implies)) {
            return "Permit";
        }
        return "Deny";
    };

    /**
     * Returns `permit` for any scenario.
     *
     * @static
     * @method permitAll
     * @return {String}
     */
    policies.permitAll = function () {
        return "Permit";
    };


    /**
     * Returns `Deny` for any scenario.
     *
     * @static
     * @method denyAll
     * @return {String}
     */
    policies.denyAll = function () {
        return "Deny";
    };


    /**
     * Applies trivial logic to determining a subject's containing of object values
     * @static
     * @method implies
     * @param {Array} subjectVal
     * @param {Array} objectVal
     * @return {Boolean}
     */
    policies.implies = function (subjectVal, objectVal) {
        // no object value is trivially true
        if (objectVal === undefined || objectVal === null) {
            return true;
        }
        // no subject value when there is an object value is trivially false
        if (subjectVal === undefined || subjectVal === null) {
            return false;
        }

        // convert both to arrays, if necessary
        subjectVal = util.ensureArray(subjectVal);
        objectVal = util.ensureArray(objectVal);

        // confirm that every element in objectVal is also in subjectVal
        return util.arrayContainsAll(subjectVal, objectVal);
    };

    /**
     * Allows origins to connect that are included in the hard coded whitelist.
     * @method policy://ozpIwc/connect
     * @param request
     * @return {String}
     */
    policies['policy://ozpIwc/connect'] = function (request) {
        var policyActions = ['connect'];

        if (!util.arrayContainsAll(policyActions, request.action['ozp:iwc:action'])) {
            return "NotApplicable";
        } else {
            return "Permit";
        }
    };

    /**
     * Applies the sendAs policy requirements to a default policy. The given request must have an action of 'sendAs'.
     * @method policy://policy/sendAs
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/sendAs'] = function (request) {
        return defaultPolicy(request, 'sendAs');
    };

    /**
     * Applies the receiveAs policy requirements to a default policy. The given request must have an action of
     * 'receiveAs'.
     * @method policy://policy/receiveAs
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/receiveAs'] = function (request) {
        return defaultPolicy(request, 'receiveAs');
    };

    /**
     * Applies the read policy requirements to a default policy. The given request must have an action of 'read'.
     * @method policy://policy/read
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/read'] = function (request) {
        return defaultPolicy(request, 'read');
    };

    /**
     * Applies the api access policy requirements to a default policy. The given request must have an action of
     * 'access'.
     * @method policy://policy/apiNode
     * @param request
     * @param {Object} request.subject
     * @param {Object} request.resource
     * @return {String}
     */
    policies['policy://policy/apiNode'] = function (request) {
        return defaultPolicy(request, 'access');
    };

    return policies;
}(ozpIwc.policyAuth.policies || {}, ozpIwc.util));
