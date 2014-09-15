/**
 * @submodule bus.api.Value
 */

/**
 * @class SystemApiMailboxValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 */
ozpIwc.SystemApiMailboxValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
});