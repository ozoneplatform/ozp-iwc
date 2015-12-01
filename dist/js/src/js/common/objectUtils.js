var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

/**
 * @class object
 * @namespace ozpIwc.util
 * @static
 */
ozpIwc.util.object = (function () {
    return {
        /**
         * @method eachEntry
         * @param {Object} obj
         * @param {Function} fn
         * @param {Object} self
         * @return {Array}
         */
        eachEntry: function (obj, fn, self) {
            var rv = [];
            for (var k in obj) {
                rv.push(fn.call(self, k, obj[k], obj.hasOwnProperty(k)));
            }
            return rv;
        },

        /**
         * @method values
         * @param {Object} obj
         * @param {Function} filterFn
         * @return {Array}
         */
        values: function (obj, filterFn) {
            filterFn = filterFn || function (key, value) {
                    return true;
                };
            var rv = [];
            for (var k in obj) {
                if (filterFn(k, obj[k])) {
                    rv.push(obj[k]);
                }
            }
            return rv;
        }
    };
}());
