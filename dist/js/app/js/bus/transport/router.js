var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.transport
 */

ozpIwc.transport.Router = (function (ozpConfig, log, transport, util) {
    /**
     * @class Router
     * @namespace ozpIwc.transport
     * @constructor
     * @param {Object} [config]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} config.authorization The authorization component for this module.
     * @param {ozpIwc.network.Peer} config.peer
     */

    var Router = function (config) {
        config = config || {};
        if (!config.peer) {
            throw Error("Router must be configured with a peer");
        }

        if (!config.authorization) {
            throw Error("Router must be configured with an authorization module");
        }

        /**
         * @property peer
         * @type ozpIwc.network.Peer
         */
        this.peer = config.peer;

        //this.nobodyAddress="$nobody";
        //this.routerControlAddress='$transport';
        var self = this;

        /**
         * @property selfId
         * @type String
         */
        this.selfId = util.generateId();

        /**
         * A key value store of all participants local to the router.
         * @property participants
         * @type Object
         * @default {}
         */
        this.participants = {};

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        if(this.metrics) {
            this.metrics.gauge("transport.participants").set(function () {
                return Object.keys(self.participants).length;
            });
        }

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * Eventing module for the router.
         * @property events
         * @type ozpIwc.util.Event
         * @default ozpIwc.util.Event
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        // Wire up to the peer
        this.peer.on("receive", function (event) {
            self.receiveFromPeer(event.packet);
        });

        var checkFormat = function (event) {
            var message = event.packet;
            if (message.ver !== 1) {
                event.cancel("badVersion");
            }
            if (!message.src) {
                event.cancel("nullSource");
            }
            if (!message.dst) {
                event.cancel("nullDestination");
            }
            if (event.canceled && self.metrics) {
                self.metrics.counter("transport.packets.invalidFormat").inc();
            }
        };
        this.events.on("preSend", checkFormat);

        if (!config.disableBus) {
            this.participants["$bus.multicast"] = new transport.participant.Multicast({
                authorization: this.authorization,
                name:"$bus.multicast"
            });
        }
        /**
         * @property watchdog
         * @type ozpIwc.transport.participant.RouterWatchdog
         */
        this.watchdog = new transport.participant.RouterWatchdog({
            authorization: config.authorization,
            router: this,
            heartbeatFrequency: config.heartbeatFrequency || ozpConfig.heartBeatFrequency,
            autoConnect: false
        });
        this.registerParticipant(this.watchdog);
        this.recursionDepth = 0;
        if(this.metrics) {
            this.metrics.gauge('transport.router.participants').set(function () {
                return self.getParticipantCount();
            });
        }
    };

    /**
     * Gets the count of participants who have registered with the router.
     * @method getParticipantCount
     *
     * @return {Number} the number of registered participants
     */
    Router.prototype.getParticipantCount = function () {
        if (!this.participants || !Object.keys(this.participants)) {
            return 0;
        }
        return Object.keys(this.participants).length;

    };

    /**
     * @method shutdown
     */
    Router.prototype.shutdown = function () {
        this.watchdog.shutdown();
    };

    /**
     * Allows a listener to add a new participant.
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/preRegisterParticipant:event"}}{{/crossLink}}
     *
     * @method registerParticipant
     * @param {Object} participant the participant object that contains a send() function.
     * @param {Object} packet The handshake requesting registration.
     *
     * @return {String} returns participant id
     */
    Router.prototype.registerParticipant = function (participant, packet) {
        packet = packet || {};
        var address;
        do {
            address = util.generateId() + "." + this.selfId;
        } while (this.participants.hasOwnProperty(address));

        var registerEvent = new util.CancelableEvent({
            'packet': packet,
            'registration': packet.entity,
            'participant': participant
        });
        this.events.trigger("preRegisterParticipant", registerEvent);

        if (registerEvent.canceled) {
            // someone vetoed this participant
            log.info("registeredParticipant[DENIED] origin:" + participant.origin +
                " because " + registerEvent.cancelReason);
            return null;
        }

        this.participants[address] = participant;
        participant.connectToRouter(this, address);
        this.send(participant.heartbeat(), participant);
        var registeredEvent = new util.CancelableEvent({
            'packet': packet,
            'participant': participant
        });
        this.events.trigger("registeredParticipant", registeredEvent);

        //log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
        return address;
    };

    /**
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/preDeliver:event"}}{{/crossLink}}
     *
     * @method deliverLocal
     * @param {ozpIwc.packet.Transport} packet
     * @param {ozpIwc.transport.participant.Base} sendingParticipant
     */
    Router.prototype.deliverLocal = function (packet, sendingParticipant) {
        if (!packet) {
            throw "Cannot deliver a null packet!";
        }
        var localParticipant = this.participants[packet.dst];
        if (!localParticipant) {
            return;
        }
        this.recursionDepth++;
        if (this.recursionDepth > 10) {
            console.log("Recursing more than 10 levels deep on ", packet);
        }
        try {
            var packetContext = new transport.PacketContext({
                'packet': packet,
                'router': this,
                'srcParticipant': sendingParticipant,
                'dstParticipant': localParticipant
            });

            var preDeliverEvent = new util.CancelableEvent({
                'packet': packet,
                'dstParticipant': localParticipant,
                'srcParticipant': sendingParticipant
            });

            if (this.events.trigger("preDeliver", preDeliverEvent).canceled) {
                if(this.metrics) {
                    this.metrics.counter("transport.packets.rejected").inc();
                }
                return;
            }
            if(this.metrics) {
                this.metrics.counter("transport.packets.delivered").inc();
            }
            localParticipant.receiveFromRouter(packetContext);
        } finally {
            this.recursionDepth--;
        }
    };


    /**
     * Registers a participant for a multicast group
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/registerMulticast:event"}}{{/crossLink}}
     *
     * @method registerMulticast
     * @param {ozpIwc.transport.participant.Base} participant
     * @param {String[]} multicastGroups
     */
    Router.prototype.registerMulticast = function (participant, multicastGroups) {
        var self = this;
        multicastGroups.forEach(function (groupName) {
            var g = self.participants[groupName];
            if (!g) {
                g = self.participants[groupName] = new transport.participant.Multicast({
                    name: groupName,
                    authorization: self.authorization
                });
            }
            g.addMember(participant);
            if (participant.address) {
                var registeredEvent = new util.CancelableEvent({
                    'entity': {'group': groupName, 'address': participant.address}
                });
                participant.permissions.pushIfNotExist('ozp:iwc:sendAs', groupName);
                participant.permissions.pushIfNotExist('ozp:iwc:receiveAs', groupName);

                self.events.trigger("registeredMulticast", registeredEvent);
            } else {
                log.info("no address for " + participant.participantType + " " + participant.name + "with address " +
                    participant.address + " for group " + groupName);
            }
            //log.log("registered " + participant.participantType + " " + participant.name + "with address " +
            // participant.address + " for group " + groupName);
        });
        return multicastGroups;
    };

    /**
     * Used by participant listeners to route a message to other participants.
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/preSend:event"}}{{/crossLink}},
     *        {{#crossLink "ozpIwc.transport.Router/send:event"}}{{/crossLink}}
     *
     * @method send
     * @param {ozpIwc.packet.Transport} packet The packet to route.
     * @param {ozpIwc.transport.participant.Base} sendingParticipant Information about the participant that is
     *     attempting to send the packet.
     */
    Router.prototype.send = function (packet, sendingParticipant) {

        var preSendEvent = new util.CancelableEvent({
            'packet': packet,
            'participant': sendingParticipant
        });
        this.events.trigger("preSend", preSendEvent);

        if (preSendEvent.canceled) {
            if(this.metrics) {
                this.metrics.counter("transport.packets.sendCanceled");
            }
            return;
        }
        if(this.metrics) {
            this.metrics.counter("transport.packets.sent").inc();
        }
        this.deliverLocal(packet, sendingParticipant);
        this.events.trigger("send", {'packet': packet});
        this.peer.send(packet);
    };

    /**
     * Receive a packet from the peer.
     *
     * **Emits**: {{#crossLink "ozpIwc.transport.Router/prePeerReceive:event"}}{{/crossLink}}
     *
     * @param packet {ozpIwc.packet.Transport} the packet to receive
     */
    Router.prototype.receiveFromPeer = function (packet) {
        var now = Date.now();
        if(this.metrics) {
            this.metrics.counter("transport.packets.receivedFromPeer").inc();
            this.metrics.histogram("transport.packets.latency").mark(now - packet.data.time, now);
        }

        var peerReceiveEvent = new util.CancelableEvent({
            'packet': packet.data,
            'rawPacket': packet
        });
        this.events.trigger("prePeerReceive", peerReceiveEvent);

        if (!peerReceiveEvent.canceled) {
            this.deliverLocal(packet.data);
        }
    };

    return Router;
    /**
     * @event preRegisterParticipant
     * @param {ozpIwc.packet.Transport} [packet] The packet to be delivered
     * @param {object} registration Information provided by the participant about it's registration
     * @param {ozpIwc.transport.participant.Base} participant The participant that will receive the packet
     */

    /**
     * @event preSend
     * @param {ozpIwc.packet.Transport} packet The packet to be sent
     * @param {ozpIwc.transport.participant.Base} participant The participant that sent the packet
     */

    /**
     * @event preDeliver
     * @param {ozpIwc.packet.Transport} packet The packet to be delivered
     * @param {ozpIwc.transport.participant.Base} participant The participant that will receive the packet
     */

    /**
     * @event send
     * @param {ozpIwc.packet.Transport} packet The packet to be delivered
     */

    /**
     * @event prePeerReceive
     * @param {ozpIwc.packet.Transport} packet The packet to be delivered
     * @param {ozpIwc.packet.Network} rawPacket
     */
}(ozpIwc.config, ozpIwc.log, ozpIwc.transport, ozpIwc.util));

