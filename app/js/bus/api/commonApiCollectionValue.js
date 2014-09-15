/**
 * @submodule bus.api.Value
 */

/**
 * @class CommonApiCollectionValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 *
 * @type {Function}
 * @param {Object} config
 * @oaram {String} config.pattern
 */
ozpIwc.CommonApiCollectionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);
    this.persist=false;    
    this.pattern=config.pattern;
    this.entity=[];
});

/**
 * Returns if an update is needed.
 *
 * @method isUpdateNeeded
 * @param node
 * @returns {Boolean}
 */
ozpIwc.CommonApiCollectionValue.prototype.isUpdateNeeded=function(node) {
    return node.resource.match(this.pattern);
};

/**
 * Update the content of this value with an array of changed nodes.
 *
 * @method updateContent
 * @param {ozpIwc.commonApiValue[]} changedNodes
 */
ozpIwc.CommonApiCollectionValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.entity=changedNodes.map(function(changedNode) { return changedNode.resource; });
};

/**
 * Handles set actions on the value.
 *
 * @method set
 */
ozpIwc.CommonApiCollectionValue.prototype.set=function() {
    throw new ozpIwc.ApiError("noPermission","This resource cannot be modified.");
};
