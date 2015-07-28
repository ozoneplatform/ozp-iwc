/**
 * @class IntentsInFlightNode
 * @namespace ozpIwc
 * @extends ozpIwc.ApiNode
 * @constructor
 */
ozpIwc.IntentsInFlightNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    config=config || {};

    // Take the supplied data for anything that matches in the super class,
    // such as resource.
    ozpIwc.ApiNode.apply(this, arguments);
    /**
     * @property lifespan
     * @type {ozpIwc.Lifespan.Bound}
     */
    this.lifespan = new ozpIwc.Lifespan.Bound({
        'addresses': [config.src]
    });

    if(!config.invokePacket) {
        throw new ozpIwc.BadContentError("In flight intent requires an invocation packet");
    }
    if(!Array.isArray(config.handlerChoices) || config.handlerChoices <1) {
        throw new ozpIwc.BadContentError("No handlers available");
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
