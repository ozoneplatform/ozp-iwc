var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 */

ozpIwc.api.names.Node = (function (api, util) {

    /**
     * Names Node. Inherits Base Node.
     * @class Node
     * @namespace ozpIwc.api.names
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
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

    return Node;
}(ozpIwc.api, ozpIwc.util));