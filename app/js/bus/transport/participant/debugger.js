var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
ozpIwc.wiring = ozpIwc.wiring || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant = (function (log, ozpConfig, participant, transport, util, wiring) {

    var debuggerGen = function (Base) {
        /**
         * An abstract Debugger participant. Used by a factory to generate transport specific debuggers.
         *
         * @class Debugger
         * @namespace ozpIwc.transport.participant
         * @constructor
         * @abstract
         *
         */
        var Debugger = util.extend(Base, function (config) {
            Base.apply(this, arguments);
            this.name = "DebuggerParticipant";
            this.router = config.router;
            this.peer = this.router.peer;
            var self = this;
            this.logging = {
                enabled: false,
                watchList: {},
                notifyListeners: function ( event) {
                    for (var i in self.logging.watchList) {
                        debuggerResponse(self, {
                            response: "changed",
                            replyTo: self.logging.watchList[i].msgId,
                            entity: event
                        });
                    }
                }
            };

            this.on("receive",this.handleReceivePacket);
        });

        //----------------------------------------------------------------
        // Private Methods
        //----------------------------------------------------------------
        /**
         * A utility for the debugger to respond to whom sent it a packet.
         * @method debuggerResponse
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.Transport.PacketContext} packet
         */
        var debuggerResponse = function (participant, packet) {
            packet = packet || {};
            packet.src = packet.src || participant.address;
            packet.response = packet.response || "ok";
            packet = participant.fixPacket(packet);
            participant.sendToRecipient(packet);
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: traffic
        //----------------------------------------------------------------
        /**
         * Handler method for $transport packets of resource "traffic".
         * @method handleTrafficPacket
         * @private
         * @static
         * @param participant
         * @param packet
         */
        var handleTrafficPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "start":
                    enableLogging(participant, packet);
                    break;

                case "stop":
                    disableLogging(participant, packet);
                    break;
            }
        };


        //----------------------------------------------------------------
        // dst: $transport, resource: traffic, action: start
        //----------------------------------------------------------------

        /**
         *
         * Starts the debugger participant sending packet logs.
         * @method enableLogging
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var enableLogging = function (participant, packet) {
            participant.logging.watchList[packet.msgId] = packet;

            if (!participant.logging.enabled) {
                participant.logging.enabled = true;
                participant.peer.on("receive", participant.logging.notifyListeners);
                participant.peer.on("send", participant.logging.notifyListeners);
            }

            debuggerResponse(participant, {replyTo: packet.msgId});
        };

        /**
         * Stops the debugger participant from sending packet logs.
         * @method disableLogging
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var disableLogging = function (participant, packet) {
            packet = packet || {};
            packet.entity = packet.entity || {};
            if (packet.entity.msgId && participant.logging.watchList[packet.entity.msgId]) {
                delete participant.logging.watchList[packet.entity.msgId];
            }
            if(participant.logging.enabled && Object.keys(participant.logging.watchList).length === 0){
                participant.logging.enabled = false;
                participant.peer.off("receive", participant.logging.notifyListeners);
                participant.peer.off("send", participant.logging.notifyListeners);
            }

            debuggerResponse(participant, {replyTo: packet.msgId});

        };

        //----------------------------------------------------------------
        // dst: $transport, resource: apis
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "apis"
         * @method handleApiPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleApiPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getendpoints":
                    handleEndpointGather(participant, packet);
                    break;
            }
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: apis, action: getEndpoint
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getEndpoints" on resource "apis"
         * @method handleEndpointGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleEndpointGather = function (participant, packet) {
            // Wait until the initial endpoint gather has resolved to get endpoint paths.
            var promise = wiring.endpointInitPromise || Promise.resolve();
            promise.then(function () {
                var data = [];
                for (var i in wiring.apis) {
                    var api = wiring.apis[i];
                    for (var j in api.endpoints) {
                        var ep = api.endpoints[j];
                        var endpoint = ozpIwc.api.endpoint(ep.link);
                        data.push({
                            'name': api.name,
                            'rel': endpoint.name,
                            'path': endpoint.baseUrl
                        });
                    }
                }
                debuggerResponse(participant, {replyTo: packet.msgId, entity: data});
            });
        };


        //----------------------------------------------------------------
        // dst: $transport, resource: metrics
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "metrics"
         * @method handleMetricPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleMetricPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getall":
                    handleMetricGather(participant, packet);
                    break;
            }
        };
        //----------------------------------------------------------------
        // dst: $transport, resource: metrics, action: getAll
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getAll" on resource "metrics"
         * @method handleEndpointGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleMetricGather = function (participant, packet) {
            var metrics = wiring.metrics.allMetrics();
            for (var i in metrics) {
                metrics[i].value = metrics[i].get();
            }
            debuggerResponse(participant, {replyTo: packet.msgId, entity: metrics});
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: config
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "config"
         * @method handleConfigPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleConfigPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getall":
                    handleConfigGather(participant, packet);
                    break;
            }
        };
        //----------------------------------------------------------------
        // dst: $transport, resource: config, action: getAll
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getAll" on resource "config".
         * Sends a copy of the ozpIwc.config to the client-side debugger.
         * @method handleConfigGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleConfigGather = function (participant, packet) {
            debuggerResponse(participant, {replyTo: packet.msgId, entity: ozpConfig});
        };
        //----------------------------------------------------------------------
        // Public Properties
        //----------------------------------------------------------------------

        /**
         * Handles $transport packets from the participant.
         * @method handleTransportPacket
         * @override
         * @param {Object} packet
         * @param {Event} event
         */
        Debugger.prototype.handleReceivePacket = function (packet, event) {
            if (typeof(packet.resource) !== "string") {
                transport.participant.SharedWorker.prototype.handleTransportPacket.call(this, packet);
                return;
            }

            switch (packet.resource.trim().toLowerCase()) {
                case "metrics":
                    handleMetricPacket(this, packet);
                    break;
                case "traffic":
                    handleTrafficPacket(this, packet);
                    break;
                case "apis":
                    handleApiPacket(this, packet);
                    break;
                case "config":
                    handleConfigPacket(this, packet);
                    break;
                default:
                    break;
            }
        };
        /**
         * Receives a packet on behalf of this participant and forwards it via SharedWorker.
         *
         * @method receiveFromRouterImpl
         * @param {ozpIwc.transport.PacketContext} packetContext
         */
        Debugger.prototype.receiveFromRouterImpl = function (packetContext) {
            // If the source address was the client connected to the participant handle its specific request.
            // Routed through router to apply policies (otherwise would have hijacked on the MessageChannel receive).
            if(packetContext.packet.src === packetContext.packet.dst) {
                this.handleReceivePacket(packetContext.packet);
            } else {
                this.sendToRecipient(packetContext.packet);
            }
        };

        return Debugger;

    };

    participant.SWDebugger = debuggerGen(participant.SharedWorker);
    participant.PMDebugger = debuggerGen(participant.PostMessage);

    return participant;
}(ozpIwc.log,ozpIwc.config, ozpIwc.transport.participant || {}, ozpIwc.transport, ozpIwc.util, ozpIwc.wiring));