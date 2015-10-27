var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
ozpIwc.api.system.application = ozpIwc.api.system.application || {};

/**
 * @module ozpIwc.api.system
 * @submodule ozpIwc.api.system.application
 */


ozpIwc.api.system.application.Node = (function (api, util) {
    /**
     * @class Node
     * @namespace ozpIwc.api.system
     * @extends ozpIwc.api.base.Node
     * @constructor
     */
    var Node = util.extend(api.base.Node, function (config) {
        api.base.Node.apply(this, arguments);
    });

    /**
     * The content type of the data returned by serialize()
     * @Property {string} serializedContentType
     */
    Node.serializedContentType = "application/vnd.ozp-application-v1+json";

    /**
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param serializedForm
     * @return String
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        if(serializedForm.id) {
            return "/application/" + serializedForm.id;
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));