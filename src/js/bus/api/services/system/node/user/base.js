var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.UserNode = (function (api, util) {
    /**
     * @class UserNode
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
    Node.serializedContentType = "application/vnd.ozp-profile-v1+json";

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
            displayName: data.displayName,
            id: data.id,
            username: data.username
        };
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @return String
     */
    Node.prototype.resourceFallback = function () {
        return "/user";
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));