var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.system
 * @class ozpIwc.api.system.Api
 */

ozpIwc.api.system.Api = (function (api, SystemApi, log, ozpConfig, util) {

//---------------------------------------------------------
// Default Routes
//---------------------------------------------------------
    SystemApi.useDefaultRoute(["bulkGet", "list"]);
    SystemApi.useDefaultRoute(["get", "watch", "unwatch"], "/user");
    SystemApi.useDefaultRoute(["get", "watch", "unwatch"], "/system");
    SystemApi.useDefaultRoute(["get", "watch", "unwatch"], "/application/{id}");
//---------------------------------------------------------
// Routes
//---------------------------------------------------------

    //-----------------------------------------------------
    // application collection
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: "get",
        resource: "/{collection:application}",
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
    // user resource
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: ["set", "delete"],
        resource: "/user",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

    //-----------------------------------------------------
    // system resource
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: ["set", "delete"],
        resource: "/system",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

    //-----------------------------------------------------
    // application listing resources
    //-----------------------------------------------------
    SystemApi.declareRoute({
        action: ["set", "delete"],
        resource: "/application/{id}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

    SystemApi.declareRoute({
        action: ["launch"],
        resource: "/application/{id}",
        filters: api.filter.standard.getFilters()
    }, function (packet, context, pathParams) {
        log.debug(this.logPrefix + " launching ", packet.entity);
        var entity = {
            "url": context.node.entity.launchUrls.default,
            "applicationId": context.node.resource,
            "launchData": packet.entity,
            "id": context.node.entity.id
        };
        var resource = "/application/vnd.ozp-iwc-launch-data-v1+json/run";

        if (util.runningInWorker()) {
            resource += "/";

            //if this is launching a routed intent make the source of the intent invoke open it.
            if (packet.entity && packet.entity.inFlightIntent && packet.entity.inFlightIntent.entity &&
                packet.entity.inFlightIntent.entity.invokePacket &&
                packet.entity.inFlightIntent.entity.invokePacket.src) {
                resource += packet.entity.inFlightIntent.entity.invokePacket.src;
            } else {
                resource += packet.src;
            }
        }

        this.participant.send({
            dst: "intents.api",
            action: "invoke",
            resource: resource,
            entity: entity
        });
        return {response: "ok"};
    });

    SystemApi.declareRoute({
        action: ["invoke"],
        resource: "/launchNewWindow",
        filters: []
    }, function (packet, context, pathParams) {
        log.debug(this.logPrefix + " handling launch data ", packet.entity);
        if (packet.entity && packet.entity.inFlightIntent) {
            util.openWindow(packet.entity.inFlightIntent.entity.entity.url, {
                "ozpIwc.peer": ozpConfig._busRoot,
                "ozpIwc.inFlightIntent": packet.entity.inFlightIntent.resource
            });
            return {'response': "ok"};
        } else {
            return {'response': "badResource"};
        }

    });

    return SystemApi;
}(ozpIwc.api, ozpIwc.api.system.Api || {}, ozpIwc.log, ozpIwc.config, ozpIwc.util));