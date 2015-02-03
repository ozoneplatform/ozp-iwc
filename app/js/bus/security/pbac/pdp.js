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
 * @param {Object} [contextHolder]                  An object that holds 'securityAttribute' attributes to populate the
 *                                                  PIP cache with for request/policy use.
 * @returns {Promise} will resolve if the policy gives a "Permit", or rejects if else wise. the promise chain will
 *                    receive:
 *                    ```{
 *                      'result': <String>,
 *                      'request': <Object> // a copy of the request passed in,
 *                      'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
 *                    }```
 */
ozpIwc.policyAuth.PDP.prototype.isPermitted = function(request,contextHolder){
    // Allow a custom pip to be used for the check.
    // We use this so that we can assign attributes to the PIP (for policies to reference), take a snapshot, and
    // move on with the async nature of the IWC and not worry about attributes being overridden.
    var pip;
    if(contextHolder){
        pip = this.gatherContext(contextHolder);
    } else {
        pip = this.pip;
    }

    var self = this;
    //If there is no request information, its a trivial "Permit"
    if(!request){
        return new Promise(function(resolve,reject){
            resolve({
                'result':"Permit"
            });
        });
    }
    var formattedPolicies = [];
    //Format the request
    return this.formatRequest(request,pip).then(function(formattedRequest){
        // Get the policies from the PRP
       return self.prp.getPolicies(formattedRequest.policies).then(function(policies){
           //Format the policies
           return self.formatPolicies(policies,pip);
       }).then(function(policies){
           formattedPolicies = policies;
            //Generate the evaluation function
            return self.generateEvaluation(policies,formattedRequest.combiningAlgorithm);
       }).then(function(evaluate){
           //Evaluate the function
           var result = evaluate(formattedRequest);
           var response = {
               'result':result,
               'request': request,
               'formattedRequest': formattedRequest,
               'formattedPolicies': formattedPolicies
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
 * Takes a URN, array of urns, object, array of objects, or array of any combination and fetches/formats to the
 * necessary structure to be used by a request of policy's category object.
 *
 * @method formatAttribute
 * @param {String|Object|Array<String|Object>}attribute The attribute to format
 * @param {ozpIwc.policyAuth.PIP} [pip] Policy information point, uses ozpIwc.authorization.pip by default.
 * @returns {Promise} returns a promise that will resolve with an array of the formatted attributes.
 */
ozpIwc.policyAuth.PDP.prototype.formatAttribute = function(attribute,pip){
    pip = pip || this.pip;
    var promises = [];

    // If its an object, it contains already formatted attributes, push them individually to the promise array
    var objectHandler = function(object,promiseArray){
        var keys = Object.keys(object);
        for(var i in keys){
            if(object[keys[i]].dataType && object[keys[i]].attributeValue){
                var obj = {};
                obj[keys[i]] = object[keys[i]];
                obj[keys[i]].attributeValue = Array.isArray(object[keys[i]].attributeValue) ?
                    obj[keys[i]].attributeValue : [obj[keys[i]].attributeValue];
                promiseArray.push(obj);
            } else {
                //@TODO if an attribute doesn't format, do we ignore it?
            }
        }
    };

    // If its an array, its multiple actions. Wrap as needed
    var arrayHandler = function(array,promiseArray){
        for(var i in array){
            if(typeof array[i] === "string") {
                var promise = pip.getAttributes(array[i]);
                promiseArray.push(promise);
            } else if(Array.isArray(array[i])){
                arrayHandler(array[i],promiseArray);
            } else if(typeof array[i] === "object"){
                objectHandler(array[i],promiseArray);
            }
        }
    };

    if(!attribute){
        //do nothing and return an empty promise.all
    }else if(typeof attribute === "string") {
        // If its a string, use it as a key and fetch its attrs from PIP
        var promise = pip.getAttributes(attribute);
        promises.push(promise);
    } else if(Array.isArray(attribute)){
        // If its an array, its multiple actions. Wrap as needed
        arrayHandler(attribute,promises);
    } else if(typeof attribute === "object"){
        objectHandler(attribute,promises);
    }
    return Promise.all(promises).then(function(formattedAttributes){
        var returnObject = {};
        for(var i in formattedAttributes){
            var keys = Object.keys(formattedAttributes[i]);
            for(var j in keys){
                returnObject[keys[j]] = formattedAttributes[i][keys[j]];
            }
        }
        return returnObject;
    });
};



/**
 * Formats an action to be used by a request or policy.
 *
 * @method formatAction
 * @param {String|Object|Array<String|Object>} action
 * @returns {Array} An array of formatted actions
 */
ozpIwc.policyAuth.PDP.prototype.formatAction = function(action){

    var formatted = {
        'dataType' : "http://www.w3.org/2001/XMLSchema#string",
        'attributeValue' : []
    };

    var objectHandler = function(object,formatted){
        var values;
        // We only care about attributeValues
        if(object['ozp:iwc:action'] && object['ozp:iwc:action'].attributeValue){
            values = object['ozp:iwc:action'].attributeValue;
        }else if(object.attributeValue){
            values = object.attributeValue;
        }
        if(Array.isArray(values)) {
                return arrayHandler(values,formatted);
        } else if(typeof values === 'string'){
            if(formatted.attributeValue.indexOf(values) < 0){
                formatted.attributeValue.push(values);
            }
        }
    };
    var arrayHandler = function(array,formatted){
        for(var i in array){
            if(typeof array[i] === 'string') {
                if (formatted.attributeValue.indexOf(array[i]) < 0) {
                    formatted.attributeValue.push(array[i]);
                }
            } else if(Array.isArray(array[i])){
                arrayHandler(array[i],formatted);
            } else if(typeof array[i] === 'object') {
                objectHandler(array[i],formatted);
            }
        }
    };

    if(!action){
        //do nothing and return an empty array
    }else if(typeof action === "string"){
        // If its a string, its a single action.
        if(formatted.attributeValue.indexOf(action) < 0){
            formatted.attributeValue.push(action);
        }
    } else if(Array.isArray(action)){
        arrayHandler(action,formatted);
    } else if(typeof action === 'object'){
        objectHandler(action,formatted);
    }

    return {'ozp:iwc:action': formatted};
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
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
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
ozpIwc.policyAuth.PDP.prototype.formatRequest = function(request,pip){
    pip = pip || this.pip;
    request = request || {};
    var promises = [];

    var subjectPromises = this.formatAttribute(request.subject,pip);
    var resourcePromises = this.formatAttribute(request.resource,pip);
    var actions = this.formatAction(request.action);

    promises.push(subjectPromises,resourcePromises,actions);

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
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
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
ozpIwc.policyAuth.PDP.prototype.formatCategory = function(category,pip){
    pip = pip || this.pip;
    return this.formatAttribute(category,pip).then(function(attributes){

        for(var i in attributes['ozp:iwc:permissions']){
            attributes[i] = attributes['ozp:iwc:permissions'][i];
        }
        delete attributes['ozp:iwc:permissions'];
        return attributes;
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
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
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
ozpIwc.policyAuth.PDP.prototype.formatCategories = function(categoryObj,pip){
    pip = pip || this.pip;
    var categoryPromises = [];
    var categoryIndexing = {};
    for(var i in categoryObj){
        categoryPromises.push(this.formatCategory(categoryObj[i],pip));
        categoryIndexing[i] = categoryPromises.length - 1;
    }
    return Promise.all(categoryPromises).then(function(categories){
        var map = {};
        var keys = Object.keys(categoryIndexing);
        for(var i in keys){
            map[keys[i]] = categories[categoryIndexing[keys[i]]] || {};
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
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {Promise} returns a promise that will resolve to a formatted rule.
 */
ozpIwc.policyAuth.PDP.prototype.formatRule = function(rule,pip) {
    pip = pip || this.pip;
    return this.formatCategories(rule.category,pip).then(function (categories) {
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
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {Promise} returns a promise that will resolve to a matching-order of formatted rules array.
 */
ozpIwc.policyAuth.PDP.prototype.formatRules = function(rules,pip){
    pip = pip || this.pip;
    var rulePromises = [];
    for(var i in rules){
        rulePromises.push(this.formatRule(rules[i],pip));
    }
    return Promise.all(rulePromises);
};


/**
 * Context handler for a policy object.
 *
 * @method formatPolicy
 * @param {Object} policy
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {Promise} calls and returns a formatRules promise
 */
ozpIwc.policyAuth.PDP.prototype.formatPolicy = function(policy,pip){
    pip = pip || this.pip;
    policy = policy || {};

    return this.formatRules(policy.rule,pip).then(function(rules){
        policy.rule = rules;
        return new ozpIwc.policyAuth.Policy(policy);
    });
};


/**
 * Context handler for multiple policy objects.
 *
 * @method formatPolicies
 * @param {Array<Object>} policies
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {Promise} calls and returns a formatRules promise
 */
ozpIwc.policyAuth.PDP.prototype.formatPolicies = function(policies,pip){
    pip = pip || this.pip;
    var policyPromises = [];
    for(var i in policies){
        policyPromises.push(this.formatPolicy(policies[i],pip));
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

ozpIwc.policyAuth.PDP.prototype.gatherContext = function(contextHolder){

    var permissions = {};
    for(var i in contextHolder.securityAttributes.attributes) {
        permissions[i] = contextHolder.securityAttributes.attributes[i];
        this.pip.grantAttributes(i, contextHolder.securityAttributes.attributes[i]);
    }
    this.pip.grantAttributes("ozp:iwc:permissions", permissions);

    //Take a snapshot of the pip to use for the permission check (due to async nature)
    return ozpIwc.util.protoClone(this.pip);
};
