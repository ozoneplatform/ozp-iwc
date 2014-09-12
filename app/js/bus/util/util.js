/** @namespace */
var ozpIwc=ozpIwc || {};
/**
* @submodule bus.util
*/

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 *
 * @method generateId
 * @static
 *
 * @returns {String}
 */
ozpIwc.util.generateId=function() {
    return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Invokes the callback handler on another event loop as soon as possible.
 *
 * @method setImmediate
 * @static
*/
ozpIwc.util.setImmediate=function(f) {
//    window.setTimeout(f,0);
    window.setImmediate(f);
};

/**
 * Returns true if every needle is found in the haystack.
 *
 * @method arrayContainsAll
 * @static
 * @param {array} haystack - The array to search.
 * @param {array} needles - All of the values to search.
 * @param {function} [equal] - What constitutes equality.  Defaults to a===b.
 *
 * @returns {boolean}
 */
ozpIwc.util.arrayContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    return needles.every(function(needle) { 
        return haystack.some(function(hay) { 
            return equal(hay,needle);
        });
    });
};


/**
 * Returns true if the value every attribute in needs is equal to 
 * value of the same attribute in haystack.
 *
 * @method objectContainsAll
 * @static
 * @param {array} haystack - The object that must contain all attributes and values.
 * @param {array} needles - The reference object for the attributes and values.
 * @param {function} [equal] - What constitutes equality.  Defaults to a===b.
 *
 * @returns {boolean}
 */
ozpIwc.util.objectContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    
    for(var attribute in needles) {
        if(!equal(haystack[attribute],needles[attribute])) {
            return false;
        }
    }
    return true;
};

(function() {
    ozpIwc.BUS_ROOT=window.location.protocol + "//" 
            + window.location.host
            +window.location.pathname.replace(/[^\/]+$/,"");
})();