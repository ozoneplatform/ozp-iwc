/**
 * @submodule bus.api.Value
 */

/**
 * @class SystemApiApplicationValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 */
ozpIwc.SystemApiApplicationValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
    this.systemApi=config.systemApi;
});

/**
 * Deserializes a packet to set this System Api Application value
 *
 * @method deserialize
 * @param serverData
 */
ozpIwc.SystemApiApplicationValue.prototype.deserialize=function(serverData) {
    this.entity=serverData.entity;
    this.contentType=serverData.contentType || this.contentType;
	this.permissions=serverData.permissions || this.permissions;
	this.version=serverData.version || ++this.version;
};


/**
 * Returns the intents registered to this value.
 *
 * @method getIntentsRegistrations
 * @returns {?} @TODO (Doc the return)
 */
ozpIwc.SystemApiApplicationValue.prototype.getIntentsRegistrations=function() {
    return this.entity.intents;
};