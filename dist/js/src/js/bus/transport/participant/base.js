var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.Base = (function (log, policyAuth, transport, util) {

    /**
     * @class Base
     * @namespace ozpIwc.transport.participant
     * @constructor
     * @param {Object} [config]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} config.authorization The authorization component for this module.
     * @mixes ozpIwc.security.Actor
     * @property {String} address The assigned address to this address.
     */
    var Base = function (config) {
        config = config || {};

        if (!config.authorization) {
            throw Error("Participant must be configured with an authorization module");
        }
        /**
         * An events module for the participant.
         * @property events
         * @type Event
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        /**
         * A key value store of the security attributes assigned to the participant.
         * @property permissions
         * @type ozpIwc.policyAuth.SecurityAttribute
         * @default {}
         */
        this.permissions = new policyAuth.elements.SecurityAttribute();

        /**
         * The message id assigned to the next packet if a packet msgId is not specified.
         * @property msgId
         * @type {Number}
         */
        this.msgId = 0;

        /**
         * A Metrics meter for packets sent from the participant.
         * @property sentPacketsmeter
         * @type ozpIwc.metric.types.Meter
         */

        /**
         * A Metrics meter for packets received by the participant.
         * @property receivedPacketMeter
         * @type ozpIwc.metric.types.Meter
         */

        /**
         * A Metrics meter for packets sent to the participant that did not pass authorization.
         * @property forbiddenPacketMeter
         * @type ozpIwc.metric.types.Meter
         */

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * The type of the participant.
         * @property participantType
         * @type String
         */
        this.participantType = this.constructor.name;

        /**
         * Content type for the Participant's heartbeat status packets.
         * @property heartBeatContentType
         * @type String
         * @default "application/vnd.ozp-iwc-address-v1+json"
         */
        this.heartBeatContentType = "application/vnd.ozp-iwc-address-v1+json";

        /**
         * The heartbeat status packet of the participant.
         * @property heartBeatStatus
         * @type Object
         */
        this.heartBeatStatus = {
            name: this.name,
            type: this.participantType || this.constructor.name
        };

        this.replyCallbacks = {};

        // Handle leaving Event Channel
        var self = this;
        util.addEventListener("beforeunload", function () {
            // Unload events can't use setTimeout's. Therefore make all sending happen with normal execution
            self.send = function (originalPacket, callback) {
                var packet = this.fixPacket(originalPacket);
                if (callback) {
                    self.replyCallbacks[packet.msgId] = callback;
                }
                transport.participant.Base.prototype.send.call(self, packet);

                return packet;
            };
            self.leaveEventChannel();
        });
    };

    /**
     * An AsyncAction to verify if this participant can receive the given packetContext
     * @method verifyReceiveAs
     * @param  {ozpIwc.packet.Transport} packetContext
     * @return {ozpIwc.util.AsyncAction} calls success if can receive.
     */
    Base.prototype.verifyReceiveAs = function (packetContext) {
        var receiveRequest = {
            'subject': this.permissions.getAll(),
            'resource': {'ozp:iwc:receiveAs': packetContext.packet.dst},
            'action': {'ozp:iwc:action': 'receiveAs'},
            'policies': this.authorization.policySets.receiveAsSet
        };

        return this.authorization.isPermitted(receiveRequest);
    };

    /**
     * An AsyncAction to format a received packetContext's permission.
     * @method formatRequest
     * @param  {ozpIwc.packet.Transport} packetContext
     * @return {ozpIwc.util.AsyncAction} calls success with the formated permissions.
     */
    Base.prototype.formatRequest = function(packetContext){
        return policyAuth.points.utils.formatCategory(
            packetContext.packet.permissions, this.authorization.pip);
    };

    /**
     * An AsyncAction to verify if this participant can read the given packetContext
     * @method verifyRead
     * @param  {ozpIwc.packet.Transport} packetContext
     * @return {ozpIwc.util.AsyncAction} calls success if can read.
     */
    Base.prototype.verifyRead = function (permissions) {
        var request = {
            'subject': this.permissions.getAll(),
            'resource': permissions || {},
            'action': {'ozp:iwc:action': 'read'},
            'policies': this.authorization.policySets.readSet
        };

        return this.authorization.isPermitted(request);
    };

    /**
     * An AsyncAction to verify if this participant can send the given packet
     * @method verifySendAs
     * @param  {ozpIwc.packet.Base} packet
     * @return {ozpIwc.util.AsyncAction} calls success if can send.
     */
    Base.prototype.verifySendAs = function (packet) {
        var request = {
            'subject': this.permissions.getAll(),
            'resource': {'ozp:iwc:sendAs': packet.src},
            'action': {'ozp:iwc:action': 'sendAs'},
            'policies': this.authorization.policySets.sendAsSet
        };
        return this.authorization.isPermitted(request);
    };

    /**
     * Mark the given received packetContext in the metrics.
     * @method markReceivePacket
     * @param  {ozpIwc.packet.Transport} packetContext
     */
    Base.prototype.markReceivePacket = function(packetContext){
        if (this.metrics) {
            this.receivedPacketsMeter.mark();
            if (packetContext.packet.time) {
                this.latencyInTimer.mark(util.now() - packetContext.packet.time);
            }
        }
    };

    /**
     * Mark the given sent packet in the metrics.
     * @method markSendPacket
     * @param  {ozpIwc.packet.Base} packet
     */
    Base.prototype.markSendPacket = function(packet){
        if (this.metrics) {
            this.sentPacketsMeter.mark();
            if (packet.time) {
                this.latencyOutTimer.mark(util.now() - packet.time);
            }
        }
    };

    /**
     * Processes packets sent from the router to the participant. If a packet does not pass authorization it is marked
     * forbidden.
     *
     * @method receiveFromRouter
     * @param {ozpIwc.PacketContext} packetContext
     * @return {Boolean} true if this packet could have additional recipients
     */
    Base.prototype.receiveFromRouter = function (packetContext) {
        var self = this;

        function onError(err) {
            if (self.metrics) {
                self.forbiddenPacketsMeter.mark();
                /** @todo do we send a "denied" message to the destination?  drop?  who knows? */
                self.metrics.counter("transport.packets.forbidden").inc();
            }
            log.error("failure", err);
        }

        this.verifyReceiveAs(packetContext).success(function canReceive () {
            self.formatRequest(packetContext).success(function validatedFormat (permissions) {
                self.verifyRead(permissions).success(function canRead () {
                    self.markReceivePacket(packetContext);
                    self.receiveFromRouterImpl(packetContext);
                }).failure(onError);
            }).failure(onError);
        }).failure(onError);
    };

    /**
     * Overridden by inherited Participants.
     *
     * @override
     * @method receiveFromRouterImple
     * @param packetContext
     * @return {Boolean}
     */
    Base.prototype.receiveFromRouterImpl = function (packetContext) {
        // doesn't really do anything other than return a bool and prevent "unused param" warnings
        return !packetContext;
    };

    /**
     * Connects the participant to a given router.
     *
     * Fires:
     *     - {{#crossLink "ozpIwc.transport.participant.Base/#connectedToRouter:event"}}{{/crossLink}}
     *
     * @method connectToRouter
     * @param {ozpIwc.transport.Router} router The router to connect to
     * @param {String} address The address to assign to the participant.
     */
    Base.prototype.connectToRouter = function (router, address) {
        this.address = address;
        this.router = router;
        this.msgId = 0;
        if (this.name) {
            this.metricRoot = "participants." + this.name + "." + this.address.split(".").reverse().join(".");
        } else {
            this.metricRoot = "participants." + this.address.split(".").reverse().join(".");
        }
        if (this.metrics) {
            this.sentPacketsMeter = this.metrics.meter(this.metricRoot, "sentPackets").unit("packets");
            this.receivedPacketsMeter = this.metrics.meter(this.metricRoot, "receivedPackets").unit("packets");
            this.forbiddenPacketsMeter = this.metrics.meter(this.metricRoot, "forbiddenPackets").unit("packets");
            this.latencyInTimer = this.metrics.timer(this.metricRoot, "latencyIn").unit("packets");
            this.latencyOutTimer = this.metrics.timer(this.metricRoot, "latencyOut").unit("packets");
        }
        this.namesResource = "/address/" + this.address;
        this.heartBeatStatus.address = this.address;
        this.heartBeatStatus.name = this.name;
        this.heartBeatStatus.type = this.participantType || this.constructor.name;

        this.events.trigger("connectedToRouter");
        this.joinEventChannel();
    };

    /**
     * Populates fields relevant to this packet if they aren't already set:
     * src, ver, msgId, and time.
     *
     * @method fixPacket
     * @param {ozpIwc.packet.Transport.packet} packet
     *
     * @return {ozpIwc.packet.Transport}
     */
    Base.prototype.fixPacket = function (packet) {
        // clean up the packet a bit on behalf of the sender
        packet.src = packet.src || this.address;
        packet.ver = packet.ver || 1;

        // if the packet doesn't have a msgId, generate one
        packet.msgId = packet.msgId || this.generateMsgId();

        // might as well be helpful and set the time, too
        packet.time = packet.time || util.now();
        return packet;
    };

    /**
     * Sends a packet to this participants router.  Calls fixPacket
     * before doing so.
     *
     * @method send
     * @param {ozpIwc.packet.Transport.packet} packet
     *
     * @return {ozpIwc.packet.Transport}
     */
    Base.prototype.send = function (packet) {
        var self = this;
        function onError (e) {
            log.error("Participant " + self.address + " failed to send a packet:", e, packet);
        }
        packet = self.fixPacket(packet);

        this.verifySendAs(packet).success(function canSend () {
            self.markSendPacket(packet);
            self.router.send(packet, self);
        }).failure(onError);

        return packet;
    };

    /**
     * Creates a message id for a packet by iterating {{#crossLink
     * "ozpIwc.transport.participant.Base.msgId"}}{{/crossLink}}
     *
     * @method generateMsgId
     * @return {string}
     */
    Base.prototype.generateMsgId = function () {
        return "i:" + this.msgId++;
    };

    /**
     * Sends a heartbeat packet to Participant's router.
     *
     * @method heartbeat
     */
    Base.prototype.heartbeat = function () {
        if (this.router) {
            var entity = this.heartBeatStatus;
            entity.time = util.now();

            return this.fixPacket({
                'dst': "names.api",
                'resource': this.namesResource,
                'action': "set",
                'entity': entity,
                'contentType': this.heartBeatContentType,
                'respondOn': "none"
            });
        }
    };

    /**
     * Adds this participant to the $bus.multicast multicast group.
     *
     * @method joinEventChannel
     * @return {Boolean}
     */
    Base.prototype.joinEventChannel = function () {
        if (this.router) {
            this.router.registerMulticast(this, ["$bus.multicast"]);
            this.send({
                dst: "$bus.multicast",
                action: "connect",
                entity: {
                    address: this.address,
                    participantType: this.participantType
                }
            });
            return true;
        } else {
            return false;
        }
    };

    /**
     * Remove this participant from the $bus.multicast multicast group.
     *
     * @method leaveEventChannel
     */
    Base.prototype.leaveEventChannel = function () {
        if (this.router) {
            this.send({
                dst: "$bus.multicast",
                action: "disconnect",
                entity: {
                    address: this.address,
                    participantType: this.participantType,
                    namesResource: this.namesResource
                }
            });
            //TODO not implemented
            //this.router.unregisterMulticast(this, ["$bus.multicast"]);
            return true;
        } else {
            return false;
        }

    };

    /**
     * Destroys this participant. The router will no longer reference it.
     * @method destroy
     */
    Base.prototype.destroy = function () {
        if (this.router && this.router.participants[this.address]) {
            delete this.router.participants[this.address];
        }
    };

    return Base;
}(ozpIwc.log, ozpIwc.policyAuth, ozpIwc.transport, ozpIwc.util));
