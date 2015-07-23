/**
 * @submodule bus.api.Value
 */

/**
 * @class LocksNode
 * @namespace ozpIwc
 * @extends ozpIwc.apiNode
 *
 * @constructor
 * @param {Object} config
 * @param {String[]} config.allowedContentTypes a list of content types this Locs Api value will accept.
 */
ozpIwc.LocksNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    ozpIwc.ApiNode.apply(this, arguments);
    this.entity={
        owner: null,
        queue: []
    };
});

/**
 * Pushes the ozpIwc.TransportPacket onto the mutex queue. If it is the first element in the queue, the packet's sender
 * will take control of the node.
 *
 * @method lock
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Object|null} should the lock action set a new owner it will be returned, else null will be returned.
 */
ozpIwc.LocksNode.prototype.lock=function(packet) {
    this.entity.queue = this.entity.queue || [];

    for(var i in this.entity.queue) {
        var current = this.entity.queue[i];
        //Skip over duplicates (for newly joined instances of locks)
        if(current.src === packet.src && current.msgId === packet.msgId) {
            return null;
        }
    }

    this.entity.queue.push(packet);
    this.entity.owner = this.entity.owner || {};
    if(!ozpIwc.util.objectContainsAll(this.entity.owner,this.entity.queue[0])) {
        this.entity.owner=this.entity.queue[0];
        if(packet.eTag) {
            this.version=packet.eTag;
        } else {
            this.version++;
        }
        return this.entity.owner;
    }
    return null;
};

/**
 * Removes all ozpIwc.TransportPackets in the queue that match the given packet. Should this remove the owner of the
 * mutex, the next remaining packet's sender will take control.
 *
 * @method lock
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Object|null} should the unlock action set a new owner it will be returned, else null will be returned.
 */
ozpIwc.LocksNode.prototype.unlock=function(packet) {
    this.entity.queue=this.entity.queue.filter(function(q) {
       return !ozpIwc.util.objectContainsAll(q,packet);
    });



    if(!ozpIwc.util.objectContainsAll(this.entity.owner,this.entity.queue[0])) {
        this.entity.owner=this.entity.queue[0];
        if(packet.eTag) {
            this.version=packet.eTag;
        } else {
            this.version++;
        }
        return this.entity.owner;
    } else if(this.entity.queue.length === 0){
        if(packet.eTag) {
            this.version=packet.eTag;
        } else {
            this.version++;
        }
        this.entity.owner = null;
    }
    return null;
};

