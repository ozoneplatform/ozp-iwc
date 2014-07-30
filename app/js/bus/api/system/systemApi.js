var ozpIwc=ozpIwc || {};

ozpIwc.SystemApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
	ozpIwc.CommonApiBase.apply(this,arguments);
    if (config.userHref) {
        this.loadServerDataEmbedded({href: config.userHref})
            .success(function () {
                //Add on load code here
            });
    }
    if (config.systemHref) {
        this.loadServerDataEmbedded({href: config.systemHref})
            .success(function () {
                //Add on load code here
            });
    }
});

ozpIwc.SystemApi.prototype.makeValue = function(packet){
    return new ozpIwc.SystemApiValue({resource: packet.resource, contentType: packet.contentType, systemApi: this});
};

ozpIwc.SystemApi.prototype.isPermitted=function(node,packetContext) {
    var originalNode=node;
    if (packetContext.packet.action==='set' || packetContext.packet.action==='delete') {
        node.permissions.modifyAuthority='apiLoader';
    } else {
        delete node.permissions.modifyAuthority;
    }
    for (var i in arguments) {
        if (arguments[i] === originalNode) {
            arguments[i]=node;
        }
    }
   return ozpIwc.CommonApiBase.prototype.isPermitted.apply(this,arguments);
}

/**
 * Loads the user and system data from the specified href. Data must be of hal/json type and
 * the keys 'user' and 'system' in the '_embedded' property must have object values that
 * correspond to user and system, respectively.
 *
 * @param config {Object}
 * @param config.href {String}
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.SystemApi.prototype.loadServerDataEmbedded = function (config) {
    var self = this;
    var asyncResponse = new ozpIwc.AsyncAction();
    ozpIwc.util.ajax({
        href: config.href,
        method: "GET"
    })
        .success(function (data) {
            if (self.resource === '/user' || self.resource === '/system') {
                this.entity==data._embedded[self.resource];
            }
            asyncResponse.resolve("success");
        });

    return asyncResponse;
};
