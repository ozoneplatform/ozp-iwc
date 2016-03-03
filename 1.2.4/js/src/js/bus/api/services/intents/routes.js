var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 * @class ozpIwc.api.intents.Api
 */

ozpIwc.api.intents.Api = (function (api, IntentsApi, log) {

//---------------------------------------------------------
// Default Routes
//---------------------------------------------------------
    // turn on bulkGet and list for everything
    IntentsApi.useDefaultRoute(["bulkGet", "list"]);
    IntentsApi.useDefaultRoute(["watch", "unwatch", "delete"], "/inFlightIntent/{id}");
    IntentsApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/{major}/{minor}/{action}/{handlerId}");
    IntentsApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/{major}/{minor}/{action}");
    IntentsApi.useDefaultRoute(["watch", "unwatch", "get"], "/");
    IntentsApi.useDefaultRoute(["watch", "unwatch", "get"], "/{major}");
    IntentsApi.useDefaultRoute(["watch", "unwatch", "get"], "/{major}/{minor}");

//---------------------------------------------------------
// Filters
//---------------------------------------------------------
    /**
     * A route filter for creating an intent definition (/{major}/{minor}/{action}) if it does not exist.
     * @method registerDefinitionFilter
     * @private
     * @static
     * @return {*}
     */
    var registerDefinitionFilter = function () {
        var setDefinition = function (packet, context, pathParams, next) {
            this.addCollector(context.node);
            return next();
        };

        var filters = api.filter.standard.setFilters(api.intents.node.DefinitionNode);
        filters.unshift(api.filter.base.fixPattern());
        filters.push(setDefinition);

        return filters;
    };

    /**
     * A route filter for creating an intent definition node (/{major}/{minor}/{action}) if it does not exist, then
     * creates an intent handler node with the specified handlerId ({major}/{minor}/{action}/{handlerId})
     * @method registerHandlerFilter
     * @private
     * @static
     * @return {*}
     */
    var registerHandlerFilter = function () {
        var generateDefinitionResource = function (packet, context, pathParams, next) {
            packet.resource = "/" + pathParams.major + "/" + pathParams.minor + "/" + pathParams.action;
            context.node = this.data[packet.resource];
            return next();
        };

        var generateHandlerResource = function (packet, context, pathParams, next) {
            packet.resource = "/" + pathParams.major + "/" + pathParams.minor + "/" + pathParams.action + "/" +
                pathParams.handlerId;
            packet.pattern = "";
            context.node = this.data[packet.resource];
            return next();
        };

        var definitionFilter = registerDefinitionFilter();
        definitionFilter.unshift(generateDefinitionResource);

        definitionFilter.push(generateHandlerResource);

        return definitionFilter;
    };

//---------------------------------------------------------
// Routes
//---------------------------------------------------------

    //-----------------------------------------------------
    // In Flight Intents
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: "set",
        resource: "/inFlightIntent/{id}",
        filters: api.filter.standard.setFilters(api.intents.node.InFlightNode)
    }, function (packet, context, pathParams) {
        context.node = api.intents.FSM.transition(context.node, packet);
        return this.handleInflightIntentState(context.node).then(function () {
            return {response: "ok"};
        });
    });

    //-----------------------------------------------------
    // Intent Types
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: ["set", "delete"],
        resource: "/{major}/{minor}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.NoPermissionError(packet);
    });

    IntentsApi.declareRoute({
        action: "get",
        resource: "/{major}/{minor}",
        filters: []
    }, function (packet, context, pathParams) {
        if (context.node) {
            // the following needs to be included, possibly via override of toPacket();
            //'invokeIntent': childNode
            return context.node.toPacket();
        } else {
            return {
                response: "ok",
                entity: {
                    "type": pathParams.major + "/" + pathParams.minor,
                    "actions": this.matchingNodes(packet.resource).map(function (n) {
                        return n.entity.action;
                    })
                }
            };
        }
    });

    //-----------------------------------------------------
    // Intent Definitions
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: "register",
        resource: "/{major}/{minor}/{action}",
        filters: registerDefinitionFilter()
    }, function (packet, context, pathParams) {

        var childNode = this.createNode({
            'resource': this.createKey(context.node.resource + "/"),
            'src': packet.src
        }, api.intents.node.HandlerNode);
        childNode.set(packet);

        log.debug(this.logPrefix + " registered ", context.node);
        return {
            'response': 'ok',
            'entity': {
                'resource': childNode.resource
            }
        };
    });

    /**
     * A route for intent action invocations.
     * Will launch direct for user input if multiple options.
     */
    IntentsApi.declareRoute({
        action: "invoke",
        resource: "/{major}/{minor}/{action}",
        filters: api.filter.standard.getFilters()
    }, function (packet, context, pathParams) {
        return this.invokeIntentHandler(
            packet,
            pathParams.major + "/" + pathParams.minor,
            pathParams.action,
            this.matchingNodes(context.node.pattern),
            context.node.pattern
        );
    });

    IntentsApi.declareRoute({
        action: "broadcast",
        resource: "/{major}/{minor}/{action}",
        filters: api.filter.standard.getFilters()
    }, function (packet, context, pathParams) {
        for (var i  in context.node.collection) {
            this.invokeIntentHandler(
                packet,
                pathParams.major + "/" + pathParams.minor,
                pathParams.action,
                this.matchingNodes(context.node.collection[i]),
                context.node.collection[i]
            );
        }

        return {
            response: "pending",
            entity: {
                handlers: context.node.collection
            }
        };
    });

    //-----------------------------------------------------
    // Intent Handlers
    //-----------------------------------------------------
    IntentsApi.declareRoute({
        action: "invoke",
        resource: "/{major}/{minor}/{action}/{handlerId}",
        filters: []
    }, function (packet, context, pathParams) {
        return this.invokeIntentHandler(
            packet,
            pathParams.major + "/" + pathParams.minor,
            pathParams.action,
            context.node,
            undefined
        );
    });

    IntentsApi.declareRoute({
        action: "set",
        resource: "/{major}/{minor}/{action}/{handlerId}",
        filters: api.filter.standard.setFilters(api.intents.HandlerNode)
    }, function (packet, context, pathParams) {
        context.node.set(packet);
        return {"response": "ok"};
    });

    /**
     * Registration handler when a handlerId is specified
     */
    IntentsApi.declareRoute({
        action: "register",
        resource: "/{major}/{minor}/{action}/{handlerId}",
        filters: registerHandlerFilter()
    }, function (packet, context, pathParams) {
        var childNode = this.createNode({
            'resource': packet.resource,
            'src': packet.src
        }, api.intents.node.HandlerNode);
        childNode.set(packet);

        log.debug(this.logPrefix + " registered ", context.node);
        return {
            'response': 'ok',
            'entity': {
                'resource': childNode.resource
            }
        };
    });

    return IntentsApi;
}(ozpIwc.api, ozpIwc.api.intents.Api || {}, ozpIwc.log));
