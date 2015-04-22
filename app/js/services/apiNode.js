ozpIwc.ApiNode= function(config) {
 	config = config || {};
    if(!config.resource) { throw new Error("ApiNode requires a resource");}

    /**
     * @property resource
     * @type String
     */
	this.resource=config.resource;

    /**
     * @property allowedContentTypes
     * @type Array
     */
    this.allowedContentTypes=config.allowedContentTypes;

    /**
     * @property entity
     * @type Object
     */
    this.entity=config.entity;

    /**
     * @property contentType
     * @type String
     */
	this.contentType=config.contentType;

    /**
     * @property permissions
     * @type Object
     * @default {}
     */
	this.permissions=new ozpIwc.policyAuth.SecurityAttribute();
    for(var i in config.permissions){
        this.permissions.pushIfNotExist(i, config.permissions[i]);
    }

    /**
     * @property version
     * @type Number
     * @default 0
     */
	this.version=config.version || 1;

    /**
     * @property persist
     * @type Boolean
     * @default false
     */
    this.persist=true;

    /**
     * @property deleted
     * @type Boolean
     * @default true
     */
    this.deleted=false;
    
    /**
     * @property self - The url backing this node 
     * @type String
     */
    this.self=config.self;
};


ozpIwc.ApiNode.prototype.serialize=function() {
    return this.toPacket({
        deleted: this.deleted,
        persist: this.persist,
        allowedContentTypes: this.allowedContentTypes,
       _links: {
           self: {href: this.self}
       }
    });
};

ozpIwc.ApiNode.prototype.deserialize=function(packet) {
    if(packet._links && packet._links.self) {
        this.self=packet._links.self.href;
    }
    this.deleted = packet.deleted;
    this.persist=packet.persist;
    this.allowedContentTypes=packet.allowedContentTypes;
    this.set(packet);
};

ozpIwc.ApiNode.prototype.serializedEntity=function() {
    //TODO: umm... something something something...
    return this.entity;
};
ozpIwc.ApiNode.prototype.serializedContentType=function() {
    return "application/json";
};

/**
 * Turns this value into a packet.
 *
 * @method toPacket
 * @param {ozpIwc.TransportPacket} base Fields to be merged into the packet.
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.ApiNode.prototype.toPacket=function(base) {
	base = base || {};
	base.entity=ozpIwc.util.clone(this.entity);
	base.contentType=this.contentType;
	base.permissions=ozpIwc.util.clone(this.permissions.getAll());
	base.eTag=this.version;
	base.resource=this.resource;
	return base;
};


ozpIwc.ApiNode.prototype.set=function(packet) {
    if(!Array.isArray(packet.permissions)){
        for(var i in packet.permissions) {
            //If a permission was passed, wipe its value and set it to the new value;
            this.permissions.clear(i);
            this.permissions.pushIfNotExist(i,packet.permissions[i]);
        }
    }
    this.contentType=packet.contentType;
    this.entity=packet.entity;
    if(packet.eTag) {
        this.version=packet.eTag;
    } else {
        this.version++;
    }
};

ozpIwc.ApiNode.prototype.markAsDeleted=function(packet) {
    this.version++;
    this.deleted=true;
    this.entity=null;
};

ozpIwc.ApiNode.prototype.addWatch=function(watch) {
    this.watchers.push(watch);
};

ozpIwc.ApiNode.prototype.removeWatch=function(filter) {
    this.watchers=this.watchers.filter(filter);
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
 * @returns {object}
 */
ozpIwc.ApiNode.prototype.snapshot=function() {
	return this.toPacket();
};

/**
 * From a given snapshot, create a change notifications.  This is not a delta, rather it's
 * change structure.
 * <p> API subclasses can override if there are additional change notifications (e.g. children in DataApi).
 *
 * @method changesSince
 * @param {object} snapshot The state of the value at some time in the past.
 * @returns {Object} A record of the current value and the value of the snapshot.
 */
ozpIwc.ApiNode.prototype.changesSince=function(snapshot) {
	if(snapshot.eTag === this.version) {
        return null;
    }
	return {
        'newValue': this.toPacket(),
        'oldValue': snapshot
	};
};