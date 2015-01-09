ozpIwc = ozpIwc || {};

ozpIwc.security = ozpIwc.security || {};

/**
 * System entity that evaluates applicable policy and renders an authorization decision.
 * @class PDP
 * @namespace ozpIwc.security
 *
 * @param {Object} config
 * @constructor
 */
ozpIwc.security.PDP = function(config){
    /**
     * An events module for the API.
     * @property events
     * @type Event
     */
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
};

/**
 *  Sends a request to the given URI to retrieve the desired Policy Set.
 *  If the set cannot be retrieved, the desired set will default to always deny.
 * @TODO
 * @method gatherPolicies
 * @param {Object} config
 * @param {String} config.policyID The unique ID of the policy to gather
 * @param {String} config.uri The uri path of where the policy is expected to be found.
 */
ozpIwc.security.PDP.gatherPolicies = function(uri){

};

/**
 * Processes an {{#crossLink "ozpIwc.security.PEP"}}{{/crossLink}} request.
 * @TODO
 * @method handleRequest
 * @param request
 * @returns {Promise}
 */
ozpIwc.security.PDP.handleRequest = function(request){
    var self = this;
    return new Promise(function(resolve,reject){
        // a hook for logging capabilities
        self.events.trigger("pepRequest",request);
        reject("NOT IMPLEMENTED");
    });
};