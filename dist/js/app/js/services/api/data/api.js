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
        this.endpoints = config.endpoints || [{link: ozpConfig.linkRelPrefix + ":user-data",headers: []}];
        this.contentTypeMappings = util.genContentTypeMappings(api.data.node);
    });

    // Default handlers are fine anything
    Api.useDefaultRoute(api.base.Api.allActions);

    /**
     * Maps a content-type to an IWC Node type. Overriden in APIs.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function(contentType){
        var formattedContentType = util.getFormattedContentType(contentType);
        if(!formattedContentType.name){
            var template = api.uriTemplate('ozp:data-item') || {};
            formattedContentType = util.getFormattedContentType(template.type);
        }

        var type = this.contentTypeMappings[formattedContentType.name];
        if(type){
            if(formattedContentType.version) {
                return type[formattedContentType.version];
            }else{
                return type;
            }
        }
        return api.data.node.NodeV2;
    };

    /**
     * Creates a node appropriate for the given config.  This does
     * NOT add the node to this.data.
     *
     * Calls findNodeType to gather NodeType from contentType.
     *
     * @method createNodeObject
     * @param {Object} config The node configuration configuration.
     * @param {Function} NodeType The contructor call for the given node type to be created.
     * @return {ozpIwc.api.base.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if(NodeType) {
            return new NodeType(config);
        }
    };
//============================================
// Add/Remove Child:
//============================================
    /**
     * A filter for adding children nodes to the data api. assigns the parent node a pattern & sets it as a collector.
     * @method addChildFilters
     * @static
     * @return {function[]}
     */
    Api.addChildFilters = function () {
        var childData = {};
        var filters = api.filter.standard.createAndCollectFilters(api.data.node.Node);

        //Stash the child's pattern for now and create the parent.
        filters.unshift(function (packet, context, pathParams, next) {
            childData.pattern = packet.pattern;
            childData.lifespan = packet.lifespan;
            packet.pattern = undefined;
            packet.lifespan = undefined;
            return next();
        });
        //Make sure the parent node has it's pattern set then replace the childs pattern at the end of the filter chain
        filters.push(function (packet, context, pathParams, next) {
            context.node.set({
                pattern: packet.pattern
            });
            packet.pattern = childData.pattern;
            packet.lifespan = childData.lifespan;
            return next();
        });
        return filters;
    };

    Api.declareRoute({
        action: ["addChild"],
        resource: "{resource:.*}",
        filters: Api.addChildFilters()
    }, function (packet, context, pathParams) {
        var key = this.createKey(context.node.pattern);
        packet.resource = key;
        packet.pattern = packet.pattern || key + "/";
        var childNode = this.createNode({
            resource: key,
            lifespan: packet.lifespan,
            src: packet.src
        }, api.data.node.Node);
        this.markForChange(childNode);
        childNode.set(packet);

        return {
            response: "ok",
            entity: {
                resource: childNode.resource
            }
        };
    });

    Api.declareRoute({
        action: ["removeChild"],
        resource: "{resource:.*}",
        filters: api.filter.standard.deleteFilters()
    }, function (packet, context, pathParams) {
        if (packet.entity && packet.entity.resource) {
            packet.resource = packet.entity.resource;
            context.node = this.data[packet.resource];
            if (context.node) {
                this.markForChange(context.node);
                context.node.markAsDeleted(packet);
            }
        }
        return {response: "ok"};
    });

    return Api;
}(ozpIwc.api, ozpIwc.config, ozpIwc.util));