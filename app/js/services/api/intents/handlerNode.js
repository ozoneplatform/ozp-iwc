var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 */


ozpIwc.api.intents.HandlerNode = (function (api, log, util) {
    /**
     }
     * @class HandlerNode
     * @namespace ozpIwc.api.intents
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var HandlerNode = util.extend(api.base.Node, function (config) {
        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Bound({
            'addresses': [config.src]
        });
        /**
         * @property entity
         * @type {Object}
         */
        this.entity = config.entity || {};

    });

    /**
     * Handles writing new data to the handler node.
     * @override
     * @method set
     * @param {Object} packet
     */
    HandlerNode.prototype.set = function (packet) {
        var dst = packet.src;
        if (packet.entity && packet.entity.invokeIntent && packet.entity.invokeIntent.dst) {
            dst = packet.entity.invokeIntent.dst;
        }
        if (!dst) {
            log.error("Handler lacks a invokeIntent.dst", packet);
            throw new api.error.BadContentError("Intent handler must supply invokeIntent.dst");
        }

        api.base.Node.prototype.set.apply(this, arguments);
        this.entity.invokeIntent = this.entity.invokeIntent || {};
        this.entity.invokeIntent.dst = dst;

        //We need to know what callback to call on the client.
        this.entity.replyTo = packet.msgId;
    };

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param serializedForm
     * @return String
     */
    HandlerNode.prototype.resourceFallback = function (serializedForm) {
        switch (this.contentType) {
            case "application/vnd.ozp-intents-v1+json":
                return "/" + serializedForm.intent.type + "/" + serializedForm.intent.action;
        }
    };

    return HandlerNode;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));