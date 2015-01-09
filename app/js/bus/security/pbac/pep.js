ozpIwc = ozpIwc || {};

ozpIwc.security = ozpIwc.security || {};

/**
 * System entity that performs access control, by making decision requests and enforcing authorization decisions.
 *
 * @class PEP
 * @namespace ozpIwc.security
 *
 * @param config
 * @constructor
 */
ozpIwc.security.PEP = function(config){

    /**
     * The Policy Decision Point to which this PEP will send requests to be authorized.
     * @property PDP
     * @type {ozpIwc.security.PDP}
     * @default ozpIwc.defaultPDP
     */
    this.PDP = config.PDP || ozpIwc.defaultPDP;

};

/**
 * Sends a request to the PDP to determine whether the given action has authority to be completed.
 * @TODO
 * @method decide
 * @param {Object} request
 * @returns {Promise}
 */
ozpIwc.security.PEP.prototype.decide = function(request){
    return this.PDP.handleRequest(request);
};