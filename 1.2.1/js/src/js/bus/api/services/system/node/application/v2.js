var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};


/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.ApplicationNodeV2 = (function (api, util) {
    /**
     * @class ApplicationNodeV2
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.system.node.ApplicationNode, function (config) {
        api.system.node.ApplicationNode.apply(this, arguments);
    });

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-application+json;version=2";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};
        data.small_icon = data.small_icon || {};
        return {
            id: data.id,
            name: data.title,
            launchUrls: {
                default: data.launch_url
            },
            icons: {
                small: data.small_icon.url
            },
            intents: util.ensureArray(data.intents)
        };
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
