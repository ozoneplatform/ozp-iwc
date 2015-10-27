var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.application = ozpIwc.api.system.application || {};


/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.application
 */


ozpIwc.api.system.application.NodeV2 = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.system
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.system.application.Node, function (config) {
        api.system.application.Node.apply(this, arguments);
    });

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-application+json";

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