var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.AjaxPersistenceQueue = (function (log, util) {
    /**
     * An AJAX queueing class that limits the amount of AJAX requests via the IWC by using ajax pools.
     *
     * @class AjaxPersistenceQueue
     * @namespace ozpIwc.util
     * @param {Object} config
     * @param {Number} config.poolSize
     * @constructor
     */
    var AjaxPersistenceQueue = function (config) {
        config = config || {};
        this.poolSize = config.poolSize || 1;

        this.syncPool = []; // The tail of the promise chain for each pool

        // populate the slots with resolved promises
        for (var i = 0; i < this.poolSize; ++i) {
            this.syncPool.push(Promise.resolve());
        }

        // a counter that round-robins the requests to persist among the slots
        this.nextSlot = 0;

        // maps the iwcUri to the promise that is saving it
        this.queuedSyncs = {};
    };

    /**
     * A Promise wrapped implementation of AJAX PUT for an IWC node.
     *
     * @method doSync
     * @param {String} iwcUri @TODO unused
     * @param {ozpIwc.api.base.Node} node
     * @return {Promise} Returns a promise that will resolve after AJAX is complete.
     */
    AjaxPersistenceQueue.prototype.doSync = function (iwcUri, node) {
        var uri = node.getSelfUri();
        if (!uri) {
            return Promise.resolve();
        }
        if (node.deleted) {
            return util.ajax({
                href: uri,
                method: 'DELETE'
            });
        } else {
            var entity = node.serializedEntity();
            if (typeof(entity) !== "string") {
                entity = JSON.stringify(entity);
            }
            log.debug("PUT " + uri, entity);
            return util.ajax({
                href: uri,
                method: 'PUT',
                data: entity,
                headers: [{
                    name: "Content-Type",
                    value: node.serializedContentType()
                }]
            }).then(function (result) {
                log.debug("  saving to " + uri, result);
            }, function (error) {
                log.error("  FAILED saving to " + uri, error);
            });
        }
    };

    /**
     * FIXME: it's possible to have poolSize updates in flight for a rapidly changing node when the pool is lightly
     * utilized. The duplicate call will occur when all of these conditions are met:
     *     * An ajax request for the node is still active.
     *     * queueNode(n) is called
     *     * the new sync promise reaches the head of its pool queue
     *   Example with poolSize=3 and node "n"
     *     queueNode(n) -> assigns n to pool 1
     *        pool 1 -> starts AJAX call and clears queuedSyncs[n]
     *     queueNode(n) -> n is not queued, so assigns n to pool 2
     *        pool 2 -> starts AJAX call and clears queuedSyncs[n]
     *     queueNode(n) -> n is not queued, so assigns n to pool 3
     *        pool 3 -> starts AJAX call and clears queuedSyncs[n]
     *
     *
     * @method queueNode
     * @param {String} iwcUri
     * @param {ozpIwc.api.base.Node} node
     * @return {*}
     */
    AjaxPersistenceQueue.prototype.queueNode = function (iwcUri, node) {
        var self = this;
        // the value of node is captured immediately before it is saved to the backend
        // only add it to the queue if it isn't already there
        if (!this.queuedSyncs[iwcUri]) {
            // round robin between slots
            this.nextSlot = (this.nextSlot + 1) % this.poolSize;

            // chain off the syncPool, update the sync pool tail,
            // and save it for the iwcUri for this node
            this.syncPool[this.nextSlot] = this.queuedSyncs[iwcUri] =
                this.syncPool[this.nextSlot].then(function () {
                    // since doSync serializes the node, remove it from the queue now
                    // to capture post-serialization changes
                    delete self.queuedSyncs[iwcUri];
                    return self.doSync(iwcUri, node);
                });
        }
        return this.queuedSyncs[iwcUri];
    };

    return AjaxPersistenceQueue;
}(ozpIwc.log, ozpIwc.util));
