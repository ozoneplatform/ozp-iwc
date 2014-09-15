/**
 * @submodule bus.api.Type
 */

/**
 * The Data Api. Provides key value storage and app state-sharing through the IWC. Subclasses the
 * {{#crossLink "CommonApiBase"}}{{/crossLink}}. Utilizes the {{#crossLink "DataApiValue"}}{{/crossLink}} which
 * subclasses the {{#crossLink "CommonApiValue"}}{{/crossLink}}.
 *
 * @class DataApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 *
 * @constructor
 * @uses DataApiValue
 * @type {Function}
 * @params {Object} config
 * @params {ozpIwc.Participant} config.participant - the participant used for the Api communication
 */
ozpIwc.DataApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
	ozpIwc.CommonApiBase.apply(this,arguments);
    this.loadFromServer("data");
});

/**
 * Creates a DataApiValue from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet The packet used to create an api value
 *
 * @returns {ozpIwc.DataApiValue}
 */
ozpIwc.DataApi.prototype.makeValue = function(packet){
    return new ozpIwc.DataApiValue(packet);
};

/**
 * Creates a child node of a given Data Api node. The child's key will be automatically generated based on its
 * parents key.
 *
 * @method createChild
 * @private
 * @param {ozpIwc.DataApiValue} node  The node of the Api to create a child of.
 * @param {ozpIwc.TransportPacketContext} packetContext The TransportPacketContext
 * containing information to build the child node.
 *
 * @returns {ozpIwc.DataApiValue} The childNode created.
 */
ozpIwc.DataApi.prototype.createChild=function(node,packetContext) {
	var key=this.createKey(node.resource+"/");

	// save the new child
	var childNode=this.findOrMakeValue({'resource':key});
	childNode.set(packetContext.packet);
	return childNode;
};

/**
 * Sends a list of children of the specified node to the sender of the packet context.
 *
 * The sender of the packet context will receive a responding message with the following parameters:
 * ```
 * {
 *     response: 'ok',
 *     entity: [ <array of child node resources (String)> ]
 * }
 * ```
 * @method handleList
 * @param {ozpIwc.DataApiValue} node The node containing children to list.
 * @param {ozpIwc.TransportPacketContext} packetContext Packet context of the list request.
 */
ozpIwc.DataApi.prototype.handleList=function(node,packetContext) {
	packetContext.replyTo({
        'response': 'ok',
        'entity': node.listChildren()
    });
};

/**
 * Creates a child node of the given Data Api node. Creates a reference to the child node in the parent node's children
 * property.
 *
 *
 * A responding message is sent back to the sender of the packet context with the following parameters:
 * ```
 * {
 *     response: 'ok',
 *     entity: {
 *        resource: <resource(String) of the new child node>
 *     }
 * }
 * ```
 *
 * @method handleAddchild
 * @param {ozpIwc.DataApiValue} node - The parent node to add a child node to.
 * @param {ozpIwc.TransportPacketContext} packetContext - The packet context of which the child is constructed from.
 */
ozpIwc.DataApi.prototype.handleAddchild=function(node,packetContext) {
	var childNode=this.createChild(node,packetContext);

	node.addChild(childNode.resource);
	
	packetContext.replyTo({
        'response':'ok',
        'entity' : {
            'resource': childNode.resource
        }
    });
};

/**
 * Removes a child node from a given parent node.
 *
 * A responding message is sent back to the sender of the packet context with the following parameters:
 * ```
 * {
 *     response: 'ok'
 * }
 * ```
 * @method handleRemovechild
 * @param {ozpIwc.DataApiValue} node - The parent node of which to remove the child node.
 * @param {ozpIwc.TransportPacketContext} packetContext - The packet context containing the child node's resource in
 * its entity.
 */
ozpIwc.DataApi.prototype.handleRemovechild=function(node,packetContext) {
    node.removeChild(packetContext.packet.entity.resource);
	// delegate to the handleGet call
	packetContext.replyTo({
        'response':'ok'
    });
};
