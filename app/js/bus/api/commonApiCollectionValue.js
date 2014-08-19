
ozpIwc.CommonApiCollectionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);
    this.persist=false;    
    this.pattern=config.pattern;
    this.entity=[];
});

ozpIwc.CommonApiCollectionValue.prototype.updateContent=function(api) {
    var changed=false;
    this.entity=[];
    for(var k in api.data) {
        if(k.match(this.pattern)) {
            this.entity.push(k);
            changed=true;
        }
    }
    if(changed) {
        this.version++;
    }
};

ozpIwc.CommonApiCollectionValue.prototype.set=function() {
    throw new ozpIwc.ApiError("noPermission","This resource cannot be modified.");
};
