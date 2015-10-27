var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.system
 */


ozpIwc.api.system.Node = (function (api, util) {
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
     * If a resource path isn't given, this takes the best guess at assigning it.
     * @override
     * @method resourceFallback
     * @param serializedForm
     * @return String
     */
    Node.prototype.resourceFallback = function (serializedForm) {
        switch (this.contentType) {
            case "application/vnd.ozp-application-v1+json":
                return "/application/" + serializedForm.id;
        }
    };

    return Node;
}(ozpIwc.api, ozpIwc.util));