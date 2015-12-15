var ozpIwc = ozpIwc || {};
ozpIwc.network = ozpIwc.network || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.network
 */

ozpIwc.network.Peer = (function () {

    /**
     * The peer handles low-level broadcast communications between multiple browser contexts.
     * Links do the actual work of moving the packet to other browser contexts.  The links
     * call {{#crossLink "ozpIwc.network.Peer/receive:method"}}{{/crossLink}} when they need to deliver a packet to
     * this peer and hook the {{#crossLink "ozpIwc.network.Peer/send:method"}}{{/crossLink}} event in order to send
     * packets.
     * @class Peer
     * @namespace ozpIwc.network
     * @constructor
     * @param {Object} [config]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @uses ozpIwc.util.Event
     */
    var Peer = function (config) {
        config = config || {};

        /**
         * A generated random 4 byte id
         * @property selfId
         * @type String
         * @default {{#crossLink "ozpIwc.util/generateId:method"}}{{/crossLink}}
         */
        this.selfId = ozpIwc.util.generateId();

        this.metricPrefix = "peer." + this.selfId;

        /**
         * @TODO (DOC)
         * @property sequenceCounter
         * @type Number
         * @default 0
         */
        this.sequenceCounter = 0;

        /**
         * A history of packets seen from each peer. Each key is a peer name, each value is an array of the last 50
         * packet ids seen.
         * @property packetsSeen
         * @type Object
         * @default {}
         */
        this.packetsSeen = {};

        /**
         * @property knownPeers
         * @type Object
         * @default {}
         */
        this.knownPeers = {};

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * Eventing module for the Peer.
         * @property events
         * @type ozpIwc.util.Event
         * @default new ozpIwc.util.Event()
         */
        this.events = new ozpIwc.util.Event();
        this.events.mixinOnOff(this);

        var self = this;

        // Shutdown handling
        this.unloadListener = function () {
            self.shutdown();
        };
        ozpIwc.util.addEventListener('beforeunload', this.unloadListener);

    };

    /**
     * The peer has received a packet from other peers.
     * @event #receive
     *
     * @param {ozpIwc.packet.Network} packet
     * @param {String} linkId
     */


    /**
     * A cancelable event that allows listeners to override the forwarding of
     * a given packet to other peers.
     * @event #preSend
     * @extends ozpIwc.util.CancelableEvent
     *
     * @param {ozpIwc.packet.Network} packet
     */

    /**
     * Notifies that a packet is being sent to other peers.  Links should use this
     * event to forward packets to other peers.
     * @event #send
     *
     * @param {ozpIwc.packet.Network} packet
     */

    /**
     * Fires when the peer is being explicitly or implicitly shut down.
     * @event #beforeShutdown
     */

    /**
     * Number of sequence Id's held in an entry of {{#crossLink
     * "ozpIwc.network.Peer/packetsSeen:property"}}{{/crossLink}}
     * @property maxSeqIdPerSource
     * @static
     * @type Number
     * @default 500
     */
    Peer.maxSeqIdPerSource = 500;

    /**
     * Determine if the peer has already seen the packet in question.
     *
     * @method haveSeen
     * @param {ozpIwc.packet.Network} packet
     *
     * @return {Boolean}
     */
    Peer.prototype.haveSeen = function (packet) {
        // don't forward our own packets
        if (packet.srcPeer === this.selfId) {
            if (this.metrics) {
                this.metrics.counter(this.metricPrefix, 'droppedOwnPacket').inc();
            }
            return true;
        }
        var seen = this.packetsSeen[packet.srcPeer];
        if (!seen) {
            seen = this.packetsSeen[packet.srcPeer] = [];
        }

        // abort if we've seen the packet before
        if (seen.indexOf(packet.sequence) >= 0) {
            return true;
        }

        //remove oldest array members when truncate needed
        seen.unshift(packet.sequence);
        if (seen.length >= ozpIwc.network.Peer.maxSeqIdPerSource) {
            seen.length = ozpIwc.network.Peer.maxSeqIdPerSource;
        }
        return false;
    };

    /**
     * Used by routers to broadcast a packet to network.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.network.Peer/#preSend:event"}}{{/crossLink}}
     *   - {{#crossLink "ozpIwc.network.Peer/#send:event"}}{{/crossLink}}
     *
     * @method send
     * @param {ozpIwc.packet.Network} packet
     */
    Peer.prototype.send = function (packet) {
        var networkPacket = {
            srcPeer: this.selfId,
            sequence: this.sequenceCounter++,
            data: packet
        };

        var preSendEvent = new ozpIwc.util.CancelableEvent({'packet': networkPacket});

        this.events.trigger("preSend", preSendEvent);
        if (!preSendEvent.canceled) {
            if (this.metrics) {
                this.metrics.counter(this.metricPrefix, 'sent').inc();
            }
            if (this.metrics && packet.time) {
                this.metrics.timer(this.metricPrefix, 'latencyOut').mark(ozpIwc.util.now() - packet.time);
            }
            this.events.trigger("send", {'packet': networkPacket});
        } else if (this.metrics) {
            this.metrics.counter(this.metricPrefix, 'sendRejected').inc();
        }
    };

    /**
     * Called by the links when a new packet is received.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.network.Peer/#receive:event"}}{{/crossLink}}
     *
     * @method receive
     * @param {String} linkId
     * @param {ozpIwc.packet.Network} packet
     */
    Peer.prototype.receive = function (linkId, packet) {
        // drop it if we've seen it before
        if (this.haveSeen(packet)) {
            if (this.metrics) {
                this.metrics.counter(this.metricPrefix, 'dropped').inc();
            }
            return;
        }
        if (this.metrics) {
            this.metrics.counter(this.metricPrefix, 'received').inc();
        }
        if (this.metrics && packet.data.time) {
            this.metrics.timer(this.metricPrefix, 'latencyIn').mark(ozpIwc.util.now() - packet.data.time);
        }

        this.events.trigger("receive", {'packet': packet, 'linkId': linkId});
    };

    /**
     * Explicitly shuts down the peer.
     *
     * Fires:
     *   - {{#crossLink "ozpIwc.network.Peer/#receive:event"}}{{/crossLink}}
     *
     * @method shutdown
     */
    Peer.prototype.shutdown = function () {
        this.events.trigger("beforeShutdown");
        ozpIwc.util.removeEventListener('beforeunload', this.unloadListener);
    };

    return Peer;
}(ozpIwc));


