var ozpIwc = ozpIwc || {};

/**
 * Logging functionality for the IWC.
 * @module ozpIwc
 */

/**
 * A logging wrapper for the ozpIwc namespace
 * @class log
 * @static
 * @namespace ozpIwc
 */
ozpIwc.log = (function () {
    /**
     * Gathers the stacktrace for an error.
     * @method getStackTrace
     * @private
     * @return {String}
     */
    var getStackTrace = function () {
        var obj = {};
        Error.captureStackTrace(obj, getStackTrace);
        return obj.stack;
    };

    return {
        /**
         * @property NONE
         * @type {Object}
         */
        NONE: {logLevel: true, severity: 0, name: "NONE"},

        /**
         * @property DEFAULT
         * @type {Object}
         */
        DEFAULT: {logLevel: true, severity: 1, name: "DEFAULT"},

        /**
         * @property ERROR
         * @type {Object}
         */
        ERROR: {logLevel: true, severity: 3, name: "ERROR"},

        /**
         * @property INFO
         * @type {Object}
         */
        INFO: {logLevel: true, severity: 6, name: "INFO"},

        /**
         * @property DEBUG
         * @type {Object}
         */
        DEBUG: {logLevel: true, severity: 7, name: "DEBUG"},

        /**
         * @property ALL
         * @type {Object}
         */
        ALL: {logLevel: true, severity: 10, name: "ALL"},

        /**
         * @property threshold
         * @type {Number}
         */
        threshold: 3,

        /**
         * Sets the threshold for the IWC's logger.
         * @method setThreshold
         * @param {Number|Object} level
         * @param {Number} [level.severity]
         */
        setThreshold: function (level) {
            if (typeof(level) === "number") {
                ozpIwc.log.threshold = level;
            } else if (typeof(level.severity) === "number") {
                ozpIwc.log.threshold = level.severity;
            } else {
                throw new TypeError("Threshold must be a number or one of the ozpIwc.log constants.  Instead got" + level);
            }
        },

        /**
         * A wrapper for log messages. Forwards to console.log if available.
         * @property log
         * @type {Function}
         */
        log: function (level) {
            if (level.logLevel === true && typeof(level.severity) === "number") {
                ozpIwc.log.logMsg(level, Array.prototype.slice.call(arguments, 1));
            } else {
                ozpIwc.log.logMsg(ozpIwc.log.DEFAULT, Array.prototype.slice.call(arguments, 0));
            }
        },

        /**
         * Logs the given message if the severity is above the threshold.
         * @method logMsg
         * @param {Number} level
         * @param {Arguments} args
         */
        logMsg: function (level, args) {
            if (level.severity > ozpIwc.log.threshold) {
                return;
            }

            // if no console, no logs.
            if (!console || !console.log) {
                return;
            }

            var msg = args.reduce(function (acc, val) {
                if (val instanceof Error) {
                    //"[" + val.name + "]" + val.message;
                    return acc + val.toString() + (val.stack ? (" -- " + val.stack) : "");
                } else if (typeof(val) === "object") {
                    return acc + JSON.stringify(val, null, 2);
                }
                return acc + val;
            }, "[" + level.name + "] ");

            console.log(msg);
        },

        /**
         * A wrapper for error messages.
         * @property error
         * @type {Function}
         */
        error: function () {
            ozpIwc.log.logMsg(ozpIwc.log.ERROR, Array.prototype.slice.call(arguments, 0));
        },

        /**
         * A wrapper for debug messages.
         * @property debug
         * @type {Function}
         */
        debug: function () {
            ozpIwc.log.logMsg(ozpIwc.log.DEBUG, Array.prototype.slice.call(arguments, 0));
        },

        /**
         * A wrapper for info messages.
         * @property info
         * @type {Function}
         */
        info: function () {
            ozpIwc.log.logMsg(ozpIwc.log.INFO, Array.prototype.slice.call(arguments, 0));
        }
    };

}());
