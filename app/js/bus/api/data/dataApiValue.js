/**
 * @submodule bus.api.Value
 */

/**
 * @class DataApiValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.DataApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);
    config = config || {};

    /**
     * @property children
     * @type Array[String]
     */
	this.children=config.children || [];

    /**
     * @property persist
     * @type Boolean
     * @default true
     */
	this.persist=config.persist || true;

    /**
     * @property dirty
     * @type Boolean
     * @default true
     */
	this.dirty=config.dirty || true;
});

/**
 * Adds a child resource to the Data Api value.
 *
 * @method addChild
 * @param {String} child name of the child record of this
 */
ozpIwc.DataApiValue.prototype.addChild=function(child) {
    if(this.children.indexOf(child) < 0) {
        this.children.push(child);
    	this.version++;
    }
	this.dirty= true;
};

/**
 *
 * Removes a child resource from the Data Api value.
 *
 * @method removeChild
 * @param {String} child name of the child record of this
 */
ozpIwc.DataApiValue.prototype.removeChild=function(child) {
	this.dirty= true;
	var originalLen=this.children.length;
    this.children=this.children.filter(function(c) {
        return c !== child;
    });
    if(originalLen !== this.children.length) {
     	this.version++;
    }
};

/**
 * Lists all children resources of the Data Api value.
 *
 * @method listChildren
 * @param {string} child name of the child record of this
 * @returns {String[]}
 */
ozpIwc.DataApiValue.prototype.listChildren=function() {
    return ozpIwc.util.clone(this.children);
};

/**
 * Converts the Data Api value to a {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}}.
 *
 * @method toPacket
 * @param {String} child name of the child record of this
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.DataApiValue.prototype.toPacket=function() {
	var packet=ozpIwc.CommonApiValue.prototype.toPacket.apply(this,arguments);
	packet.links=packet.links || {};
	packet.links.children=this.listChildren();
	return packet;
};

/**
 * Returns a comparison of the current Data Api value to a previous snapshot.
 *
 * @method changesSince
 * @param {ozpIwc.TransportPacket} snapshot
 * @returns {Object}
 */
ozpIwc.DataApiValue.prototype.changesSince=function(snapshot) {
    var changes=ozpIwc.CommonApiValue.prototype.changesSince.apply(this,arguments);
	if(changes) {
        changes.removedChildren=snapshot.links.children.filter(function(f) {
            return this.indexOf(f) < 0;
        },this.children);
        changes.addedChildren=this.children.filter(function(f) {
            return this.indexOf(f) < 0;
        },snapshot.links.children);
	}
    return changes;
};

/**
 * Deserializes a Data Api value from a packet and constructs this Data Api value.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.DataApiValue.prototype.deserialize=function(serverData) {
    var clone = ozpIwc.util.clone(serverData);

    // we need the persistent data to conform with the structure of non persistent data.
    this.entity= (clone.entity && clone.entity.entity) ?  clone.entity.entity : clone.entity || {};
    this.contentType=clone.contentType || this.contentType;
    this.permissions=clone.permissions || this.permissions;
    this.version=clone.version || this.version;

    /**
     * @property _links
     * @type Object
     */
    this._links = (clone.entity && clone.entity._links) ?  clone.entity._links : clone._links || this._links;

    /**
     * @property key
     * @type String
     */
    this.key = (clone.entity && clone.entity.key) ?  clone.entity.key : clone.key || this.key;

    /**
     * @property self
     * @type Object
     */
    this.self= (clone.self) ?  clone.self : this.self;

};

/**
 * Serializes a Data Api value from a  Data Api value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
 */
ozpIwc.DataApiValue.prototype.serialize=function() {
	var serverData = {};
	serverData.entity=this.entity;
	serverData.contentType=this.contentType;
	serverData.permissions=this.permissions;
	serverData.version=this.version;
	serverData.self=this.self;
	return serverData;
};

