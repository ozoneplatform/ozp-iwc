var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.UserNodeV2 = (function (api, util) {
    /**
     * The same schema as UserNode, but content type naming scheme changed.
     * @class UserNodeV2
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.system.node.UserNode
     * @constructor
     */
    var Node = util.extend(api.system.node.UserNode, function (config) {
        api.system.node.UserNode.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-user+json;version=2";

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
            displayName: data.display_name,
            id: data.id,
            username: data.username
        };
    };
    return Node;
}(ozpIwc.api, ozpIwc.util));