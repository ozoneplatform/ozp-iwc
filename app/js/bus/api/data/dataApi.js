ozpIwc.DataApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
	ozpIwc.CommonApiBase.apply(this,arguments);
    var self = this;
    if (config.href && config.loadServerDataEmbedded) {
        this.loadServerDataEmbedded({href: config.href})
            .success(function () {
                //Add on load code here
            });
    }
});

ozpIwc.DataApi.prototype.makeValue = function(packet){
    return new ozpIwc.DataApiValue(packet);
};

ozpIwc.DataApi.prototype.createChild=function(node,packetContext) {
	var key=this.createKey(node.resource+"/");

	// save the new child
	var childNode=this.findOrMakeValue({'resource':key});
	childNode.set(packetContext.packet);
	return childNode;
};

ozpIwc.DataApi.prototype.handleList=function(node,packetContext) {
	packetContext.replyTo({
        'action': 'ok',
        'entity': node.listChildren()
    });
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleAddchild=function(node,packetContext) {
	var childNode=this.createChild(node,packetContext);

	node.addChild(childNode.resource);
	
	packetContext.replyTo({
        'action':'ok',
        'entity' : {
            'resource': childNode.resource
        }
    });
};

/**
 * @param {ozpIwc.CommonApiValue} node
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleRemovechild=function(node,packetContext) {
    node.removeChild(packetContext.packet.entity.resource);
	// delegate to the handleGet call
	packetContext.replyTo({
        'action':'ok'
    });
};

/**
 * Expects a complete Data API data store tree returned from the specified href. Data must be of hal/json type and the
 * stored tree must be in the '_embedded' property.
 *
 * @param config {Object}
 * @param config.href {String}
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.DataApi.prototype.loadServerDataEmbedded = function (config) {
    var self = this;
    var asyncResponse = new ozpIwc.AsyncAction();
    ozpIwc.util.ajax({
        href: config.href,
        method: "GET"
    })
        .success(function (data) {
            // Take the root path from where the intent data is stored so that we can remove it from each object that
            // becomes a intent value.
            var rootPath = data._links.self.href;
            for (var i in data._embedded['ozp:dataObjects']) {
                var object = data._embedded['ozp:dataObjects'][i];
                object.children = object.children || [];

                var loadPacket = {
                    packet: {
                        resource: object._links.self.href.replace(rootPath, ''),
                        entity: object.entity
                    }
                };
                var node = self.findOrMakeValue(loadPacket.packet);

                for (var i = 0; i < object.children.length; i++){
                    node.addChild(object.children[i]);
                }
                node.set(loadPacket.packet);
            }
            asyncResponse.resolve("success");
        });

    return asyncResponse;
};