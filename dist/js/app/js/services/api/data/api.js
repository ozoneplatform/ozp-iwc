var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.data
 */


ozpIwc.api.data.Api = (function (ozpIwc) {
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
    var Api = ozpIwc.api.createApi("data.api", function (config) {
        this.persistenceQueue = config.persistenceQueue || new ozpIwc.util.AjaxPersistenceQueue();
        this.endpoints = config.endpoints || [
                {
                    link: ozpIwc.config.linkRelPrefix + ":user-data",
                    headers: []
                }
            ];

    });

    // Default handlers are fine anything
    Api.useDefaultRoute(ozpIwc.api.base.Api.allActions);

    /**
     * Override the default node type to be a Data Api Node.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @return {ozpIwc.api.data.Node}
     */
    Api.prototype.createNodeObject = function (config) {
        return new ozpIwc.api.data.Node(config);
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
        var filters = ozpIwc.api.filter.standard.createAndCollectFilters(ozpIwc.api.data.Node);

        //Stash the child's pattern for now and create the parent.
        filters.unshift(function (packet, context, pathParams, next) {
            childData.pattern = packet.pattern;
            childData.lifespan = packet.lifespan;
            packet.pattern = null;
            packet.lifespan = null;
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
        }, ozpIwc.api.data.Node);
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
        filters: ozpIwc.api.filter.standard.deleteFilters()
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
}(ozpIwc));