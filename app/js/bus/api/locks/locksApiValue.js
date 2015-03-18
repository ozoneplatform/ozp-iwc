/**
 * @submodule bus.api.Value
 */

/**
 * @class LocksApiValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 * @param {String[]} config.allowedContentTypes a list of content types this Names Api value will accept.
 */
ozpIwc.LocksApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);
    this.entity={
        owner: null,
        queue: []
    };
});

ozpIwc.LocksApiValue.prototype.lock=function(packet) {
    this.entity.queue.push(packet);
    if(this.entity.queue.length===1) {
        this.entity.owner=packet;
        return this.entity.owner;
    } else {
        return null;
    }
    
};

ozpIwc.LocksApiValue.prototype.unlock=function(packet) {
    this.entity.queue=this.entity.queue.filter(function(q) {
       return !ozpIwc.util.objectContainsAll(q,packet);
    });
    
    if(this.entity.owner !== this.entity.queue[0]) {
        this.entity.owner=this.entity.queue[0];
        return this.entity.owner;
    }
    return null;
    
};

