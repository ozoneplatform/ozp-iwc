ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * System entity that evaluates applicable policy and renders an authorization decision.
 * @class PDP
 * @namespace ozpIwc.policyAuth
 *
 * @param {Object} config
 * @constructor
 */
ozpIwc.policyAuth.PDP = function(config){
    config=config || {};

    /**
     * Policy Repository Point
     * @property prp
     * @type {ozpIwc.policyAuth.PRP}
     * @default {}
     */
    this.prp = config.prp || {};


    /**
     * Policy Information Point
     * @property pip
     * @type {ozpIwc.policyAuth.PIP}
     * @default {}
     */
    this.pip = config.pip || {};
};


/**
 * @method isPermitted(request)
 * @param {Object | String} [request.subject]       The subject attributes or id performing the action.
 * @param {Object | String} [request.resource]      The resource attributes or id that is being acted upon.
 * @param {Object | String} [request.action]        The action attributes.  A string should be interpreted as the
 *                                                  value of the “action-id” attribute.
 * @param {Array<String>} [request.policies]        A list of URIs applicable to this decision.
 * @param {String} [request. combiningAlgorithm]    Only supports “deny-overrides”
 * @returns {Promise}
 */
ozpIwc.policyAuth.PDP.prototype.isPermitted = function(request){
    var self = this;
   this.formatRequest(request).then(function(formattedRequest){
       self.prp.getPolicy(formattedRequest.policies, formattedRequest.combiningAlgorithm).then(function(eval){

           /*@TODO policy evaluation not yet complete*/
           eval(formattedRequest.category);
       });

   });
};

ozpIwc.policyAuth.PDP.prototype.formatRequest = function(request){
    var promises = [];
    var subject = request.subject;
    var resource = request.resouce;
    var action = request.action;

    if(typeof request.subject === "string"){
        subject = pip.getAttributes(request.subject);
    }
    if(typeof request.resource === "string"){
        resource = pip.getAttributes(request.resource);
    }
    if(typeof request.action === "string"){
        action = {
            'dataType': "http://www.w3.org/2001/XMLSchema#string",
            'attributeValue': request.action
        };
    }
    promies.push(subject,resource,action);

    return Promise.all(promises).then(function(gatheredAttributes){
        var sub = gatheredAttributes[0];
        var res = gatheredAttributes[1];
        var act = gatheredAttributes[2];
        return({
            'category':{
                "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": sub,
                "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": res,
                "urn:oasis:names:tc:xacml:3.0:attribute-category:action": act
            },
            'combiningAlgorithm': request.combiningAlgorithm,
            'policies': request.policies
        });
    });
};