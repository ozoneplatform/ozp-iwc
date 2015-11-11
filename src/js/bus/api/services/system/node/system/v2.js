var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.node = ozpIwc.api.system.node || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.node
 */


ozpIwc.api.system.node.SystemNodeV2 = (function (api, util) {
    /**
     * The same schema as SystemNode, but content type naming scheme changed.
     * @class UserNodeV2
     * @namespace ozpIwc.api.system.node
     * @extends ozpIwc.api.system.node.SystemNode
     * @constructor
     */
    var Node = util.extend(api.system.node.SystemNode, function (config) {
        api.system.node.SystemNode.apply(this, arguments);
    });


    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-iwc-system+json;version=2";

    return Node;
}(ozpIwc.api, ozpIwc.util));