var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.names = ozpIwc.api.names || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.names
 * @class ozpIwc.api.names.Api
 */

ozpIwc.api.names.Api = (function (api, NamesApi) {

//---------------------------------------------------------
// Default Routes
//---------------------------------------------------------
    // Default handlers are fine for list, bulkGet, watch, and unwatch with any properly formed resource
    NamesApi.useDefaultRoute(["list", "bulkGet"], "{c:/}");
    NamesApi.useDefaultRoute(["list", "bulkGet"], "{c:/(?:api|address|multicast|router).*}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/api/{addr}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/address/{addr}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/multicast/{group}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/multicast/{group}/{memberAddr}");
    NamesApi.useDefaultRoute(["get", "delete", "watch", "unwatch"], "/router/{addr}");

//---------------------------------------------------------
// Routes
//---------------------------------------------------------
    //-----------------------------------------------------
    // Address, Multicast, and Router resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: ["set", "delete"],
        resource: "/{collection:api|address|multicast|router}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.NoPermissionError(packet);
    });

    NamesApi.declareRoute({
        action: "get",
        resource: "/{collection:api|address|multicast|router}",
        filters: []
    }, function (packet, context, pathParams) {
        return {
            "contentType": "application/json",
            "entity": this.matchingNodes(packet.resource).map(function (node) {
                return node.resource;
            })
        };
    });
    //-----------------------------------------------------
    // Api resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/api/{addr}",
        filters: api.filter.standard.setFilters(api.base.Node, "application/vnd.ozp-iwc-api-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    //-----------------------------------------------------
    // Address resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/address/{addr}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    //-----------------------------------------------------
    // Multicast resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/multicast/{addr}",
        filters: api.filter.standard.setFilters(api.base.Node, "application/vnd.ozp-iwc-multicast-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    NamesApi.declareRoute({
        action: "set",
        resource: "/multicast/{group}/{member}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-multicast-address-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address
        context.node.set(packet);
        return {response: "ok"};
    });

    //-----------------------------------------------------
    // Router resources
    //-----------------------------------------------------
    NamesApi.declareRoute({
        action: "set",
        resource: "/router/{addr}",
        filters: api.filter.standard.setFilters(api.names.Node, "application/vnd.ozp-iwc-router-v1+json")
    }, function (packet, context, pathParams) {
        // validate that the entity is an address

        //
        context.node.set(packet);
        return {response: "ok"};
    });
    return NamesApi;
}(ozpIwc.api, ozpIwc.api.names.Api || {}));