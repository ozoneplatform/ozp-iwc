var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 */

ozpIwc.api.names.Node = (function (ozpIwc) {

    /**
     * Names Node. Inherits Base Node.
     * @class Node
     * @namespace ozpIwc.api.names
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = ozpIwc.util.extend(ozpIwc.api.base.Node, function (config) {
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

        /**
         * @property entity
         * @type {Object}
         */
        this.entity = config.entity || {};

    });

    return Node;
}(ozpIwc));