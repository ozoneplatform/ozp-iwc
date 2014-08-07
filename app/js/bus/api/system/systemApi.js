var ozpIwc=ozpIwc || {};

ozpIwc.SystemApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
    ozpIwc.CommonApiBase.apply(this,arguments);
    this.participant.securityAttributes=config.securityAttributes;
    if (config.userHref) {
        this.loadServerDataEmbedded({href: config.userHref, resource: '/user'})
            .success(function () {
                //Add on load code here
            });
    }
    if (config.systemHref) {
        this.loadServerDataEmbedded({href: config.systemHref, resource: '/system'})
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
    var originalPacketContext=packetContext;
    if (packetContext.packet.action==='set' || packetContext.packet.action==='delete') {
        node.permissions.modifyAuthority='apiLoader';
        if (packetContext.packet.securityAttributes) {
            packetContext.srcSubject=packetContext.srcSubject || {};
            Object.keys(packetContext.packet.securityAttributes).forEach(function(key) {
                packetContext.srcSubject[key]=packetContext.packet.securityAttributes[key];
            });
        }
    } else {
        delete node.permissions.modifyAuthority;
    }
    for (var i in arguments) {
        if (arguments[i] === originalNode) {
            arguments[i]=node;
        } else if (arguments[i] === originalPacketContext) {
            arguments[i]=packetContext;
        }
    }
    var retVal=ozpIwc.CommonApiBase.prototype.isPermitted.apply(this,arguments);
    delete node.permissions.modifyAuthority;
    return retVal
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
            var value=self.findOrMakeValue({'resource': config.resource});
            value.set({entity: data});
            asyncResponse.resolve("success");
        })
        .failure(function(data) {
            console.log("AJAX failure response: " + data)
            asyncResponse.resolve("failure",data);
        });

    return asyncResponse;
};
