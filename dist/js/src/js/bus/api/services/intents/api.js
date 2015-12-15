var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 */


ozpIwc.api.intents.Api = (function (api, log, ozpConfig, util) {
    /**
     * The Intents Api.
     * Subclasses the {{#crossLink "ozpIwc.api.base.Api"}}{{/crossLink}}.
     *
     * @class Api
     * @namespace ozpIwc.api.intents
     * @extends ozpIwc.api.base.Api
     * @constructor
     * @param {Object} config
     * @param {String} [config.name="intents.api"]
     * @param {ozpIwc.transport.Router} config.router
     */
    var Api = api.createApi("intents.api", function (config) {
        this.endpoints = config.endpoints || [{link: ozpConfig.linkRelPrefix + ":intent", headers: []}];
        this.contentTypeMappings = util.genContentTypeMappings(api.intents.node);
    });

//--------------------------------------------------
// API state initialization methods
//--------------------------------------------------
    Api.prototype.initializeData = function (deathScream) {
        deathScream = deathScream || {watchers: {}, collectors: [], data: []};
        this.watchers = deathScream.watchers;
        this.collectors = deathScream.collectors;
        deathScream.data.forEach(function (packet) {
            if (packet.resource.indexOf("/inFlightIntent") === 0) {
                packet.entity = packet.entity || {};
                packet.entity.dState = packet.entity.state;
                packet.entity.state = "deserialize";
                this.createNode({
                    resource: packet.resource, invokePacket: {},
                    handlerChoices: [0, 1],
                    state: "deserialize"
                }, api.intents.InFlightNode).deserializeLive(packet);
            } else {
                this.createNode({resource: packet.resource}).deserializeLive(packet);
            }
        }, this);

        this.updateCollections();
        if (this.endpoints) {
            var self = this;
            var onResource = function (resource) {
                self.loadedResourceHandler(resource);
            };
            return Promise.all(this.endpoints.map(function (u) {
                return util.halLoader.load(u.link, u.headers, onResource).catch(function (err) {
                    log.error(self.logPrefix, "load from endpoint failed. Reason: ", err);
                });
            }));
        } else {
            return Promise.resolve();
        }
    };

//--------------------------------------------------
// Node creation/modification methods
//--------------------------------------------------
    /**
     * Maps a content-type to an IWC Node type. Overriden in APIs.
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


//---------------------------------------------------------
// Intent Invocation Methods
//---------------------------------------------------------
    /**
     * Notifies the invoker when the state of the in flight intent changes.
     * @method updateInvoker
     * @static
     * @private
     * @param {ozpIwc.api.intents.Api} api
     * @param node
     */
    var updateInvoker = function (api, node) {
        var response = node.entity.reply || {};
        return api.send({
            dst: node.entity.invokePacket.src,
            replyTo: node.entity.invokePacket.msgId,
            response: "update",
            entity: {
                request: node.entity.entity,
                response: response.entity,
                handler: node.entity.handler,
                state: node.entity.state,
                status: node.entity.status
            }
        });
    };

    /**
     * A handler for invoke calls. Creates an inFlight-intent node and kicks off the inflight state machine.
     *
     * @method invokeIntentHandler
     * @param {Object} packet
     * @param {String} type
     * @param {String} action
     * @param {Object[]} handlers
     * @param {String} pattern
     * @return {Promise}
     */
    Api.prototype.invokeIntentHandler = function (packet, type, action, handlers, pattern) {
        var inflightNode = new api.intents.node.InFlightNode({
            resource: this.createKey("/inFlightIntent/"),
            src: packet.src,
            invokePacket: packet,
            type: type,
            action: action,
            handlerChoices: handlers,
            pattern: pattern
        });

        this.data[inflightNode.resource] = inflightNode;
        this.addCollector(inflightNode.resource);
        updateInvoker(this, inflightNode);
        this.data[inflightNode.resource] = api.intents.FSM.transition(inflightNode);
        return this.handleInflightIntentState(inflightNode);
    };

    /**
     * Handles the current state of the state machine.
     * If "choosing", the intent chooser will open.
     * If "delivering", the api will send the intent to the chosen handler
     * If "complete", the api will send the intent handler's reply back to the invoker and mark the inflight intent as
     * deleted.
     * @param {Object} inflightNode
     * @return {*}
     */
    Api.prototype.handleInflightIntentState = function (inflightNode) {
        switch (inflightNode.entity.state) {
            case "choosing":
                return this.handleChoosing(inflightNode);
            case "delivering":
                this.handleDelivering(inflightNode);
                break;
            case "complete":
                this.handleComplete(inflightNode);
                break;
            case "error":
                this.handleError(inflightNode);
                break;
            default:
                updateInvoker(this, inflightNode);
                break;
        }
        return Promise.resolve(inflightNode);
    };

    /**
     * A handler for the "choosing" state of an in-flight intent node.
     * @method handleChoosing
     * @param node
     * @return {Promise} Resolves when either a preference is gathered or the intent chooser is opened.
     */
    Api.prototype.handleChoosing = function (node) {

        var useRegisteredChooser = function (intentNode) {

            var tryChooser = function (chooser) {
                var packet = util.clone(chooser.entity.invokeIntent);
                packet.entity = packet.entity || {};
                packet.src = packet.src || packet.dst;
                packet.replyTo = chooser.entity.replyTo;
                packet.entity.inFlightIntent = intentNode.toPacket();
                packet.entity.force = (util.getInternetExplorerVersion() === 11);
                if (util.runningInWorker()) {
                    packet.entity.config = ozpConfig;
                    packet.entity.config.intentSelection = "intents.api" + node.resource;
                }

                return self.invokeIntentHandler(packet, '/inFlightIntent/chooser', 'choose', [chooser], '/inFlightIntent/chooser/choose/').then(function (inFlightNode) {
                    //This is because we are manually using the packetRouter route.
                    inFlightNode.entity = inFlightNode.entity || {};

                    if (inFlightNode.entity.state === "complete") {
                        return true;
                    } else if (inFlightNode.entity.state === "error") {
                        throw "err";
                    } else {
                        var res, rej;
                        var promise = new Promise(function (resolve, reject) {
                            res = resolve;
                            rej = reject;
                        });
                        var onComplete = function (node) {
                            if (node.resource === inFlightNode.resource) {
                                api.intents.FSM.off("complete", onComplete);
                                res(true);
                            }
                        };
                        var onError = function (node) {
                            if (node.resource === inFlightNode.resource) {
                                api.intents.FSM.off("error", onError);
                                rej("err");
                            }
                        };
                        api.intents.FSM.on("complete", onComplete);
                        api.intents.FSM.on("error", onError);
                        return promise;
                    }
                });
            };

            var itterChoosers = function (choosers) {
                if (choosers.length > 0) {
                    return tryChooser(choosers[0]).then(function () {
                        return Promise.resolve();
                    }).catch(function (err) {
                        choosers.shift();
                        return itterChoosers(choosers);
                    });
                } else {
                    return Promise.reject("no choosers.");
                }
            };


            var registeredChoosers = self.matchingNodes('/inFlightIntent/chooser/choose/');
            return itterChoosers(registeredChoosers);
        };

        var showChooser = function (err) {
            log.info("Picking chooser because", err);
            return useRegisteredChooser(node).catch(function (err) {

                if (util.getInternetExplorerVersion() !== 11) {
                    log.info("launching popup chooser because: ", err);
                    if (!util.runningInWorker()) {
                        util.openWindow(ozpConfig.intentsChooserUri, {
                            "ozpIwc.peer": ozpConfig._busRoot,
                            "ozpIwc.intentSelection": "intents.api" + node.resource
                        }, ozpConfig.intentChooserFeatures);
                    }
                } else {
                    log.error("Failed to handle intent choosing: Internet Explorer 11 is not supported" +
                        " for the default intent chooser.");
                    node = api.intents.FSM.transition(node, {state: "error"});
                }

                return node;
            });
        };
        var self = this;
        updateInvoker(this, node);
        return this.getPreference(node.entity.intent.type + "/" + node.entity.intent.action).then(function (handlerResource) {
            if (handlerResource in self.data) {
                node = api.intents.FSM.transition(node, {
                    entity: {
                        state: "delivering",
                        'handler': {
                            'resource': handlerResource,
                            'reason': "remembered"
                        }
                    }
                });
                updateInvoker(self, node);
                return self.handleInflightIntentState(node);
            } else {
                return showChooser();
            }
        }).catch(showChooser);
    };

    /**
     *  A handler for the "delivering" state of an in-flight intent node.
     *  Sends a packet to the chosen handler.
     *
     *  @TODO should resolve on response from the handler that transitions the node to "running".
     *
     * @method handleDelivering
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.handleDelivering = function (node) {
        var handlerNode = this.data[node.entity.handler.resource];

        var packet = util.clone(handlerNode.entity.invokeIntent);
        packet.entity = packet.entity || {};
        packet.replyTo = handlerNode.entity.replyTo;
        packet.entity.inFlightIntent = node.toPacket();
        log.debug(this.logPrefix + "delivering intent:", packet);
        updateInvoker(this, node);
        // TODO: packet permissions
        return this.send(packet);
    };

    /**
     * A handler for the "complete" state of an in-flight intent node.
     * Sends notification to the invoker that the intent was handled & deletes the in-flight intent node as it is no
     * longer needed.
     *
     * @method handleComplete
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.handleComplete = function (node) {
        if (node.entity.invokePacket && node.entity.invokePacket.src && node.entity.reply) {
            this.send({
                dst: node.entity.invokePacket.src,
                replyTo: node.entity.invokePacket.msgId,
                contentType: node.entity.reply.contentType,
                response: "complete",
                resource: node.entity.handler.resource,
                entity: node.entity.reply.entity
            });
            updateInvoker(this, node);
        }
        node.markAsDeleted();
    };
    /**
     * A handler for the "error" state of an in-flight intent node.
     * Sends notification to the invoker that the intent was handled & deletes the in-flight intent node as it is no
     * longer needed.
     *
     * @method handleError
     * @param {ozpIwc.api.base.Node} node
     */
    Api.prototype.handleError = function (node) {
        if (node.entity.invokePacket && node.entity.invokePacket.src) {
            this.send({
                dst: node.entity.invokePacket.src,
                replyTo: node.entity.invokePacket.msgId,
                contentType: node.entity.reply.contentType,
                response: "noResult",
                resource: node.entity.handler.resource,
                entity: node.entity.reply.entity
            });
            updateInvoker(this, node);
        }
        node.markAsDeleted();
    };

    return Api;

}(ozpIwc.api, ozpIwc.log, ozpIwc.config, ozpIwc.util));