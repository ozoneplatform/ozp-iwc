var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 */


ozpIwc.api.intents.InFlightNode = (function (ozpIwc) {
    /**
     }
     * @class InFlightNode
     * @namespace ozpIwc.api.intents
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var InFlightNode = ozpIwc.util.extend(ozpIwc.api.base.Node, function (config) {
        config = config || {};

        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        ozpIwc.api.base.Node.apply(this, arguments);
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new ozpIwc.api.Lifespan.Bound({
            'addresses': [config.src]
        });

        if (!config.invokePacket) {
            throw new ozpIwc.api.error.BadContentError("In flight intent requires an invocation packet");
        }
        if (!Array.isArray(config.handlerChoices) || config.handlerChoices < 1) {
            throw new ozpIwc.api.error.BadContentError("No handlers available");
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
            'entity': config.invokePacket.entity,
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
    return InFlightNode;
}(ozpIwc));