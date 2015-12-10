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
     * Calls the callback when a slot in the ajax sync pool becomes available.
     * Returns a promise that resolve when the slotted operation begins.
     * Rejects if the unique id is already slotted.
     *
     * @method acquireSlot
     * @private
     * @static
     * @param {AjaxPersistenceQueue} queue
     * @param {String|Number} uuid
     * @param {Function} cb
     * @returns {*}
     */
    var acquireSlot = function (queue, uuid, cb) {
        // If the slot requested is filled reject to notify caller.
        if (!queue.queuedSyncs[uuid]) {
            queue.nextSlot = (queue.nextSlot + 1) % queue.poolSize;
            queue.syncPool[queue.nextSlot] = queue.queuedSyncs[uuid] = queue.syncPool[queue.nextSlot].then(function () {
                return cb();
            }).then(function (resp) {
                delete queue.queuedSyncs[uuid];
                return resp;
            }, function (err) {
                delete queue.queuedSyncs[uuid];
                throw err;
            });
            return queue.queuedSyncs[uuid];
        } else {
            return queue.queuedSyncs[uuid];
        }


    };

    /**
     * A Promise wrapped implementation of AJAX PUT for an IWC node.
     *
     * @method syncNode
     * @private
     * @param {ozpIwc.api.base.Node} node
     * @return {Promise} Returns a promise that will resolve after AJAX is complete.
     */
    var syncNode = function (node) {
        var self = node.getSelfUri() || {};
        var uri = self.href;
        var contentType = self.type;

        //If the node cannot provide the needed information for sending to the server
        //continue silently and resolve.
        if (!uri) {
            return Promise.resolve();
        }
        if (node.deleted) {
            return util.ajax({
                href: uri,
                method: 'DELETE'
            });
        } else {
            var entity = node.serialize();
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
                    value: contentType
                }]
            }).then(function (result) {
                log.debug("  saving to " + uri, result);
                return result;
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
        var slotCall = function () {
            return syncNode(node).catch(function () {
                log.info("[AJAX] [" + iwcUri + "] Ignoring persist, as one is already queued.");
            });
        };
        return acquireSlot(this, "Node:" + iwcUri, slotCall);
    };

    /**
     * An ajax sync pool wrapped AJAX call. Pools AJAX requests so requests do not get dropped
     * if too many connections are open.
     *
     * @method queueAjax
     * @param {Object} config
     * @param {String} config.href
     * @param {String} config.method
     *
     * @returns {Promise}
     */
    AjaxPersistenceQueue.prototype.queueAjax = function (config) {
        config = config || {};
        if (!config.href) {
            throw "Ajax queue requires href";
        }
        if (!config.method) {
            throw "Ajax queue requires method";
        }

        var resolve, reject;
        var retPromise = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        var slotCall = function () {
            return util.ajax(config).then(resolve, reject);
        };

        acquireSlot(this, config.method + ":" + config.href + ":" + Date.now(), slotCall);

        return retPromise;
    };

    return AjaxPersistenceQueue;
}(ozpIwc.log, ozpIwc.util));
