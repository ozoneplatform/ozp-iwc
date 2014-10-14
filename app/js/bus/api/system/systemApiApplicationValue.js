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

    /**
     * A reference to the instantiated system Api
     * @property systemApi
     * @type {ozpIwc.SystemApi}
     */
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
 * @returns {ozpIwc.IntentsApiHandlerValue[]}
 */
ozpIwc.SystemApiApplicationValue.prototype.getIntentsRegistrations=function() {
    return this.entity.intents;
};