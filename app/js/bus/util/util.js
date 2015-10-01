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
        window.setImmediate(f);
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
     * Wraps window.open.  If the bus is running in a worker, then
     * it doesn't have access to the window object and needs help from
     * a participant.
     * @see window.open documentation for what the parameters actually do
     *
     * @method openWindow
     * @static
     * @param {String} url The URL to open in a new window
     * @param {String} windowName The window name to open with.
     * @param {String} [features] The window features.
     */
    util.openWindow = function (url, windowName, features) {
        if (typeof windowName === "object") {
            var str = "";
            for (var k in windowName) {
                str += k + "=" + encodeURIComponent(windowName[k]) + "&";
            }
            windowName = str;
        }
        try {
            window.open(url, windowName, features);
        } catch (e) {
            //fallback for IE
            window.open(url + "?" + windowName, null, features);
        }
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
            // on a widget basis.
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
     * A key for data transmission over localStorage.
     *
     * @property localStorageKey
     * @type {String}
     */
    util.localStorageKey = "ozp.iwc.transport.localStorage";

    /**
     * Returns the specified default value if the given value is undefined. safer than "x = x || 500" because it checks
     * for being defined, rather than its truly/falsey value.

     * @method ifUndef
     * @static
     * @param {*} value
     * @param {*} defaultVal
     * @return {*}
     */
    util.ifUndef = function (value, defaultVal) {
        return (typeof value === 'undefined') ? defaultVal : value;
    };

    return util;
}(ozpIwc.util || {}));