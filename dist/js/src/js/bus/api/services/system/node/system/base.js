var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.SystemNode = (function (api, util) {
    /**
     * @class SystemNode
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-system-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};

        return {
            name: data.name,
            version: data.version
        };
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @return String
     */
    Node.prototype.resourceFallback = function () {
        return "/system";
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));