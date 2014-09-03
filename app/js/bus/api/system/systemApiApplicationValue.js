ozpIwc.SystemApiApplicationValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
    this.systemApi=config.systemApi;
});


ozpIwc.SystemApiApplicationValue.prototype.deserialize=function(serverData) {
    this.entity=serverData.entity;
    this.contentType=serverData.contentType || this.contentType;
	this.permissions=serverData.permissions || this.permissions;
	this.version=serverData.version || ++this.version;
};

ozpIwc.SystemApiApplicationValue.prototype.getIntentsRegistrations=function() {
    return this.entity.intents;
};