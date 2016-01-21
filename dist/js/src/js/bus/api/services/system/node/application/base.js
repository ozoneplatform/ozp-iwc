var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.ApplicationNode = (function (api, util) {
    /**
     * @class ApplicationNode
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
    Node.serializedContentType = "application/vnd.ozp-application-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        var blacklist = ["_embedded", "_links"];
        var entity = {};
        for (var i in data) {
            if (data.hasOwnProperty(i) && blacklist.indexOf(i) === -1) {
                entity[i] = data[i];
            }
        }
        return entity;
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param serializedForm
     * @return String
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        /*jshint camelcase: false */
        if (serializedForm.unique_name) {
            return "/application/" + serializedForm.unique_name;
        } else if (serializedForm.id) {
            return "/application/" + serializedForm.id;
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
