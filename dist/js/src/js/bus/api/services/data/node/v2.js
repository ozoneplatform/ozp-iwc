var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
ozpIwc.api.data.node = ozpIwc.api.data.node || {};

/**
 * @module ozpIwc.api.data
 * @submodule ozpIwc.api.data.node
 */

ozpIwc.api.data.node.NodeV2 = (function (api, util) {
    /**
     * A data Api Node class for content-type "application/vnd.ozp-iwc-data-object+json;version=2".
     * @class Nodev2
     * @namespace ozpIwc.api.data.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.data.node.Node, function (config) {
        api.data.node.Node.apply(this, arguments);
        this.contentType = Node.serializedContentType;
    });

    /**
     * Formats the node for persistence to the server.
     *
     * @method serialize
     * @return {Object}
     */
    Node.prototype.serialize = function () {
        /*jshint camelcase: false */
        return {
            key: this.resource,
            entity: JSON.stringify(this.entity),
            content_type: this.contentType,
            version: this.version,
            pattern: this.pattern,
            collection: util.ensureArray(this.collection),
            permissions: util.ensureObject(this.permissions)
        };
    };

    /**
     * The content type of the data returned by serialized()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-data-object+json;version=2";

    /**
     * Sets the api node from the serialized form.
     * Deserializes permissions and versions ontop of base implementation.
     *
     * @method deserialize
     * @param {String} data A string serialization of the object
     * @param {String} contentType The contentType of the object
     * @return {Object}
     */
    Node.prototype.deserialize = function (data, contentType) {
        api.base.Node.prototype.deserialize.apply(this, arguments);

        if (typeof this.permissions === "string") {
            this.permissions = JSON.parse(this.permissions);
        }

        if (typeof this.version === "string") {
            this.version = JSON.parse(this.version);
        }
    };

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        /*jshint camelcase: false */
        data = data || {};
        return JSON.parse(data.entity);
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @return {String}
     */
    Node.prototype.resourceFallback = function () {
        if (this.self.href) {
            var baseUrl = api.endpoint("ozp:user-data").baseUrl;
            while (baseUrl.slice(-1) === "/") {
                baseUrl = baseUrl.slice(0, -1);
            }
            if (this.self.href.indexOf(baseUrl) === 0) {
                return this.self.href.replace(baseUrl, "");
            }
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));