var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util = (function (util) {

    /**
     * Invokes the callback handler on another event loop as soon as possible.
     *
     * @method setImmediate
     * @static
     */
    util.setImmediate = function (f) {
        util.globalScope.setImmediate(f);
    };

    /**
     * Returns true if every needle is found in the haystack.
     *
     * @method arrayContainsAll
     * @static
     * @param {Array} haystack The array to search.
     * @param {Array} needles All of the values to search.
     * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
     *
     * @return {Boolean}
     */
    util.arrayContainsAll = function (haystack, needles, equal) {
        equal = equal || function (a, b) { return a === b;};
        return needles.every(function (needle) {
            return haystack.some(function (hay) {
                return equal(hay, needle);
            });
        });
    };

    /**
     * Returns true if the value every attribute in needs is equal to
     * value of the same attribute in haystack.
     *
     * @method objectContainsAll
     * @static
     * @param {Array} haystack The object that must contain all attributes and values.
     * @param {Array} needles The reference object for the attributes and values.
     * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
     *
     * @return {Boolean}
     */
    util.objectContainsAll = function (haystack, needles, equal) {
        equal = equal || function (a, b) { return a === b;};

        for (var attribute in needles) {
            if (!equal(haystack[attribute], needles[attribute])) {
                return false;
            }
        }
        return true;
    };

    /**
     * IWC alert handler.
     * @todo fill with some form of modal popup regarding the alert.
     * @todo store a list of alerts to not notify if the user selects "don't show me this again" in the data.api
     *
     * @class alert
     * @param {String} message The string to display in the popup.
     * @param {Object} errorObject The object related to the alert to give as additional information
     */
    util.alert = function (message, errorObject) {
        /**
         * key-value store of alerts.
         * @todo this is not used in current version of alert.
         * @property alerts
         * @type {Object}
         */
        this.alerts = this.alerts || {};
        if (this.alerts[message]) {
            this.alerts[message].error = errorObject;
        } else {
            this.alerts[message] = {
                error: errorObject,
                silence: false
            };
        }
        if (!this.alerts[message].silence) {
            //TODO : trigger an angular/bootstrap modal alert to notify the user of the error.
            // on return of the alert:
            // set this.alerts[message].silence if the user silenced the alerts

            // Temporary placement: all alerts are silenced after first instance, but since this is not in data.api its
            // on an application basis.
            this.alerts[message].silence = true;
            ozpIwc.log.log(message, errorObject);
        }
    };

    /**
     * Solves a common pattern to handle data from a function which may return a single object or an array of objects
     * If given an array, returns the array.
     * If given a single object, returns the object as a single element in a list.
     *
     * @method ensureArray
     * @static
     * @param {Object} obj The object may be an array or single object
     *
     * @return {Array}
     */
    util.ensureArray = function (obj) {
        return Array.isArray(obj) ? obj : [obj];
    };

    /**
     * Ensures the variable passed in is an object. For error mitigation, if the variable is not an object, an empty
     * object is returned.
     * @method ensureObject
     * @param obj
     * @returns {*}
     */
    util.ensureObject = function (obj) {
        return (typeof obj === "object" && obj !== null) ? obj : {};
    };
    /**
     * A key for data transmission over localStorage.
     *
     * @property localStorageKey
     * @type {String}
     */
    util.localStorageKey = "ozp.iwc.transport.localStorage";

        /**
     * Returns an object representation of the content-type string
     * @method getFormattedContentType
     * @private
     * @static
     * @param {String} contentType
     * @returns {Object}
     */
    util.getFormattedContentType = function (contentType) {
        var result = {};
        if (typeof contentType === "string") {
            var contentTypeArr = contentType.split(";");
            if (contentTypeArr.length > 0) {
                result.name = contentTypeArr[0];
                for (var i = 1; i < contentTypeArr.length; i++) {
                    var kv = contentTypeArr[i].replace(" ", "").split('=');
                    if (kv[0] !== "name") {
                        try {
                            result[kv[0]] = JSON.parse(kv[1]);
                        } catch (e) {
                            // its not parseable so the value is a string
                            result[kv[0]] = kv[1];
                        }
                    }
                }
            }
        }
        return result;
    };


    /**
     * Returns the content-types for all node types in a node namespace.
     * @method genContentTypeMappings
     * @param {Object} nodeNamespace
     * @returns {Object}
     */
    util.genContentTypeMappings = function (nodeNamespace) {
        var formats = {};
        for (var i in nodeNamespace) {
            var contentType = nodeNamespace[i].serializedContentType;
            if (contentType) {
                var formatted = util.getFormattedContentType(contentType);
                formats[formatted.name] = formats[formatted.name] || {};
                if (formatted.version) {
                    formats[formatted.name][formatted.version] = nodeNamespace[i];
                } else {
                    formats[formatted.name] = nodeNamespace[i];
                }
            }
        }
        return formats;
    };

    return util;
}(ozpIwc.util || {}));
