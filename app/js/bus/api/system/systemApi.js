var ozpIwc=ozpIwc || {};

ozpIwc.SystemApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
    ozpIwc.CommonApiBase.apply(this,arguments);
    
    
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/application",
        pattern: /^\/application\/.*$/,
        contentType: "application/ozpIwc-application-list-v1+json"
    }));
    
    this.loadFromServer("applications");
    // @todo populate user and system endpoints
    this.data["/user"]=new ozpIwc.CommonApiValue({
        resource: "/user",
        contentType: "application/ozpIwc-user-v1+json",
        entity: {
            "name": "DataFaked BySystemApi",
            "userName": "fixmefixmefixme"
        }
    });
    this.data["/system"]=new ozpIwc.CommonApiValue({
        resource: "/system",
        contentType: "application/ozpIwc-system-info-v1+json",
        entity: {
            "version": "1.0",
            "name": "Fake Data from SystemAPI FIXME"
        }
    });    
});

ozpIwc.SystemApi.prototype.findNodeForServerResource=function(serverObject,objectPath,rootPath) {
    var resource="/application" + objectPath.replace(rootPath,'');
    return this.findOrMakeValue({
        'resource': resource,
        'entity': serverObject,
        'contentType': "ozpIwc-application-definition-v1+json"
    });
};

ozpIwc.SystemApi.prototype.makeValue = function(packet){
    return new ozpIwc.SystemApiApplicationValue({
        resource: packet.resource, 
        entity: packet.entity, 
        contentType: packet.contentType, 
        systemApi: this
    });
};


ozpIwc.SystemApi.prototype.handleSet = function() {
    throw new ozpIwc.ApiError("badAction", "Cannot modify the system API");
};

ozpIwc.SystemApi.prototype.handleDelete = function() {
    throw new ozpIwc.ApiError("badAction", "Cannot modify the system API");
};
