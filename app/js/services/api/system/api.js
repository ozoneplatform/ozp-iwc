var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.system = ozpIwc.api.system || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.system
 */

ozpIwc.api.system.Api = (function (api, log, ozpConfig, util) {
    /**
     * The System Api. Provides reference data of registered applications, versions, and information about the current
     * user through the IWC. Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.system
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="system.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("system.api",function (config) {
        // The stock initializeData should do fine for us here as we're not using
        // any special subclasses for these items.  Might have to revisit this at
        // some point.
        /**
         * @property endpoints
         * @type {Object[]}
         */
        this.endpoints = config.endpoints || [
                {link: ozpConfig.linkRelPrefix + ":user",headers: []},
                {link: ozpConfig.linkRelPrefix + ":system",headers: []},
                {link: ozpConfig.linkRelPrefix + ":application", headers: []}
            ];

        this.contentTypeMappings = util.genContentTypeMappings(api.system.node);
        var self = this;
        this.on("createdNode", this.updateIntents, this);

        //The system API cant launch applications directly from a worker, ozpIwc.Client's register in that case.
        if(!util.runningInWorker()) {
            this.leaderPromise.then(function () {
                log.debug("System.api registering for the launch intent");
                var registerData = {
                    'lifespan': "ephemeral",
                    'entity': {
                        'type': "application/vnd.ozp-iwc-launch-data-v1+json",
                        'action': "run",
                        'label': "Open in new tab",
                        'invokeIntent': {
                            'dst': "system.api",
                            'action': 'invoke',
                            'resource': "/launchNewWindow"
                        }
                    }
                };
                return self.participant.intents().register("/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api",
                    registerData).catch(function (error) {
                        log.error("System.api failed to register for launch intent: ", error);
                    });
            });
        }
    });

    /**
     * Updates intents API registrations for the given system api application.
     * @method updateIntents
     * @param {Object} node
     * @return {Promise}
     */
    Api.prototype.updateIntents = function (node) {
        if (!node.entity || !node.entity.intents) {
            return;
        }
        var packets = [];

        // build out the messages for intent registrations but don't send, we are sending in bulk.
        node.entity.intents.forEach(function (i) {
            var icon = i.icon || (node.entity && node.entity.icons && node.entity.icons.small) ? node.entity.icons.small : '';
            var label = i.label || node.entity.name;
            var resource = "/" + i.type + "/" + i.action + "/system.api" + node.resource.replace(/\//g, '.');
            var payload = {
                'lifespan': "ephemeral",
                'entity': {
                    'type': i.type,
                    'action': i.action,
                    'icon': icon,
                    'label': label,
                    '_links': node.entity._links,
                    'invokeIntent': {
                        'action': 'launch',
                        'dst': 'system.api',
                        'resource': node.resource
                    }
                }
            };

            packets.push(this.participant.intents().messageBuilder.register(resource, payload));
        }, this);

        //Send out all intent messages in bulk
        return this.participant.intents().bulkSend(packets).then(function (response) {
            // After getting the ok on the bulk message, wait for each individual message to resolve
            return Promise.all(packets);
        });

    };

    /**
     * Maps a content-type to an IWC System Node type.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function(contentType){
        var formattedContentType = util.getFormattedContentType(contentType);
        var type = this.contentTypeMappings[formattedContentType.name];
        if(type){
            if(formattedContentType.version) {
                return type[formattedContentType.version];
            }else{
                return type;
            }
        }
    };
//====================================================================
// Collection endpoints
//====================================================================
    Api.useDefaultRoute(["bulkGet", "list"]);
    Api.declareRoute({
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

//====================================================================
// User endpoints
//====================================================================
    Api.useDefaultRoute(["get", "watch", "unwatch"], "/user");
    Api.declareRoute({
        action: ["set", "delete"],
        resource: "/user",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

//====================================================================
// System endpoints
//====================================================================
    Api.useDefaultRoute(["get", "watch", "unwatch"], "/system");

    Api.declareRoute({
        action: ["set", "delete"],
        resource: "/system",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });

//====================================================================
// Application Endpoints
//====================================================================
    Api.useDefaultRoute(["get", "watch", "unwatch"], "/application/{id}");
    Api.declareRoute({
        action: ["set", "delete"],
        resource: "/application/{id}",
        filters: []
    }, function (packet, context, pathParams) {
        throw new api.error.BadActionError(packet);
    });
    Api.declareRoute({
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

        if(util.runningInWorker()){
            resource+= "/";

            //if this is launching a routed intent make the source of the intent invoke open it.
            if(packet.entity && packet.entity.inFlightIntent && packet.entity.inFlightIntent.entity &&
                packet.entity.inFlightIntent.entity.invokePacket &&
                packet.entity.inFlightIntent.entity.invokePacket.src) {
                   resource +=  packet.entity.inFlightIntent.entity.invokePacket.src;
            }else {
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

    Api.declareRoute({
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

    /**
     * Override the default node type to be a System Node.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @param {Function} NodeType
     * @return {ozpIwc.api.system.Node}
     */
    Api.prototype.createNodeObject = function (config,NodeType) {
        if(NodeType){
            return new NodeType(config);
        }
    };

    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.config, ozpIwc.util));