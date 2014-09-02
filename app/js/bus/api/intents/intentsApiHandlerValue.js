/**
 * The capability value for an intent. adheres to the ozp-intents-type-capabilities-v1+json content type.
 * @class
 * @param {object} config
 *@param {object} config.entity
 * @param {string} config.entity.definitions - the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiHandlerValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/ozpIwc-intents-handler-v1+json"];
    config.contentType="application/ozpIwc-intents-handler-v1+json";
    ozpIwc.CommonApiValue.apply(this, arguments);
    this.entity={
        type: config.intentType,
        action: config.intentAction
    };
});

ozpIwc.IntentsApiHandlerValue.prototype.getHandlers=function(packetContext) {
    return [this];
};

ozpIwc.IntentsApiHandlerValue.prototype.set=function(packet) {
    ozpIwc.CommonApiValue.prototype.set.apply(this,arguments);
    this.entity.invokeIntent = this.entity.invokeIntent  || {};
    this.entity.invokeIntent.dst = this.entity.invokeIntent.dst || packet.src;
    this.entity.invokeIntent.resource = this.entity.invokeIntent.resource || "/intents" + packet.resource;
    this.entity.invokeIntent.action = this.entity.invokeIntent.action || "invoke";
};