/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the ozpIwc-intents-type-capabilities-v1+json content type.
 * @class IntentsApiTypeValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiTypeValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/ozpIwc-intents-contentType-v1+json"];
    config.contentType="application/ozpIwc-intents-contentType-v1+json";

    ozpIwc.CommonApiValue.apply(this, arguments);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(ozpIwc.util.escapeRegex(this.resource)+"/[^/]*");
    this.entity={
        'type': config.intentType,
        'actions': [],
        '_embedded': {
            'items': []            
        }
    };
});

/**
 * Returns true if the type value contains a reference to the node specified
 *
 * @method isUpdateNeeded
 * @param {ozpIwc.CommonApiValue} node
 * @returns {Boolean}
 */
ozpIwc.IntentsApiTypeValue.prototype.isUpdateNeeded=function(node) {
    return this.pattern.test(node.resource);
};

/**
 * Updates the Intents Api Type value with a list of changed definitions.
 *
 * @method updateContent
 * @param {String[]} changedNodes
 */
ozpIwc.IntentsApiTypeValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.entity.actions=changedNodes.map(function(changedNode) { 
        return changedNode.resource; 
    });
};