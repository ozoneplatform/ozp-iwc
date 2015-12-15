var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.locks = ozpIwc.api.locks || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.locks
 */

ozpIwc.api.locks.Node = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.locks
     * @extends ozpIwc.api.base.node
     *
     * @constructor
     * @param {Object} config
     * @param {String[]} config.allowedContentTypes a list of content types this Locks Api value will accept.
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
        this.entity = {
            owner: null,
            queue: []
        };
    });

    /**
     * Pushes the ozpIwc.packet.Transport onto the mutex queue. If it is the first element in the queue, the packet's
     * sender will take control of the node.
     *
     * @method lock
     * @param {ozpIwc.packet.Transport} packet
     * @return {Object|null} should the lock action set a new owner it will be returned, else null will be returned.
     */
    Node.prototype.lock = function (packet) {
        this.entity.queue = this.entity.queue || [];

        for (var i in this.entity.queue) {
            var current = this.entity.queue[i];
            //Skip over duplicates (for newly joined instances of locks)
            if (current.src === packet.src && current.msgId === packet.msgId) {
                return null;
            }
        }

        this.entity.queue.push(packet);
        this.entity.owner = this.entity.owner || {};
        if (!util.objectContainsAll(this.entity.owner, this.entity.queue[0])) {
            this.entity.owner = this.entity.queue[0];
            if (packet.eTag) {
                this.version = packet.eTag;
            } else {
                this.version++;
            }
            return this.entity.owner;
        }
        return null;
    };

    /**
     * Removes all ozpIwc.packet.Transports in the queue that match the given packet. Should this remove the owner of
     * the mutex, the next remaining packet's sender will take control.
     *
     * @method unlock
     * @param {ozpIwc.packet.Transport} packet
     * @return {Object|null} should the unlock action set a new owner it will be returned, else null will be returned.
     */
    Node.prototype.unlock = function (packet) {
        this.entity.queue = this.entity.queue.filter(function (q) {
            return !util.objectContainsAll(q, packet);
        });

        this.entity.state = packet.entity || this.entity.state;

        if (!util.objectContainsAll(this.entity.owner, this.entity.queue[0])) {
            this.entity.owner = this.entity.queue[0];
            if (packet.eTag) {
                this.version = packet.eTag;
            } else {
                this.version++;
            }
            return this.entity.owner;
        } else if (this.entity.queue.length === 0) {
            if (packet.eTag) {
                this.version = packet.eTag;
            } else {
                this.version++;
            }
            this.entity.owner = null;
        }
        return null;
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));