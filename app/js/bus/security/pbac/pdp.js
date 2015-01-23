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
 * @returns {Promise} will resolve if the policy gives a "Permit", or rejects if else wise. the promise chain will
 *                    receive:
 *                    {
 *                      'result': <String>,
 *                      'request': <Object> // a copy of the request passed in,
 *                      'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
 *                    }
 */
ozpIwc.policyAuth.PDP.prototype.isPermitted = function(request){
    var requestClone = ozpIwc.util.clone(request);
    var self = this;
   return this.formatRequest(request).then(function(formattedRequest){
       return self.prp.getPolicy(formattedRequest.policies, formattedRequest.combiningAlgorithm).then(function(eval){

           /*@TODO policy evaluation not yet complete*/
           var result = eval(formattedRequest);
           var response = {
               'result':result,
               'request': request,
               'formattedRequest': formattedRequest
           };
           if(result === "Permit"){
               return response;
           } else {
               throw response;
           }
       });
   });
};

ozpIwc.policyAuth.PDP.prototype.formatRequest = function(request){
    request = request || {};
    var promises = [];
    var subject = request.subject;
    var resource = request.resource;
    var action = request.action;

    // If its a string, use it as a key and fetch its attrs from PIP
    if(typeof request.subject === "string"){
        subject = this.pip.getAttributes(request.subject);
    }else if(request.subject && request.subject.dataType && request.subject.attributeValue){
        //Else check if the subject wasn't given a key (we support multiple subjects). Wrap it in a generated Key
        subject = {
            'attr:1' : request.subject
        }
    }

    if(typeof request.resource === "string"){
        resource = this.pip.getAttributes(request.resource);
    } else if( request.resource && request.resource.dataType && request.resource.attributeValue){
        resource = {
            'attr:1' : request.resource
        }
    }

    // If its a string, its a single action. Wrap it as needed.
    if(typeof request.action === "string"){
        action = {
            'attr:1': {
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'attributeValue': request.action
            }
        };
    } else if(Array.isArray(request.action)){
        // If its an array, its multiple actions. Wrap as needed
        action = {};
        for(var i in request.action){
            action['attr:'+i] = {
                'dataType': "http://www.w3.org/2001/XMLSchema#string",
                'attributeValue': request.action[i]
            };
        };
    } else if(request.action && request.action.dataType && request.action.attributeValue){
        // If its an action but not wrapped with a key. Wrap as needed.
        action = {
            'attr:1' : request.action
        }
    }
    promises.push(subject,resource,action);

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