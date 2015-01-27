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
 *                    ```{
 *                      'result': <String>,
 *                      'request': <Object> // a copy of the request passed in,
 *                      'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
 *                    }```
 */
ozpIwc.policyAuth.PDP.prototype.isPermitted = function(request){
    var self = this;

    //Format the request
    return this.formatRequest(request).then(function(formattedRequest){
        // Get the policies from the PRP
       return self.prp.getPolicies(formattedRequest.policies).then(function(policies){
           //Format the policies
           return self.formatPolicies(policies);
       }).then(function(policies){
                //Generate the evaluation function
               return self.generateEvaluation(policies,formattedRequest.combiningAlgorithm);
       }).then(function(evaluate){
           //Evaluate the function
           var result = evaluate(formattedRequest);
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

/**
 * Takes a request object and applies any context needed from the PIP.
 *
 * @method formatRequest
 * @param {Object}          request
 * @param {String}          request.subject
 * @param {String}          request.resource
 * @param {String}          request.action
 * @param {String}          request.combiningAlgorithm
 * @param {Array<String>}   request.policies
 * @returns {Promise}   will resolve when all attribute formatting completes. The resolution will pass a formatted
 *                      structured as so:
 *                    ```{
 *                      'category':{
 *                          "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": {Object},
 *                          "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": {Object},
 *                          "urn:oasis:names:tc:xacml:3.0:attribute-category:action": {Object}
*                       },
 *                      'combiningAlgorithm': request.combiningAlgorithm,
 *                      'policies': request.policies
 *                     }```
 */
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
        };
    }

    if(typeof request.resource === "string"){
        resource = this.pip.getAttributes(request.resource);
    } else if( request.resource && request.resource.dataType && request.resource.attributeValue){
        resource = {
            'attr:1' : request.resource
        };
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
        }
    } else if(request.action && request.action.dataType && request.action.attributeValue){
        // If its an action but not wrapped with a key. Wrap as needed.
        action = {
            'attr:1' : request.action
        };
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

/**
 * @property defaultCombiningAlgorithm
 * @type {string}
 */
ozpIwc.policyAuth.PDP.prototype.defaultCombiningAlgorithm =
    "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides";

/**
 * A factory function to create a function for evaluating formatted policies against a given combining algorithm
 * in the ozpIwc.policyAuth.PolicyCombining namespace.
 *
 * @method generateEvaluation
 * @param {String|Array<String>}        policies none, one, or many policies to evaluate with the given combining algorithm
 * @param {String} combiningAlgorithm   the name of the combining algorithm to obtain from the
 *                                      ozpIwc.policyAuth.PolicyCombining namespace.
 * @returns {Function}                  returns a function call expecting a formatted request to be passed to for
 *                                      evaluation. Ex:
 *                                      ```
 *                                      var pdp = new ozpIwc.policyAuth.PDP(...);
 *                                      var evalFunc = pdp.generateEvaluation(somePolicies, someCombiningAlgorithm);
 *                                      var result = evalFunc(someRequest);
 *                                      ```
 */
ozpIwc.policyAuth.PDP.prototype.generateEvaluation = function(policies,combiningAlgorithm){
    policies = policies || [];
    policies = Array.isArray(policies)? policies : [policies];

    var combiningFunction = ozpIwc.policyAuth.PolicyCombining[combiningAlgorithm] ||
        ozpIwc.policyAuth.PolicyCombining[this.defaultCombiningAlgorithm];

    // If there are no policies to check against, assume trivial and permit
    if(policies.length === 0){
        return ozpIwc.abacPolicies.permitAll;
    }

    return function(request){
            return combiningFunction(policies,request);
    };
};


/**
 * Formats a category object. If needed the attribute data is gathered from the PIP.
 *
 * @method formatCategory
 * @param {String|Array<String>|Object} category the category (subject,resource,action) to format
 * @param {String} categoryId the category name used to map to its corresponding attributeId (see PDP.mappedID)
 * @returns {Promise} Returns a promise that will resolve with a category object formatted as so:
 *      ```
 *      {
 *          'category': {String},
 *          'attributeDesignator': {
 *              'attributeId': {String},
 *              'dataType': {String},
 *              'mustBePresent': false
 *          },
 *          'attributeValue': {Array<String>}
 *      }
 *      ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatCategory = function(category,categoryId){
    var attributePromises = [];

    // If it's a string its to be gathered (expected value will be an object with dataType and attributeValue)
    if (typeof category === "string") {
        category = [category];
    }

    // If its an array, it can have attributes to be gathered, or objects
    if (Array.isArray(category)) {
        for (var j in category) {
            if (typeof category[j] === "string") {
                var attrPromise = this.pip.getAttributes(category[j]).then(function(data){
                    var attributeValue = [];
                    for(var attr in data){
                        attributeValue = attributeValue.concat(data[attr].attributeValue);
                        //@TODO: this only takes the last dataType, do we need this at all?
                    }
                    return {
                        attributeValue: attributeValue
                    };
                })['catch'](function(e){console.error(e);});
                attributePromises.push(attrPromise);
            } else {
                attributePromises.push(category[j]);
            }
        }
    } else {
        attributePromises.push(category);
    }
    var self = this;
    return Promise.all(attributePromises).then(function(attributes){
        var attributeValue = [];


        // For each resource gathered
        for(var i in attributes){
            // concat the found attributes
            attributeValue = attributeValue.concat(attributes[i].attributeValue);
        }
        return {
            category: categoryId,
            attributeDesignator: {
                "attributeId": self.mappedId(categoryId),
                "dataType": "http://www.w3.org/2001/XMLSchema#string",
                "mustBePresent": false
            },
            attributeValue: attributeValue
        };
    })['catch'](function(e){
        console.error(e);
    });
};

/**
 *
 * Category context handling for policy objects.
 * Takes object key-indexed categories for a policy
 * and returns an object key-indexed listing of formatted. Each category is keyed by its XACML URN. currently only
 * subject,resource, and action categories are supported.
 *
 * @method formatCategories
 * @param {Object} categoryObj
 * @param {Object|String|Array<String>} [categoryObj["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]]
 *                                          Formats xacml subject category attributes
 * @param {Object|String|Array<String>} [categoryObj["urn:oasis:names:tc:xacml:3.0:attribute-category:resource"]]
 *                                          Formats xacml resource category attributes
 * @param {Object|String|Array<String>} [categoryObj["urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"]]
 *                                          Formats xacml action category attributes
 * @returns {Promise} return will be structured as so:
 * ```
 * {
 *   'urn:category:id:123' : {
 *      'category': {String},
 *      'attributeDesignator': {
 *          'attributeId': {String},
 *          'dataType': {String},
 *          'mustBePresent': false
 *       },
 *       'attributeValue': {Array<String>}
 *   },
 *   'urn:category:id:abc': {...},
 *   'urn:category:id:000': {...},
 * }
 * ```
 */
ozpIwc.policyAuth.PDP.prototype.formatCategories = function(categoryObj){
    var categoryPromises = [];
    for(var i in categoryObj){
        categoryPromises.push(this.formatCategory(categoryObj[i],i));
    }
    return Promise.all(categoryPromises).then(function(categories){
        var map = {};
        for(var i in categories){
            map[categories[i].category] = {
                "attributeDesignator": categories[i].attributeDesignator,
                "attributeValue": categories[i].attributeValue
            };
        }
        return map;
    });
};


/**
 * Context handler for a policy rule object.
 *
 * Formats the rules categories,
 * @method formatRule
 * @param {Object} rule
 * @returns {Promise} returns a promise that will resolve to a formatted rule.
 */
ozpIwc.policyAuth.PDP.prototype.formatRule = function(rule) {
    return this.formatCategories(rule.category).then(function (categories) {
        rule.category = categories;
        return rule;
    })['catch'](function(e){
        console.error(e);
    });
};

/**
 * Context handler for policy rule objects.
 *
 * @method formatRules
 * @param {Array<Object>} rules
 * @returns {Promise} returns a promise that will resolve to a matching-order of formatted rules array.
 */
ozpIwc.policyAuth.PDP.prototype.formatRules = function(rules){
    var rulePromises = [];
    for(var i in rules){
        rulePromises.push(this.formatRule(rules[i]));
    }
    return Promise.all(rulePromises);
};


/**
 * Context handler for a policy object.
 *
 * @method formatPolicy
 * @param {Object} policy
 * @returns {Promise} calls and returns a formatRules promise
 */
ozpIwc.policyAuth.PDP.prototype.formatPolicy = function(policy){
    policy = policy || {};

    return this.formatRules(policy.rule).then(function(rules){
        policy.rule = rules;
        return policy;
    });
};


/**
 * Context handler for multiple policy objects.
 *
 * @method formatPolicies
 * @param {Array<Object>} policies
 * @returns {Promise} calls and returns a formatRules promise
 */
ozpIwc.policyAuth.PDP.prototype.formatPolicies = function(policies){
    var policyPromises = [];
    for(var i in policies){
        policyPromises.push(this.formatPolicy(policies[i]));
    }
    return Promise.all(policyPromises).then(function(policies){
        var formattedPolicies = [];
        for(var i in policies){
            formattedPolicies[i] = new ozpIwc.policyAuth.Policy(policies[i]);
        }
        return formattedPolicies;
    });
};

/**
 * Simple mapping function for assigning attributeId's to category types.
 *
 * @method mappedId
 * @param {String} string
 * @returns {String|undefined} returns undefined if a matching Id is not found (likely because not supported).
 */
ozpIwc.policyAuth.PDP.prototype.mappedId = function(string){
    switch(string){
        case "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":
            return "urn:oasis:names:tc:xacml:1.0:subject:subject-id";
        case "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":
            return "urn:oasis:names:tc:xacml:1.0:resource:resource-id";
        case "urn:oasis:names:tc:xacml:3.0:attribute-category:action":
            return "urn:oasis:names:tc:xacml:1.0:action:action-id";
        default:
            return undefined;
    }
};
