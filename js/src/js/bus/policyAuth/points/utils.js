var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.points = ozpIwc.policyAuth.points || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.points
 */

/**
 * A static collection of utility methods for the ozpIwc.policyAuth.points namespace.
 * @class utils
 * @static
 * @namespace ozpIwc.policyAuth.points
 * @type {Object}
 */
ozpIwc.policyAuth.points.utils = (function (util) {
    /**
     * @method formatAttributes
     * @static
     * @param {Array} attributes
     * @param {ozpIwc.policyAuth.points.PIP} [pip]
     * @return {ozpIwc.util.AsyncAction}
     */
    var formatAttributes = function (attributes, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format attributes.");
        }

        attributes = util.ensureArray(attributes);

        var asyncs = [];
        for (var i in attributes) {
            asyncs.push(formatAttribute(attributes[i], pip));
        }
        util.AsyncAction.all(asyncs).success(function (attrs) {
            var retObj = {};
            for (var i in attrs) {
                if (Object.keys(attrs[i]).length > 0) {
                    for (var j in attrs[i]) {
                        retObj[j] = attrs[i][j];
                    }
                }
            }
            asyncAction.resolve("success", retObj);
        });

        return asyncAction;
    };

    /**
     * Takes a URN, array of urns, object, array of objects, or array of any combination and fetches/formats to the
     * necessary structure to be used by a request of policy's category object.
     *
     * @method formatAttribute
     * @static
     * @param {String|Object|Array<String|Object>}attribute The attribute to format
     * @param {ozpIwc.policyAuth.points.PIP} [pip] Policy information point, uses ozpIwc.authorization.pip by default.
     * @return {ozpIwc.util.AsyncAction} returns an async action that will resolve with an object of the formatted
     *     attributes. each attribute is ID indexed in the object, such that the formatting of id
     *                               `ozp:iwc:node` which has attributes `a` and `b`would resolve as follows:
     *
     * ```
     *  {
     *      'ozp:iwc:node': {
     *          <attributeValue>: ['a','b']
     *      }
     *  }
     * ```
     *
     */
    var formatAttribute = function (attribute, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format attributes.");
        }

        if (!attribute) {
            //do nothing and return an empty object.
            asyncAction.resolve('success', {});

        } else if (typeof attribute === "string") {
            // If its a string, use it as a key and fetch its attrs from PIP
            pip.getAttributes(attribute)
                .success(function (attr) {
                    //TODO check if is an array or string (APPLY RECURSION!)
                    asyncAction.resolve("success", attr);
                });

        } else if (Array.isArray(attribute)) {
            // If its an array, its multiple actions. Wrap as needed
            return formatAttributes(attribute, pip);

        } else if (typeof attribute === "object") {
            // If its an object, make sure each key's value is an array.
            var keys = Object.keys(attribute);
            for (var i in keys) {
                var tmp = attribute[keys[i]];
                if (['string', 'number', 'boolean'].indexOf(typeof attribute[keys[i]]) >= 0) {
                    attribute[keys[i]] = [tmp];
                }
                attribute[keys[i]] = attribute[keys[i]] || [];
            }
            asyncAction.resolve("success", attribute);
        }
        return asyncAction;
    };

    /**
     * Formats an action to be used by a request or policy. Actions are not gathered from the Policy Information Point.
     * Rather they are string values explaining the operation to be permitted. To comply with XACML, these strings are
     * wrapped in objects for easier comparison
     *
     * @method formatAction
     * @static
     * @param {String|Object|Array<String|Object>} action
     * @return {Object} An object of formatted actions indexed by the ozp action id `ozp:action:id`.
     *                   An example output for actions ['read','write'] is as follows:
     *
     * ```
     *  {
     *      'ozp:iwc:action': {
     *          <attributeValue>: ['read', 'write']
     *      }
     *  }
     * ```
     *
     */
    var formatAction = function (action) {

        var formatted = [];

        var objectHandler = function (object, formatted) {
            var values;
            // We only care about attributeValues
            if (object['ozp:iwc:action']) {
                values = object['ozp:iwc:action'];
            }
            if (Array.isArray(values)) {
                return arrayHandler(values, formatted);
            } else if (['string', 'number', 'boolean'].indexOf(typeof values) >= 0) {
                if (formatted.indexOf(values) < 0) {
                    formatted.push(values);
                }
            }
        };
        var arrayHandler = function (array, formatted) {
            for (var i in array) {
                if (typeof array[i] === 'string') {
                    if (formatted.indexOf(array[i]) < 0) {
                        formatted.push(array[i]);
                    }
                } else if (Array.isArray(array[i])) {
                    arrayHandler(array[i], formatted);
                } else if (typeof array[i] === 'object') {
                    objectHandler(array[i], formatted);
                }
            }
        };

        if (!action) {
            //do nothing and return an empty array
        } else if (typeof action === "string") {
            // If its a string, its a single action.
            formatted.push(action);
        } else if (Array.isArray(action)) {
            arrayHandler(action, formatted);
        } else if (typeof action === 'object') {
            objectHandler(action, formatted);
        }

        return {'ozp:iwc:action': formatted};
    };

    /**
     * Takes a request object and applies any context needed from the PIP.
     *
     * @method formatRequest
     * @static
     * @param {Object}          request
     * @param {String|Array<String>|Object}    request.subject URN(s) of attribute to gather, or formatted subject
     *     object
     * @param {String|Array<String>Object}     request.resource URN(s) of attribute to gather, or formatted resource
     *     object
     * @param {String|Array<String>Object}     request.action URN(s) of attribute to gather, or formatted action object
     * @param {String}                         request.combiningAlgorithm URN of combining algorithm
     * @param {Array<String|ozpIwc.policyAuth.Policy>}   request.policies either a URN or a formatted policy
     * @param {ozpIwc.policyAuth.points.PIP} [pip] custom policy information point for attribute gathering.
     * @return {ozpIwc.util.AsyncAction}  will resolve when all attribute formatting completes. The resolution will
     *     pass a formatted structured as so:
     * ```
     *  {
     *      'category':{
     *          'subject': {
     *              <AttributeId>: {
     *                  <AttributeValue>: Array<Primitive>
     *              }
     *          },
     *          'resource': {
     *              <AttributeId>: {
     *                  <AttributeValue>: Array<Primitive>
     *              }
     *          },
     *          'action': {
     *              "ozp:iwc:action": {
     *                  "attributeValues": Array<String>
     *              }
     *          }
     *      },
     *      'combiningAlgorithm': request.combiningAlgorithm,
     *      'policies': request.policies
     *  }
     * ```
     */
    var formatRequest = function (request, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format requests.");
        }
        request = request || {};
        request.subject = request.subject || {};
        request.resource = request.resource || {};
        request.action = request.action || {};
        if (!request.combiningAlgorithm) {
            return asyncAction.resolve("failure", "request.combiningAlgorithm is required to format requests.");
        }
        var asyncs = [];

        var subjectAsync = formatAttribute(request.subject, pip);
        var resourceAsync = formatAttribute(request.resource, pip);
        var actions = formatAction(request.action);

        asyncs.push(subjectAsync, resourceAsync, actions);

        util.AsyncAction.all(asyncs)
            .success(function (gatheredAttributes) {
                var sub = gatheredAttributes[0];
                var res = gatheredAttributes[1];
                var act = gatheredAttributes[2];
                asyncAction.resolve('success', {
                    'category': {
                        "subject": sub,
                        "resource": res,
                        "action": act
                    },
                    'combiningAlgorithm': request.combiningAlgorithm,
                    'policies': request.policies
                });
            }).failure(function (err) {
                asyncAction.resolve('failure', err);
            });

        return asyncAction;
    };

    /**
     * Formats a category object. If needed the attribute data is gathered from the PIP.
     *
     * @method formatCategory
     * @static
     * @param {String|Array<String>|Object} category the category (subject,resource,action) to format
     * @param {String} categoryId the category name used to map to its corresponding attributeId (see PDP.mappedID)
     * @param {ozpIwc.policyAuth.points.PIP} [pip] custom policy information point for attribute gathering.
     * @return {ozpIwc.util.AsyncAction}  will resolve with a category object formatted as so:
     * ```
     *  {
     *      <AttributeId>: {
     *          <attributeValue>: {Array<Primative>}
     *      }
     *  }
     * ```
     *
     */
    var formatCategory = function (category, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format requests.");
        }

        if (!category) {
            return asyncAction.resolve('success');
        }

        formatAttribute(category, pip)
            .success(function (attributes) {
                for (var i in attributes['ozp:iwc:permissions']) {
                    attributes[i] = attributes['ozp:iwc:permissions'][i];
                }
                delete attributes['ozp:iwc:permissions'];
                asyncAction.resolve('success', attributes);
            }).failure(function (err) {
                asyncAction.resolve('failure', err);
            });
        return asyncAction;
    };

    /**
     *
     * Category context handling for policy objects.
     * Takes object key-indexed categories for a policy
     * and returns an object key-indexed listing of formatted. Each category is keyed by its XACML URN. currently only
     * subject,resource, and action categories are supported.
     *
     * @method formatCategories
     * @static
     * @param {Object} categoryObj An object of categories to format.
     * @param {Object|String|Array<String|Object>}[categoryObj[<categoryId>]] A category to format
     * @param {ozpIwc.policyAuth.points.PIP} [pip] custom policy information point for attribute gathering.
     * @return {ozpIwc.util.AsyncAction} will resolve an object of categories be structured as so:
     * ```
     * {
     *   <categoryId> : {
     *      <AttributeId>:{
     *          <attributeValue> : Array<Primitive>
     *      },
     *      <AttributeId>:{
     *          <attributeValue> : Array<Primitive>
     *      }
     *   },
     *   <categoryId>: {...},
     *   ...
     * }
     * ```
     */
    var formatCategories = function (categoryObj, pip) {
        var asyncAction = new util.AsyncAction();
        if (!pip) {
            return asyncAction.resolve("failure", "A PIP is required to format requests.");
        }

        var categoryAsyncs = [];
        var categoryIndexing = {};
        for (var i in categoryObj) {
            categoryAsyncs.push(formatCategory(categoryObj[i], pip));
            categoryIndexing[i] = categoryAsyncs.length - 1;
        }
        util.AsyncAction.all(categoryAsyncs)
            .success(function (categories) {
                var map = {};
                var keys = Object.keys(categoryIndexing);
                for (var i in keys) {
                    map[keys[i]] = categories[categoryIndexing[keys[i]]] || {};
                }
                asyncAction.resolve('success', map);
            }).failure(function (err) {
                asyncAction.resolve('failure', err);
            });

        return asyncAction;
    };

    return {
        formatAttribute: formatAttribute,
        formatAttributes: formatAttributes,
        formatAction: formatAction,
        formatRequest: formatRequest,
        formatCategory: formatCategory,
        formatCategories: formatCategories
    };

}(ozpIwc.util));