ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * System entity that performs access control, by making decision requests and enforcing authorization decisions.
 *
 * @class PEP
 * @namespace ozpIwc.policyAuth
 *
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.PEP = function(config){
    config=config || {};

    /**
     * The Policy Decision Point to which this PEP will send requests to be authorized.
     * @property PDP
     * @type {ozpIwc.policyAuth.PDP}
     * @default ozpIwc.defaultPDP
     */
    this.PDP = config.PDP || ozpIwc.authorization;

};

/**
 * Sends a request to the PDP to determine whether the given action has authority to be completed.
 * @TODO
 * @method decide
 * @param {Object} request
 * @returns {Promise}
 */
ozpIwc.policyAuth.PEP.prototype.request = function(request){
    return this.PDP.handleRequest(request);
};