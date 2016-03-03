var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.ApiPromiseMixin = (function (apiMap, log, util) {
    /**
     * @class ApiPromiseMixin
     * @namespace ozpIwc.util
     * @static
     * Augments a participant or connection that supports basic IWC communications
     * functions for sending and receiving.
     * @uses ozpIwc.util.Event
     * @param {ozpIwc.transport.participant.Base} participant
     * @param {Boolean} autoConnect
     */
    var ApiPromiseMixin = function (participant, autoConnect) {
        autoConnect = (typeof autoConnect === "undefined" || autoConnect);

        participant.address = participant.address || "$nobody";
        participant.connect = participant.connect || function () {
                participant.connectPromise = Promise.resolve();
                return participant.connectPromise;
            };

        if (!participant.events) {
            participant.events = new util.Event();
            participant.events.mixinOnOff(participant);
        }

        var mixins = ApiPromiseMixin.getCore();
        for (var i in mixins) {
            participant[i] = mixins[i];
        }

        participant.readLaunchParams(util.globalScope.name);
        participant.readLaunchParams(util.globalScope.location.search);
        participant.readLaunchParams(util.globalScope.location.hash);

        ApiPromiseMixin.registerEvents(participant);

        participant.constructApiFunctions();

        if (autoConnect) {
            participant.connect().catch(function(err) {
                // Supress the error here, the application will get it from its
                // connect() call.
            });
        }
    };

    /**
     * Registers event listeners for the participant.  Listens for the following events: disconnect.
     * @method registerEvents
     * @static
     * @param {ozpIwc.transport.participant.Base} participant
     */
    ApiPromiseMixin.registerEvents = function (participant) {
        participant.on("disconnect", function () {
            participant.promiseCallbacks = {};
            participant.registeredCallbacks = {};
            util.globalScope.removeEventListener("message", participant.postMessageHandler, false);
            participant.connectPromise = null;
        });
    };

    /**
     * A factory for the apiPromise functionality.
     *
     * @method getCore
     * @static
     * @return {Object}
     */
    ApiPromiseMixin.getCore = function () {
        return {

            /**
             * @property promiseCallbacks
             * @type Object
             * @default {}
             */
            promiseCallbacks: {},

            /**
             * @property msgIdSequence
             * @type Number
             * @default 0
             */
            msgIdSequence: 0,

            /**
             * @property receivedPackets
             * @type Number
             * @default 0
             */
            receivedPackets: 0,

            /**
             * @property receivedBytes
             * @type Number
             * @default 0
             */
            receivedBytes: 0,

            /**
             * @property sentPackets
             * @type Number
             * @default 0
             */
            sentPackets: 0,

            /**
             * @property sentBytes
             * @type Number
             * @default 0
             */
            sentBytes: 0,

            /**
             * The epoch time the Client was instantiated.
             * @property startTime
             * @type Number
             */
            startTime: util.now(),

            /**
             * A map of available apis and their actions.
             * @property apiMap
             * @type Object
             */
            apiMap: apiMap || {},

            /**
             * @property wrapperMap
             * @type Object
             * @default {}
             */
            wrapperMap: {},

            /**
             * @property preconnectionQueue
             * @type Array
             * @default []
             */
            preconnectionQueue: [],

            /**
             * @property launchParams
             * @type Object
             * @default {}
             */
            launchParams: {},

            /**
             * @property watchMsgMap
             * @type Object
             * @default {}
             */
            watchMsgMap: {},

            /**
             * @property registeredCallbacks
             * @type Object
             * @default {}
             */
            registeredCallbacks: {},

            /**
             * @property launchedIntents
             * @type Array
             * @default []
             */
            launchedIntents: [],

            /**
             * Returns whether or not the participant is connected to the IWC bus.
             *
             * @method isConnected
             * @return {Boolean}
             */
            isConnected: function () {
                return this.address !== "$nobody";
            },

            /**
             * Parses launch parameters based on the raw string input it receives.
             *
             * @method readLaunchParams
             * @param {String} rawString
             */
            readLaunchParams: function (rawString) {
                // of the form ozpIwc.VARIABLE=VALUE, where:
                //   VARIABLE is alphanumeric + "_"
                //   VALUE does not contain & or #
                var re = /ozpIwc.(\w+)=([^&#]+)/g;
                var m;
                while ((m = re.exec(rawString)) !== null) {
                    var params = decodeURIComponent(m[2]);
                    try {
                        params = JSON.parse(params);
                    } catch (e) {
                        // ignore the errors and just pass through the string
                    }
                    this.launchParams[m[1]] = params;
                }
            },

            /**
             * Receive a packet from the connected peer.  If the packet is a reply, then
             * the callback for that reply is invoked.  Otherwise, it fires a receive event
             *
             * Fires:
             *     - {{#crossLink "ozpIwc.Client/receive:event}}{{/crossLink}}
             *
             * @method receive
             * @protected
             * @param {ozpIwc.packet.Transport} packetContext
             */
            receiveFromRouterImpl: function (packetContext) {
                var handled = false;

                // If no packet, it is likely a $transport packet.
                var packet = packetContext.packet || packetContext;
                //Try and handle this packet as a reply message
                if (packet.replyTo && this.promiseCallbacks[packet.replyTo]) {

                    var replyCancel = false;
                    var replyDone = function () {
                        replyCancel = true;
                    };
                    this.promiseCallbacks[packet.replyTo](packet, replyDone);

                    if (replyCancel) {
                        this.cancelPromiseCallback(packet.replyTo);
                        handled = true;
                    }

                }

                //Try and handle this packet as callback message
                if (!handled && packet.replyTo && this.registeredCallbacks[packet.replyTo]) {

                    var registeredCancel = false;
                    var self = this;
                    var registeredDone = function () {
                        registeredCancel = true;

                        if (self.watchMsgMap[packet.replyTo] && self.watchMsgMap[packet.replyTo].action === "watch") {
                            self.api(self.watchMsgMap[packet.replyTo].dst).unwatch(self.watchMsgMap[packet.replyTo].resource);
                        }
                        self.cancelRegisteredCallback(packet.replyTo);
                    };

                    handled = this.registeredCallbacks[packet.replyTo](packet, registeredDone);
                }
                if (!handled) {
                    //Drop own packets
                    if (packet.src === this.address) {
                        return;
                    }

                    if (packet.dst === "$bus.multicast") {
                        //If not handle-able by the mixin, trigger "busPacket" for someone to handle
                        if (!handleBusPacket(this, packet)) {
                            this.events.trigger("busPacket", packetContext);
                        }
                    } else {
                        //Not bus packet, trigger "receive" for someone to handle
                        this.events.trigger("receive", packetContext);
                    }
                }
            },

            /**
             * Builds the client api calls from the values in client.apiMap
             *
             * @method constructApiFunctions
             */
            constructApiFunctions: function () {
                for (var api in this.apiMap) {
                    var apiObj = this.apiMap[api];
                    var apiFuncName = apiObj.address.replace('.api', '');

                    //prevent overriding client constructed fields, but allow updating of constructed APIs
                    if (!this.hasOwnProperty(apiFuncName) || this.apiMap[api].functionName === apiFuncName) {
                        // wrap this in a function to break the closure
                        // on apiObj.address that would otherwise register
                        // everything for the last api in the list
                        /*jshint loopfunc:true*/
                        (function (self, addr) {
                            self[apiFuncName] =  self.updateApi(addr);
                            self.apiMap[addr] = self.apiMap[addr] || {};
                            self.apiMap[addr].functionName = apiFuncName;
                        })(this, apiObj.address);
                    }
                }
            },

            /**
             * Calls the names.api to gather the /api/* resources to gain knowledge of available api actions of the
             * current bus.
             *
             * @method gatherApiInformation
             * @return {Promise}
             */
            gatherApiInformation: function () {
                var self = this;
                // gather api information
                return this.send({
                    dst: "names.api",
                    action: "get",
                    resource: "/api"
                }).then(function (reply) {
                    if (reply.response === 'ok') {
                        return reply.entity;
                    } else {
                        throw reply.response;
                    }
                }).then(function (apis) {
                    var promiseArray = [];
                    apis.forEach(function (api) {
                        var promise = self.send({
                            dst: "names.api",
                            action: "get",
                            resource: api
                        }).then(function (res) {
                            if (res.response === 'ok') {
                                var name = api.replace('/api/', '');
                                self.apiMap[name] = self.apiMap[name] || {};
                                self.apiMap[name].address = name;
                                self.apiMap[name].actions = res.entity.actions;
                            } else {
                                throw res.response;
                            }
                        });
                        promiseArray.push(promise);
                    });
                    return Promise.all(promiseArray);
                });
            },

            /**
             * Cancel a reply callback registration.
             * @method cancelPromiseCallback
             * @param (String} msgId The packet replyTo ID for which the callback was registered.
             *
             * @return {Boolean} True if the cancel was successful, otherwise false.
             */
            cancelPromiseCallback: function (msgId) {
                var success = false;
                if (msgId) {
                    delete this.promiseCallbacks[msgId];
                    success = true;
                }
                return success;
            },

            /**
             * Cancel a watch callback registration.
             *
             * @method cancelRegisteredCallback
             * @param (String} msgId The packet replyTo ID for which the callback was registered.
             *
             * @return {Boolean} True if the cancel was successful, otherwise false.
             */
            cancelRegisteredCallback: function (msgId) {
                var success = false;
                if (msgId) {
                    delete this.registeredCallbacks[msgId];
                    delete this.watchMsgMap[msgId];
                    success = true;
                }
                return success;
            },

            /**
             * Registers callbacks
             *
             * @method on
             * @param {String} event The event to call the callback on.
             * @param {Function} callback The function to be called.
             *
             */
            on: function (event, callback) {
                if (event === "connected" && this.isConnected()) {
                    callback(this);
                    return;
                }
                return this.events.on.apply(this.events, arguments);
            },

            /**
             * De-registers callbacks
             *
             * @method off
             * @param {String} event The event to call the callback on.
             * @param {Function} callback The function to be called.
             *
             */
            off: function (event, callback) {
                return this.events.off.apply(this.events, arguments);
            },

            /**
             * Handles intent invocation packets. Communicates back with the intents.api to operate the in flight
             * intent
             * state machine.
             *
             * @method intentInvocationHandling
             * @param resource {String} The resource of the packet that sent the intent invocation
             * @param inFlightIntent {Object} The in flight intent, used internally to operate the in flight intent
             *     state machine
             * @param callback {Function} The intent handler's callback function
             * @return {Promise}
             */
            intentInvocationHandling: function (packet, inFlightIntent, callback) {
                var self = this;
                var res;
                var promiseChain;
                callback = callback || function () {};
                inFlightIntent = inFlightIntent || {};
                if (inFlightIntent.entity) {
                    promiseChain = Promise.resolve(inFlightIntent);
                } else {
                    promiseChain = self.send({
                        dst: "intents.api",
                        action: "get",
                        resource: inFlightIntent.resource
                    });
                }
                return promiseChain.then(function (inFlightIntentRes) {
                    res = inFlightIntentRes;
                    if (res.entity.invokePacket.msgId === packet.msgId) {
                        callback(packet);
                        return Promise.reject("ownInvoke");
                    }
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            handler: {
                                resource: packet.resource,
                                address: self.address
                            },
                            me: Date.now(),
                            state: "running"
                        }
                    });
                }).then(function () {
                    // Run the intent handler. Wrapped in a promise chain in case the callback itself is async.
                    return callback(res.entity, inFlightIntent);
                }).then(function (result) {
                    // Allow the callback to override the intent state (usefull for preventing intent resolution if
                    // chained operations are performed.
                    if (result && result.intentIncomplete) {
                        return Promise.resolve();
                    }
                    // Respond to the inflight resource
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            reply: {
                                'entity': result || {},
                                'contentType': res.entity.intent.type
                            },
                            state: "complete"
                        }
                    });
                })['catch'](function (e) {
                    if (e === "ownInvoke") {
                        //Filter out own invocations (this occurs when watching an invoke state).
                        return;
                    }

                    console.error("Error in handling intent: ", e, " -- Reporting error on in-flight intent node:",
                        res.resource);
                    // Respond to the inflight resource
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            reply: {
                                'entity': e.toString() || {},
                                'contentType': "text/plain"
                            },
                            state: "error"
                        }
                    });
                });
            },

            /**
             * Calls the specific api wrapper given an api name specified.
             * If the wrapper does not exist it is created.
             *
             * @method api
             * @param apiName {String} The name of the api.
             * @return {Function} returns the wrapper call for the given api.
             */
            api: function (apiName) {
                return this.wrapperMap[apiName] || this.updateApi(apiName);
            },
            /**
             * Updates the wrapper map for api use. Whenever functionality is added or removed from the apiMap the
             * updateApi must be called to reflect said changes on the wrapper map.
             *
             * @method updateApi
             * @param apiName {String} The name of the api
             * @return {Function} returns the wrapper call for the given api.
             */
            updateApi: function (apiName) {

                // wrapper is a function because pre 1.2.0 the syntax expected
                // api's to be accessed through a function. The function returns
                // itself so to support legacy but properties are on wrapper so
                // functional access is not neccessary. -KJK
                var wrapper = function() {
                    return wrapper;
                };

                this.wrapperMap[apiName] = wrapper;
                if (this.apiMap.hasOwnProperty(apiName)) {
                    var api = this.apiMap[apiName];
                    var apiWrapper = this;

                    /**
                     *  All message formatting calls sits inside the API wrapper's messageBuilder object. These
                     *  calls will return a formatted message ready to be sent.
                     *  (e.g: data().messageBuilder.set)
                     */
                    wrapper.messageBuilder = {};
                    wrapper.messageBuilder.bulkSend = function(messages, otherCallback) {
                        var packet = {
                            'dst': api.address,
                            'action': "bulkSend",
                            'resource': "/",
                            'entity': messages
                        };

                        return {
                            'packet': packet,
                            'callback': otherCallback
                        };
                    };

                    /**
                     * All function calls are on the root level of the API wrapper. These calls will format messages and
                     * then send them to the router.
                     * (e.g: data().set)
                     */
                    wrapper.bulkSend = (function(bulkMessageBuilder, client) {
                        return function (messages) {
                            var message = bulkMessageBuilder(messages);
                            return client.send(message.packet, message.callback);
                        };
                    })(wrapper.messageBuilder.bulkSend, this);

                    /**
                     * Iterate over all mapped function calls and augment their message formatter and function call.
                     */
                    for (var i = 0; i < api.actions.length; ++i) {
                        var action = api.actions[i];
                        wrapper.messageBuilder[action] = messageBuilderAugment(api.address, action, this);
                        wrapper[action] = augment(wrapper.messageBuilder[action], this);
                    }

                    /**
                     * Creates a reference to the api node, but auto applies the given resource
                     * as well as applies default packet properties.
                     *
                     * @class Reference
                     * @constructor
                     * @param  {String} resource      The resource path to reference
                     * @param  {Object} defaultPacket Default values for the packets sent to the node
                     * @return {Object}               an augmented reference to the api resource.
                     */
                    wrapper.Reference = function(resource, defaultPacket) {

                        this.resource = resource;
                        this.apiWrapper = apiWrapper;
                        this.defaultPacket = {
                            resource: this.resource
                        };
                        this.messageBuilder = {};
                        for (var j in defaultPacket) {
                            this.defaultPacket[j] = defaultPacket[j];
                        }

                        for (var i = 0; i < api.actions.length; ++i) {
                            var action = api.actions[i];
                            this.messageBuilder[action] = messageBuilderRefAugment(api.address, action, this.defaultPacket, this.apiWrapper);
                            this[action] = augment(this.messageBuilder[action], this);
                        }
                    };

                    /**
                     * A modified send for References. Returns only the direct
                     * entity of a response as apposed to the whole packet by
                     * default
                     * @method send
                     * @param  {Object|Function}   fields   packet properties for transmit
                     * @param  {Function} callback          callback function for watched functionality
                     * @return {Promise}    The promise to be resolved
                     */
                    wrapper.Reference.prototype.send = function (fields, callback) {
                        var self = this;
                        var entityPromiseRes, entityPromiseRej;
                        var promise = new Promise(function(res,rej) {
                            entityPromiseRes = res;
                            entityPromiseRej = rej;
                        });
                        var entityCallback = function(response,done) {
                            var value = (self.defaultPacket.fullCallback ) ?
                                    response : response.entity;

                            // If this is an intent invocation, collecting doesn't apply
                            // If its an update about an intent invocation trigger change
                            // If not collecting, only trigger on value change
                            if (response.response !== "complete" && response.response !== "update" && !response.invokePacket &&
                                !self.defaultPacket.collect) {

                                if (response.entity.newValue !== response.entity.oldValue){
                                    return callback(value, done, response);
                                }
                            } else {
                                return callback(value, done, response);
                            }
                        };

                        this.apiWrapper.send(fields, entityCallback, entityPromiseRes, entityPromiseRej);

                        return promise.then(function(response) {
                            return (self.defaultPacket.fullResponse) ? response : response.entity;
                        }, function(err) {
                            throw (self.defaultPacket.fullResponse) ? err : err.response;
                        });
                    };

                    /**
                     * Updates the default parameters of a Reference. Can be used
                     * to reassign defaults of a Reference
                     * @method updateDefaults
                     * @param  {Object} config configuration properties of Reference to update
                     * @return {Object}        The Reference
                     */
                    wrapper.Reference.prototype.updateDefaults = function(config) {
                        if (typeof config === "object") {
                            for (var i in config) {
                                this.defaultPacket[i] = config[i];
                            }
                        }
                        return this;
                    };
                }

                wrapper.apiName = apiName;
                return wrapper;
            },

            /**
             * Applies necessary properties to the packet to be transmitted through the router.
             *
             * @method fixPacket
             * @param {Object} fields
             * @return {Object}
             */
            fixPacket: function (fields) {
                var packet = {
                    ver: 1,
                    src: fields.src || this.address,
                    msgId: fields.msgId || "p:" + this.msgIdSequence++,
                    time: fields.time || new Date().getTime()
                };

                for (var k in fields) {
                    packet[k] = util.ifUndef(fields[k], packet[k]);
                }

                if (packet.src === "$nobody") {
                    packet.src = this.address;
                }

                return packet;
            },

            /**
             * Registers callbacks for API request callbacks and promises.
             *
             * @method registerResponses
             * @property {Object} packet
             * @property {Function} callback
             * @property {Function} promiseRes
             * @property {Function} promiseRej
             */
            registerResponses: function (packet, callback, promiseRes, promiseRej) {
                var self = this;
                if (callback) {
                    this.registeredCallbacks[packet.msgId] = function (reply, done) {

                        // We've received a message that was a promise response but we've aready handled our promise
                        // response.
                        if (/(ok).*/.test(reply.response) || /(bad|no).*/.test(reply.response)) {

                            // Do nothing and let it get sent to the event handler (this is to filter out registration
                            // of callback responses)
                            return false;
                        } else if (reply.entity && reply.entity.inFlightIntent) {
                            self.intentInvocationHandling(packet, reply.entity.inFlightIntent, callback);
                        } else {

                            // reply passed twice to adhere to
                            // References internal callback signature.
                            callback(reply, done, reply);
                        }
                        return true;
                    };
                }

                //respondOn "all", "error", or no value (default all) will register a promise callback.
                if (packet.respondOn !== "none") {
                    this.promiseCallbacks[packet.msgId] = function (reply, done) {
                        if (reply.src === "intents.api" &&
                            (packet.action === "invoke" && /(ok).*/.test(reply.response)) ||
                            (packet.action === "broadcast" && /(complete).*/.test(reply.response))) {
                            // dont sent the response to the promise
                        } else if (reply.src === "intents.api" && packet.action === "broadcast" && /(pending).*/.test(reply.response)) {
                            //Broadcast request acknowledged and prepares logic ot handle resolving once all runners
                            // finish.
                            if (self.registeredCallbacks[packet.msgId]) {
                                self.registeredCallbacks[packet.msgId].handlers = reply.entity.handlers || [];
                                self.registeredCallbacks[packet.msgId].pRes = promiseRes;
                                self.registeredCallbacks[packet.msgId].reply = reply;
                            }
                            done();
                        } else if (reply.src === "$transport" || /(ok).*/.test(reply.response) || /(complete).*/.test(reply.response)) {
                            done();
                            promiseRes(reply);
                        } else if (/(bad|no).*/.test(reply.response)) {
                            done();
                            promiseRej(reply);
                        } else {
                            // it was not a promise callback
                        }
                    };
                }

                if (packet.action === "watch") {
                    this.watchMsgMap[packet.msgId] = packet;
                } else if (packet.action === "unwatch" && packet.replyTo) {
                    this.cancelRegisteredCallback(packet.replyTo);
                }

                if (packet.action === "bulkSend") {
                    packet.entity.forEach(function (message) {
                        self.registerResponses(message.packet, message.callback, message.res, message.rej);
                    });
                }
            },
            /**
             * Sends a packet through the IWC.
             * Will call the participants sendImpl function.
             *
             * @method send
             * @param {Object} fields properties of the send packet..
             * @param {Function} callback The Callback for any replies. The callback will be persisted if it returns a
             *     truth-like
             * @param {Function} preexistingPromiseRes If this send already has a promise resolve registration, use it
             *     rather than make a new one.
             * @param {Function} preexistingPromiseRej If this send already has a promise reject registration, use it
             *     rather than make a new one. value, canceled if it returns a false-like value.
             */
            send: function (fields, callback, preexistingPromiseRes, preexistingPromiseRej) {
                if (this.sendingBlocked) {
                    return Promise.resolve({response: "dropped"});
                }
                var promiseRes = preexistingPromiseRes;
                var promiseRej = preexistingPromiseRej;
                var promise = new Promise(function (resolve, reject) {

                    if (!promiseRes && !promiseRej) {
                        promiseRes = resolve;
                        promiseRej = reject;
                    }
                });

                if (!(this.isConnected() || fields.dst === "$transport")) {
                    // when send is switched to promises, create the promise first and return it here, as well
                    this.preconnectionQueue.push({
                        'fields': fields,
                        'callback': callback,
                        'promiseRes': promiseRes,
                        'promiseRej': promiseRej
                    });
                    return promise;
                }
                var packet = this.fixPacket(fields);
                this.registerResponses(packet, callback, promiseRes, promiseRej);
                fixBulkSend(packet);
                this.sendImpl(packet);
                this.sentBytes += packet.length;
                this.sentPackets++;

                return promise;
            },

            /**
             * Generic handler for a bus connection to handle any queued messages & launch data after its connected.
             * @method afterConnected
             * @return {Promise}
             */
            afterConnected: function () {
                var self = this;
                // dump any queued sends, trigger that we are fully connected
                self.preconnectionQueue.forEach(function (p) {
                    self.send(p.fields, p.callback, p.promiseRes, p.promiseRej);
                });
                self.preconnectionQueue = [];
                if (!self.launchParams.inFlightIntent || self.internal) {
                    self.events.trigger("connected");
                    return Promise.resolve();
                }

                // fetch the inFlightIntent
                return self.intents().get(self.launchParams.inFlightIntent).then(function (response) {
                    // If there is an inflight intent that has not already been handled (i.e. page refresh driving to
                    // here)
                    if (response && response.entity && response.entity.intent) {
                        var launchParams = response.entity.entity || {};
                        if (response.response === 'ok') {
                            for (var k in launchParams) {
                                self.launchParams[k] = launchParams[k];
                            }
                        }
                        self.intents().set(self.launchParams.inFlightIntent, {
                            entity: {
                                state: "complete"
                            }
                        });

                        if (self.launchParams.launchData && self.launchParams.launchData.inFlightIntent) {
                            self.launchedIntents.push(self.launchParams.launchData.inFlightIntent);
                        }
                    }
                    self.events.trigger("connected");
                })['catch'](function (e) {
                    console.error(self.launchParams.inFlightIntent, " not handled, reason: ", e);
                    self.events.trigger("connected");
                });
            }

        };
    };
//---------------------------------------------------------
// Private Methods
//---------------------------------------------------------
    /**
     * Augmentation for Intents Api register. Automatically invokes a registration if the invoke was passed
     * into the application opening.
     * @method intentRegisterAugment
     * @private
     * @static
     * @param client
     * @param message
     */
    var intentRegisterAugment = function (client, message) {
        for (var i in client.launchedIntents) {
            var loadedResource = '/' + client.launchedIntents[i].entity.intent.type + '/' + client.launchedIntents[i].entity.intent.action;
            if (message.packet.resource === loadedResource) {
                client.intentInvocationHandling(message.packet, client.launchedIntents[i], message.callback);
                delete client.launchedIntents[i];
            }
        }
    };


    /**
     * Augmentation for Intents Api invoke. Wraps callback to remove the callback when reaching
     * error/complete state.
     * @method intentRegisterAugment
     * @private
     * @static
     * @param client
     * @param message
     */
    var intentInvokeAugment = function (message) {
        if (message.callback) {
            var wrappedCallback = message.callback;
            // Wrap the callback to make sure it is removed when the intent state machine stops.
            message.callback = function (reply, done) {
                wrappedCallback(reply, done);
                reply = reply || {};
                reply.entity = reply.entity || {};
                if (reply.entity.state === "error" || reply.entity.state === "complete") {
                    done();
                }
            };
        }
    };

    /**
     * Augmentation for Intents Api broadcast. Compiles the results of all intent handlers and then,
     * returns the responfixese in the promise resolution. Callback acts like invoke callback.
     * @method intentRegisterAugment
     * @private
     * @static
     * @param client
     * @param message
     */
    var intentBroadcastAugment = function (client, message) {
        var broadcastWrappedCallback = message.callback || function () {};
        var registeredCallbacks = client.registeredCallbacks;

        // Wrap the callback to filter out all of the "complete" messages from each handler sent
        // intended for a promise resolution. Also store all results for the promise resolution.
        message.callback = function (reply, done, fullReply) {
            if (!registeredCallbacks[fullReply.replyTo]) {
                return;
            }
            var callback = registeredCallbacks[fullReply.replyTo];
            var handlers = callback.handlers;
            var attemptResolve = function (resource) {
                var handlerIndex = handlers.indexOf(resource);
                if (handlerIndex > -1) {
                    handlers.splice(handlerIndex, 1);
                }
                if (handlers.length === 0) {
                    callback.reply.entity = callback.results;
                    callback.reply.response = "complete";
                    callback.pRes(callback.reply);
                    done();
                }
            };
            if (fullReply.response === "complete") {
                callback.results = callback.results || {};
                callback.results[fullReply.resource] = fullReply.entity;
                attemptResolve(fullReply.resource);

            } else if (fullReply.entity && fullReply.entity.state === "error" && client.registeredCallbacks[fullReply.replyTo]) {
                attemptResolve(fullReply.entity.handler.resource);
            } else {
                broadcastWrappedCallback(fullReply, done);
            }
        };
    };

    /**
     * Augmenters for Intent Api specific actions.
     * @method intentAugment
     * @private
     * @static
     * @param client
     * @param message {Object}
     */
    var intentAugment = function (client, message) {
        var clientRef = client.apiWrapper || client;
        switch (message.packet.action) {
            case "register":
                intentRegisterAugment(clientRef, message);
                break;
            case "invoke":
                intentInvokeAugment(message);
                break;
            case "broadcast":
                intentBroadcastAugment(clientRef, message);
                break;

        }
    };

    /**
     * Function generator. Generates API functions given a messageBuilder function.
     * @method augment
     * @private
     * @static
     * @param messageBuilder
     * @param client
     * @return {Function}
     */
    var augment = function (messageBuilder, client) {
        return function() {
            // Augmentation clarification: If using 1.2.0 references, messageBuilder
            // is generated in messageBuilderRefAugment and expects 2 parameters
            // (1) entity, (2) callback. Follows original messageBuilder in
            // handling callback as first parameter. -KJK
            var message = messageBuilder.apply(this,arguments);


            if (message.packet.dst === "intents.api") {
                intentAugment(client, message);
            }
            return client.send(message.packet, message.callback);
        };
    };



    /**
     * Function generator. Generates API message formatting functions for a client-destination-action
     * pairing. These are generated for bulk sending capabilities, since the message needs to be formatted
     * but not transmitted until desired.
     *
     * @method messageBuilderAugment
     * @private
     * @static
     * @param dst
     * @param action
     * @param client
     * @return {Function}
     */
    var messageBuilderAugment = function (dst, action, client) {
        return function (param1, param2, param3) {
            var callback = param3;
            var fragment = param2;

            if (typeof param2 === "function") {
                callback = param2;
                fragment = {};
            }

            var packet = {
                'dst': dst,
                'action': action,
                'resource': param1,
                'entity': {}
            };

            for (var k in fragment) {
                packet[k] = fragment[k];
            }

            var resolve, reject;
            var sendData = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            sendData.packet = client.fixPacket(packet);
            sendData.callback = callback;
            sendData.res = resolve;
            sendData.rej = reject;
            return sendData;
        };
    };

    /**
     * A factory for generating messages for a given API & Action.
     * @method messageBuilderRefAugment
     * @private
     * @static
     * @param  {String} dst           [description]
     * @param  {String} action        [description]
     * @param  {Object} defaultPacket [description]
     * @param  {Object} client        [description]
     * @return {Function}             Returns a funciton that when called returns formatted packet,callback, and promise resolution calls.
     */
    var messageBuilderRefAugment = function (dst, action, defaultPacket, client) {
        return function(param1, param2) {
            var body = param1;
            var callback = param2;

            // If a fragment isn't supplied argument #2 should be a callback (if supplied)
            if (typeof param1 === "function") {
                callback = param1;
                body = undefined;
            }

            var packet = defaultPacket;
            packet.dst = dst;
            packet.action = action;
            packet.entity = body;

            var resolve, reject;
            var sendData = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            sendData.packet = client.fixPacket(packet);
            sendData.callback = callback;
            sendData.res = resolve;
            sendData.rej = reject;
            return sendData;
        };
    };

    /**
     * Handles packets received with a destination of "$bus.multicast".
     * If the packet action isn't handled, the function will return falsy.
     *
     * @method handleBusPacket
     * @private
     * @static
     * @param {ozpIwc.api.base.Api} apiBase
     * @param {Object} packetContext
     * @return {*}
     */
    var handleBusPacket = function (mixer, packet) {
        switch (packet.action) {
            case "connect":
                mixer.events.trigger("addressConnects", packet.entity.address, packet);
                return true;
            case "disconnect":
                mixer.events.trigger("addressDisconnects", packet.entity.address, packet);
                return true;
        }
    };


    /**
     * A fix for bulkSend functionality, Filters out promise functionality
     * so structured clones apply to bulkSends.
     * @method fixBulkSend
     * @private
     * @static     *
     * @param  {Object} packet
     * @return {Object}        a reference to the packet.
     */
    var fixBulkSend = function(packet) {
        if (packet.action === "bulkSend") {
            packet.entity = packet.entity.map(function(message) {
                return {
                    packet: message.packet
                };
            });
        }
        return packet;
    };

    return ApiPromiseMixin;
}(ozpIwc.apiMap, ozpIwc.log, ozpIwc.util));
