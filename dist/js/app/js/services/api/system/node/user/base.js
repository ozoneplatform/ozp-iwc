var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.user = ozpIwc.api.system.user|| {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.system
 */


ozpIwc.api.system.user.Node = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.system
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
    Node.serializedContentType = "application/vnd.ozp-iwc-user+json";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data  || {};

        return {
            displayName : data.display_name,
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