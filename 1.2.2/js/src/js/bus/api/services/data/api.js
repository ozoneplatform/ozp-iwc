var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.data
 */


ozpIwc.api.data.Api = (function (api, ozpConfig, util) {
    /**
     * The Data Api.
     * Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.data
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="data.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("data.api", function (config) {
        this.endpoints = config.endpoints || [{link: ozpConfig.linkRelPrefix + ":user-data", headers: []}];
        this.contentTypeMappings = util.genContentTypeMappings(api.data.node);
    });


//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------
    /**
     * Maps a content-type to an IWC Node type.
     * Overridden to check for a template specified content-type for the data api nodes.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentType) {
        var formattedContentType = util.getFormattedContentType(contentType);
        if (!formattedContentType.name) {
            var template = api.uriTemplate('ozp:data-item') || {};
            formattedContentType = util.getFormattedContentType(template.type);
        }

        var type = this.contentTypeMappings[formattedContentType.name];
        if (type) {
            if (formattedContentType.version) {
                return type[formattedContentType.version];
            } else {
                return type;
            }
        }
        return api.data.node.NodeV2;
    };

    /**
     * Creates a node appropriate for the given config.  This does
     * NOT add the node to this.data.
     *
     * If no node type, no node created (does not use default node type).
     *
     * @method createNodeObject
     * @param {Object} config The node configuration configuration.
     * @param {Function} NodeType The contructor call for the given node type to be created.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        }
    };

    return Api;
}(ozpIwc.api, ozpIwc.config, ozpIwc.util));