ozpIwc.NamesApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);
    config=config || {};
    this.name=config.entity && config.entity.name;
    this.address=config.entity && config.entity.address;
    this.contentType=config.contentType;
});