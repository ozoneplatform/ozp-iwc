ozpIwc.ApiNode= function(config) {
    config=config || {};
    this.self=config.self;
    this.deleted=false;
    this.persist=true;
};


ozpIwc.ApiNode.prototype.serializedEntity=function() {
    
};

ozpIwc.ApiNode.prototype.serializedContentType=function() {
    return "application/json";
};