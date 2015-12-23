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
    var Api = api.createApi("system.api", function (config) {
        // The stock initializeData should do fine for us here as we're not using
        // any special subclasses for these items.  Might have to revisit this at
        // some point.
        /**
         * @property endpoints
         * @type {Object[]}
         */
        this.endpoints = config.endpoints || [
                {link: ozpConfig.linkRelPrefix + ":user", headers: []},
                {link: ozpConfig.linkRelPrefix + ":system", headers: []},
                {link: ozpConfig.linkRelPrefix + ":application", headers: []}
            ];

        this.contentTypeMappings = util.genContentTypeMappings(api.system.node);
        this.on("createdNode", this.updateIntents, this);
    });

//--------------------------------------------------
// Distributed Computing: Mutex lock on handling API requests/holding active state
//--------------------------------------------------

    /**
     * Called when the API begins operation as leader. Registers launching intent if not running in a worker.
     * @method onStart
     */
    Api.prototype.onStart = function () {
        //The system API cant launch applications directly from a worker, ozpIwc.Client's register in that case.
        if (!util.runningInWorker) {
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
            return this.participant.intents().register("/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api",
                registerData).catch(function (error) {
                    log.error("System.api failed to register for launch intent: ", error);
                });
        }
    };


//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------
    /**
     * Maps a content-type to an IWC System Node type.
     * @method findNodeType
     * @param {Object} contentTypeObj an object-formatted content-type
     * @param {String} contentTypeObj.name the content-type without any variables
     * @param {Number} [contentTypeObj.version] the version of the content-type.
     * @returns {undefined}
     */
    Api.prototype.findNodeType = function (contentType) {
        var formattedContentType = util.getFormattedContentType(contentType);
        var type = this.contentTypeMappings[formattedContentType.name];
        if (type) {
            if (formattedContentType.version) {
                return type[formattedContentType.version];
            } else {
                return type;
            }
        }
    };

    /**
     * Override the default node type to be a System Node.
     * @override
     * @method createNodeObject
     * @param {type} config
     * @param {Function} NodeType
     * @return {ozpIwc.api.system.Node}
     */
    Api.prototype.createNodeObject = function (config, NodeType) {
        if (NodeType) {
            return new NodeType(config);
        }
    };

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


    return Api;
}(ozpIwc.api, ozpIwc.log, ozpIwc.config, ozpIwc.util));
