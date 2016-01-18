var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
ozpIwc.api.intents.node = ozpIwc.api.intents.node || {};

/**
 * @module ozpIwc.api.intents
 * @submodule ozpIwc.api.intents.node
 */


ozpIwc.api.intents.node.InFlightNode = (function (api, util) {
    /**
     }
     * @class InFlightNode
     * @namespace ozpIwc.api.intents.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var InFlightNode = util.extend(api.base.Node, function (config) {
        config = config || {};

        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);
        this.contentType = InFlightNode.serializedContentType;
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Bound({
            'addresses': [config.src]
        });

        if (!config.invokePacket) {
            throw new api.error.BadContentError("In flight intent requires an invocation packet");
        }
        if (!config.handlerChoices || Array.isArray(config.handlerChoices) && config.handlerChoices.length === 0) {
            throw new api.error.NoResourceError("No handlers available");
        }
        /**
         * Extra information that isn't captured already by the base class, or that isn't captured adequately.
         *
         * @property entity
         * @type {Object}
         */
        this.entity = {
            'intent': {
                'type': config.type,
                'action': config.action
            },
            'invokePacket': config.invokePacket,
            'contentType': config.invokePacket.contentType,
            'entity': config.invokePacket.entity || {},
            'state': "init",
            'status': "ok",
            'handlerChoices': config.handlerChoices,
            'handler': {
                'resource': null,
                'address': null
            },
            'reply': null
        };
    });

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    InFlightNode.serializedContentType = "application/vnd.ozp-inflight-intent-v1+json";
    return InFlightNode;
}(ozpIwc.api, ozpIwc.util));
