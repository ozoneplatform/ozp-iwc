var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
ozpIwc.api.intents.node = ozpIwc.api.intents.node || {};

/**
 * @module ozpIwc.api.intents
 * @submodule ozpIwc.api.intents.node
 */


ozpIwc.api.intents.node.DefinitionNode = (function (api, log, util) {
    /**
     }
     * @class DefinitionNode
     * @namespace ozpIwc.api.intents.node
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var DefinitionNode = util.extend(api.base.Node, function (config) {

        // Take the supplied data for anything that matches in the super class,
        // such as resource.
        api.base.Node.apply(this, arguments);
        this.contentType = DefinitionNode.serializedContentType;
        /**
         * @property lifespan
         * @type {ozpIwc.api.Lifespan.Bound}
         */
        this.lifespan = new api.Lifespan.Ephemeral();
        /**
         * @property entity
         * @type {Object}
         */
        this.entity = config.entity || {};

    });

    /**
     * The content type of the data returned by serialize()
     *
     * @method serializedContentType
     * @static
     * @return {string}
     */
    DefinitionNode.serializedContentType = "application/vnd.ozp-iwc-intent-definition-v1+json";

    return DefinitionNode;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));