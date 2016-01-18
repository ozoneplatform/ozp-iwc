var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.data = ozpIwc.api.data || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.data
 * @class ozpIwc.api.data.Api
 */

ozpIwc.api.data.Api = (function (api, DataApi) {

    // Default handlers are fine for all common actions
    DataApi.useDefaultRoute(api.base.Api.allActions);

//---------------------------------------------------------
// Add/Remove Child Functionality
//---------------------------------------------------------
    //-----------------------------------------------------
    // Filters
    //-----------------------------------------------------

    /**
     * A filter for adding children nodes to the data api. assigns the parent node a pattern & sets it as a collector.
     * @method addChildFilters
     * @private
     * @static
     * @return {function[]}
     */
    var addChildFilters = function () {
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
            packet.pattern = childData.pattern;
            packet.lifespan = childData.lifespan;
            return next();
        });
        return filters;
    };

    //-----------------------------------------------------
    // Routes
    //-----------------------------------------------------

    DataApi.declareRoute({
        action: ["addChild"],
        resource: "{resource:.*}",
        filters: addChildFilters()
    }, function (packet, context, pathParams) {
        var key = this.createKey(context.node.pattern);
        packet.resource = key;
        packet.pattern = packet.pattern || key + "/";
        var childNode = this.createNode({
            resource: key,
            lifespan: packet.lifespan,
            src: packet.src
        }, api.data.node.Node);

        // mark the parent as a collector
        this.addCollector(context.node);
        this.markForChange(childNode);
        childNode.set(packet);

        return {
            response: "ok",
            entity: {
                resource: childNode.resource
            }
        };
    });

    DataApi.declareRoute({
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

    return DataApi;
}(ozpIwc.api, ozpIwc.api.data.Api || {}));
