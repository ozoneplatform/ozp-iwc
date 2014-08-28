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