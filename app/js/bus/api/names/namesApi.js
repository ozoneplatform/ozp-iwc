var ozpIwc=ozpIwc || {};

ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function() {
	ozpIwc.CommonApiBase.apply(this,arguments);
});

ozpIwc.NamesApi.prototype.makeValue = function(config){
    config=config || {};
    return new ozpIwc.NamesApiValue(
        {resource: config.resource, contentType: config.contentType, entity: config.participant}
    );
};
