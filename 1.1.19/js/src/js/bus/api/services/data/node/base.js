var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
ozpIwc.api.data.node = ozpIwc.api.data.node || {};

/**
 * @module ozpIwc.api.data
 * @submodule ozpIwc.api.data.node
 */

ozpIwc.api.data.node.Node = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.data.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);

        // If there was no specified lifespan in the creation, override to Persistent.
        if (!config.lifespan) {
            this.lifespan = new api.Lifespan.Persistent();
        }

        this.contentType = Node.serializedContentType;
    });

    /**
     * @property uriTemplate
     * @type {string}
     */
    Node.prototype.uriTemplate = "ozp:data-item";

    /**
     * Serializes the node for persistence to the server.
     *
     * @method serialize
     * @return {String}
     */
    Node.prototype.serialize = function () {
        return JSON.stringify({
            key: this.resource,
            entity: this.entity,
            collection: this.collection,
            pattern: this.pattern,
            contentType: this.contentType,
            permissions: this.permissions,
            version: this.version,
            self: this.self
        });
    };

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-data-object-v1+json";

    /**
     * Sets the api node from the serialized form.
     *
     * @method deserializedEntity
     * @param {Object} data
     * @param {String} contentType
     */
    Node.prototype.deserializedEntity = function (data, contentType) {
        if (typeof data.entity === "string") {
            try {
                return JSON.parse(data.entity);
            } catch (e) {
                return data.entity;
            }
        } else {
            return data.entity;
        }
    };

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
        try {
            data = JSON.parse(data);
        } catch (e) {

        }
        api.base.Node.prototype.deserialize.apply(this, [data.entity, contentType]);

        if (typeof this.permissions === "string") {
            this.permissions = JSON.parse(this.permissions);
        }

        if (typeof this.version === "string") {
            this.version = JSON.parse(this.version);
        }
    };
    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param {Object} serializedForm
     * @return {String}
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        if (serializedForm.key) {
            return ((serializedForm.key.charAt(0) === "/") ? "" : "/") + serializedForm.key;
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));
