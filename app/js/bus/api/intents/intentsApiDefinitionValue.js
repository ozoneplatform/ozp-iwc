/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the ozpIwc-intents-type-capabilities-v1+json content type.
 * @class IntentsApiDefinitionValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiDefinitionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/ozpIwc-intents-definition-v1+json"];
    config.contentType="application/ozpIwc-intents-definition-v1+json";
    ozpIwc.CommonApiValue.call(this, config);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(ozpIwc.util.escapeRegex(this.resource)+"/[^/]*");
    this.handlers=[];
    this.entity={
        type: config.intentType,
        action: config.intentAction,        
        handlers: []
    };
});

/**
 * Returns true if the definition value contains a reference to the node specified.
 *
 * @method isUpdateNeeded
 * @param {ozpIwc.CommonApiValue} node
 * @returns {Boolean}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.isUpdateNeeded=function(node) {
    return this.pattern.test(node.resource);
};

/**
 * Updates the Intents Api Definition value with a list of changed handlers.
 *
 * @method updateContent
 * @param {String[]} changedNodes
 */
ozpIwc.IntentsApiDefinitionValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.handlers=changedNodes;
    this.entity.handlers=changedNodes.map(function(changedNode) { 
        return changedNode.resource; 
    });
};

/**
 * Returns the list of handlers registered to the definition value.
 *
 * @method getHandlers
 * @param packetContext
 * @returns {*[]}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.getHandlers=function(packetContext) {
    return this.handlers;
};