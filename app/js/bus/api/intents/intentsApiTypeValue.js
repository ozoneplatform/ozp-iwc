/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the application/vnd.ozp-iwc-intent-type-v1+json content type.
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
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-type-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-type-v1+json";

    ozpIwc.CommonApiValue.apply(this, arguments);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(this.resource.replace("$","\\$").replace(".","\\.")+"\/[^/]*$");
    this.pattern.toJSON = RegExp.prototype.toString;
    this.entity={
        'type': config.intentType,
        'actions': []
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

/**
 * Handles deserializing an {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}} and setting this value with
 * the contents.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.IntentsApiTypeValue.prototype.deserialize=function(serverData) {
    var clone = ozpIwc.util.clone(serverData);
// we need the persistent data to conform with the structure of non persistent data.
    this.entity= clone.entity || {};

    this.pattern = (typeof clone.pattern == "string") ? new RegExp(clone.pattern.replace(/^\/|\/$/g, '')) : this.pattern;
    this.pattern.toJSON = RegExp.prototype.toString;

    this.contentType=clone.contentType || this.contentType;
    this.permissions=clone.permissions || this.permissions;
    this.version=clone.version || this.version;
    this.watchers = clone.watchers || this.watchers;
};

/**
 * Serializes a Intents Api Type value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
 */
ozpIwc.IntentsApiTypeValue.prototype.serialize=function() {
    var serverData = {};
    serverData.entity=this.entity;
    serverData.pattern=this.pattern;
    serverData.contentType=this.contentType;
    serverData.permissions=this.permissions;
    serverData.version=this.version;
    serverData.watchers=this.watchers;
    return serverData;
};
