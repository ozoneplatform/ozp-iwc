var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.base = ozpIwc.api.base || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 */


ozpIwc.api.base.Node = (function (api, ozpConfig, util) {
    /**
     * The base class for an api node.
     *
     * @class Node
     * @namespace ozpIwc.api.base
     * @constructor
     * @param {Object} config
     * @param {String} config.resource
     * @param {String[]} config.allowedContentTypes
     * @param {Object} config.entity
     * @param {String} config.contentType
     * @param {Number} config.version
     * @param {String} config.self
     * @param {String} config.serializedEntity
     * @param {String} config.serializedContentType
     */
    var Node = function (config) {
        config = config || {};

        /**
         * @property resource
         * @type String
         */
        this.resource = config.resource;

        /**
         * @property allowedContentTypes
         * @type Array
         */
        this.allowedContentTypes = config.allowedContentTypes;

        /**
         * @property entity
         * @type Object
         */
        this.entity = config.entity;

        /**
         * @property contentType
         * @type String
         */
        this.contentType = config.contentType || Node.serializedContentType;

        /**
         * @property uriTemplate
         * @type String
         */
        // used if() to allow for subclasses to set the uriTemplate on the prototype
        // setting the field, even to undefined, would mask the prototype's value
        if (config.uriTemplate) {
            this.uriTemplate = config.uriTemplate;
        }

        /**
         * @property permissions
         * @type Object
         * @default {}
         */
        this.permissions = {};

        /**
         * @property version
         * @type Number
         * @default 0
         */
        this.version = config.version || 1;

        /**
         * @property lifespan
         * @type Boolean
         * @default false
         */
        var lifespanParsed = api.Lifespan.getLifespan(this, config);
        if (lifespanParsed) {
            if (lifespanParsed.type === "Bound" && !lifespanParsed.addresses) {
                lifespanParsed.addresses = [config.src];
            }
            this.lifespan = lifespanParsed;
        } else {
            this.lifespan = new api.Lifespan.Ephemeral();
        }

        /**
         * @property deleted
         * @type Boolean
         * @default true
         */
        this.deleted = false;

        /**
         * String to match for collection.
         * @property pattern
         * @type String
         */
        this.pattern = config.pattern;

        /**
         * @property collection
         * @type Array
         * @default []
         */
        this.collection = [];

        /**
         * @property self - The url backing this node
         * @type String
         */
        this.self = config.self || {};
        this.self.type = this.self.type || this.contentType;

        if (config.serializedEntity) {
            this.deserialize(config.serializedEntity, config.contentType);
        }

        if (!this.resource) {
            throw new Error("Base Node requires a resource");
        }
    };

    /**
     * Gathers the self uri from the uriTemplate property if it does not already exist.
     * @method getSelfUri
     * @return {String}
     */
    Node.prototype.getSelfUri = function () {
        if (this.self && this.self.href) {
            return this.self;
        }
        if (this.uriTemplate && api.uriTemplate) {
            var template = api.uriTemplate(this.uriTemplate);
            if (template) {
                this.self = {
                    href: util.resolveUriTemplate(template.href, this),
                    type: template.type
                };
                return this.self;
            }
        }
    };

    /**
     * Serialize the node to a form that conveys both persistent and
     * ephemeral state of the object to be handed off to a new API
     * leader.
     *
     * __Intended to be overridden by subclasses__
     * @method serializeLive
     * @return {Object}
     */
    Node.prototype.serializeLive = function () {
        return this.toPacket({
            deleted: this.deleted,
            contentType: this.contentType,
            pattern: this.pattern,
            collection: this.collection,
            lifespan: this.lifespan,
            allowedContentTypes: this.allowedContentTypes,
            self: this.self
        });
    };

    /**
     * Set the node using the state returned by serializeLive.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method deserializeLive
     * @param {Object} serializedForm The data returned from serializeLive
     * @return {Object} the content type of the serialized data
     */
    Node.prototype.deserializeLive = function (serializedForm, serializedContentType) {
        serializedForm.contentType = serializedForm.contentType || serializedContentType;
        this.set(serializedForm);
        if (serializedForm._links && serializedForm._links.self) {
            this.self = serializedForm._links.self;
        }
        if (!this.resource) {
            this.resource = serializedForm.resource || this.resourceFallback(serializedForm);
        }
        this.self = serializedForm.self || serializedForm._links.self || this.self;
        this.deleted = serializedForm.deleted;
        this.lifespan = serializedForm.lifespan;
        this.allowedContentTypes = serializedForm.allowedContentTypes;
        this.pattern = serializedForm.pattern;
        this.collection = serializedForm.collection;
    };


    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * Overriden by subclasses.
     *
     * @method deserializeResourceFromContentType
     * @param serializedForm
     */
    Node.prototype.deserializeResourceFromContentType = function (serializedForm) {
        if (serializedForm._links && serializedForm._links.self) {
            this.resource = serializedForm._links.self.href.replace(ozpConfig.apiRootUrl, "");
        }
    };

    /**
     * Serializes the node for persistence to the server.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method serialize
     * @return {String} a string serialization of the object
     */
    Node.prototype.serialize = function () {
        return JSON.stringify({
            entity: this.entity,
            resource: this.resource,
            self: this.self
        });
    };

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/json";

    /**
     * Sets the api node from the serialized form.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method deserialize
     * @param {String} data A string serialization of the object
     * @param {String} contentType The contentType of the object
     * @return {Object}
     */
    Node.prototype.deserialize = function (data, contentType) {
        if (typeof(data) === "string") {
            data = JSON.parse(data);
        }
        data = data || {};
        data._links = data._links || {};

        this.self = data.self || data._links.self || this.self;
        this.contentType = contentType;
        this.pattern = data.pattern;
        this.version = data.version || this.version;
        this.permissions = data.permissions || {};
        this.collection = data.collection || [];

        this.entity = this.deserializedEntity(data, contentType);

        if (!this.resource && !this.useIwcSelf()) {
            this.resource = this.resourceFallback(data);
        }
    };

    /**
     * Gathers api node's entity from the serialized form.
     *
     * __Intended to be overridden by subclasses__
     *
     * @method deserializedEntity
     * @param {Object} data
     */
    Node.prototype.deserializedEntity = function (data) {
        return data.entity;
    };

    /**
     * A static helper function for setting the resource of a node if it has an "ozp:iwcSelf" link.
     * Returns true if the resource was set.
     * @method useIwcSelf
     * @static
     * @returns {boolean}
     */
    Node.prototype.useIwcSelf = function () {
        if (this.self["ozp:iwcSelf"]) {
            this.resource = this.self["ozp:iwcSelf"].href.replace(/web\+ozp:\/\/[^/]+/, "");
            return true;
        }
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @method resourceFallback
     * @param serializedForm
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        return serializedForm.resource;
    };

    /**
     * Turns this value into a packet.
     *
     * @method toPacket
     * @param {ozpIwc.packet.Transport} [base] Fields to be merged into the packet.
     * @return {ozpIwc.packet.Transport}
     */
    Node.prototype.toPacket = function (base) {
        base = base || {};
        base.entity = util.clone(this.entity);
        base.lifespan = this.lifespan;
        base.contentType = this.contentType;
        base.permissions = this.permissions;
        base.eTag = this.version;
        base.resource = this.resource;
        base.pattern = this.pattern;
        base.collection = this.collection;
        return base;
    };


    /**
     * Sets a data based upon the content of the packet.  Automatically updates the content type,
     * permissions, entity, and updates the version.
     *
     * @method set
     * @param {ozpIwc.packet.Transport} packet
     */
    Node.prototype.set = function (packet) {
        if (!Array.isArray(packet.permissions)) {
            for (var i in packet.permissions) {
                //If a permission was passed, wipe its value and set it to the new value;
                this.permissions.clear(i);
                this.permissions.pushIfNotExist(i, packet.permissions[i]);
            }
        }
        this.lifespan = api.Lifespan.getLifespan(this, packet) || this.lifespan;
        this.contentType = packet.contentType || this.contentType;
        this.entity = util.ifUndef(packet.entity, this.entity);
        this.pattern = packet.pattern || this.pattern;
        this.deleted = false;
        if (packet.eTag) {
            this.version = packet.eTag;
        } else {
            this.version++;
        }
    };

    /**
     * Clears the entity of the node and marks as deleted.
     * @method markAsDeleted
     * @param {ozpIwc.packet.Transport} packet
     */
    Node.prototype.markAsDeleted = function (packet) {
        this.version++;
        this.deleted = true;
        this.entity = undefined;
        this.pattern = undefined;
        this.collection = undefined;
    };

    /**
     * Adds a new watcher based upon the contents of the packet.
     *
     * @method addWatch
     * @param {ozpIwc.packet.Transport} watch
     */
    Node.prototype.addWatch = function (watch) {
        this.watchers.push(watch);
    };

    /**
     * Removes all watchers who's packet matches that which is passed in.
     * @method removeWatch
     * @param {ozpIwc.packet.Transport} filter
     */
    Node.prototype.removeWatch = function (filter) {
        this.watchers = this.watchers.filter(filter);
    };


    /**
     * Generates a point-in-time snapshot of this value that can later be sent to
     * {@link ozpIwc.CommonApiValue#changesSince} to determine the changes made to the value.
     * This value should be considered opaque to consumers.
     *
     * <p> For API subclasses, the default behavior is to simply call toPacket().  Subclasses
     * can override this, but should likely override {@link ozpIwc.CommonApiValue#changesSince}
     * as well.
     *
     * @method snapshot
     * @return {ozpIwc.packet.Transport}
     */
    Node.prototype.snapshot = function () {
        return this.toPacket();
    };

    /**
     * From a given snapshot, create a change notifications.  This is not a delta, rather it's
     * change structure.
     * <p> API subclasses can override if there are additional change notifications.
     *
     * @method changesSince
     * @param {object} snapshot The state of the value at some time in the past.
     * @return {Object} A record of the current value and the value of the snapshot.
     */
    Node.prototype.changesSince = function (snapshot) {
        if (snapshot.eTag === this.version) {
            return null;
        }
        return {
            'newValue': this.toPacket(),
            'oldValue': snapshot
        };
    };

    return Node;
}(ozpIwc.api, ozpIwc.config, ozpIwc.util));
