var ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.elements = ozpIwc.policyAuth.elements || {};

/**
 * @module ozpIwc.policyAuth
 * @submodule ozpIwc.policyAuth.elements
 */

ozpIwc.policyAuth.elements.SecurityAttribute = (function (util) {

    /**
     * A security attribute constructor for policyAuth use. Structured to be common to both bus-internal and api needs.
     * @class SecurityAttribute
     * @namespace ozpIwc.policyAuth.elements
     * @param {Object} [config]
     * @constructor
     */
    var SecurityAttribute = function (config) {
        config = config || {};

        /**
         * @property {Object} attributes
         */
        this.attributes = config.attributes || {};

        /**
         * @property {Function} comparator
         */
        this.comparator = config.comparator || this.comparator;
    };

    /**
     * Adds a value to the security attribute if it does not already exist. Constructs the attribute object if it does
     * not exist
     *
     * @method pushIfNotExist
     * @param {String} id
     * @param {String} val
     * @param {Function} [comp]
     */
    SecurityAttribute.prototype.pushIfNotExist = function (id, val, comp) {
        comp = comp || this.comparator;
        if (!val) {
            return;
        }
        var value = util.ensureArray(val);
        if (!this.attributes[id]) {
            this.attributes[id] = [];
            this.attributes[id] = this.attributes[id].concat(value);
        } else {
            for (var j in value) {
                var add = true;
                for (var i in this.attributes[id]) {
                    if (comp(this.attributes[id][i], value[j])) {
                        add = false;
                        break;
                    }
                }
                if (add) {
                    this.attributes[id].push(value[j]);
                }
            }
        }
    };

    /**
     * Clears the attributes given to an id.
     * @method clear
     * @param {String} id
     */
    SecurityAttribute.prototype.clear = function (id) {
        delete this.attributes[id];
    };

    /**
     * Clears all attributes.
     * @method clearAll
     */
    SecurityAttribute.prototype.clearAll = function () {
        this.attributes = {};
    };

    /**
     * Returns an object containing all of the attributes.
     * @method getAll
     * @return {Object}
     */
    SecurityAttribute.prototype.getAll = function () {
        return this.attributes;
    };

    /**
     *
     * Determines the equality of an object against a securityAttribute value.
     * @method comparator
     * @param {*} a
     * @param {*} b
     * @return {Boolean}
     */
    SecurityAttribute.prototype.comparator = function (a, b) {
        return a === b;
    };

    return SecurityAttribute;
}(ozpIwc.util));
