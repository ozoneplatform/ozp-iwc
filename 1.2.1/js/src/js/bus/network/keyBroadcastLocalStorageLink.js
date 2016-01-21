var ozpIwc = ozpIwc || {};
ozpIwc.network = ozpIwc.network || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.network
 */

ozpIwc.network.KeyBroadcastLocalStorageLink = (function (log, util) {
    /**
     * <p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of
     * the localStorageLink that bypasses most of the garbage collection issues.
     *
     * <p> When a packet is sent, this link turns it to a string, creates a key with that value, and
     * immediately deletes it.  This still sends the storage event containing the packet as the key.
     * This completely eliminates the need to garbage collect the localstorage space, with the associated
     * mutex contention and full-buffer issues.
     *
     * @todo Compress the key
     *
     * @class KeyBroadcastLocalStorageLink
     * @namespace ozpIwc.network
     * @constructor
     *
     * @param {Object} [config] Configuration for this link
     * @param {ozpIwc.network.Peer} [config.peer=ozpIwc.defaultPeer] The peer to connect to.
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {String} [config.prefix='ozpIwc'] Namespace for communicating, must be the same for all peers on the same
     *     network.
     * @param {String} [config.selfId] Unique name within the peer network.  Defaults to the peer id.
     * @param {Number} [config.maxRetries] Number of times packet transmission will retry if failed. Defaults to 6.
     * @param {Number} [config.queueSize] Number of packets allowed to be queued at one time. Defaults to 1024.
     * @param {Number} [config.fragmentSize] Size in bytes of which any TransportPacket exceeds will be sent in
     *     FragmentPackets.
     * @param {Number} [config.fragmentTime] Time in milliseconds after a fragment is received and additional expected
     * fragments are not received that the message is dropped.
     */
    var Link = function (config) {
        config = config || {};
        if (!config.peer) {
            throw Error("KeyBroadcastLocalStorageLink must be configured with a peer");
        }

        /**
         * Namespace for communicating, must be the same for all peers on the same network.
         * @property prefix
         * @type String
         * @default "ozpIwc"
         */
        this.prefix = config.prefix || 'ozpIwc';

        /**
         * The peer this link will connect to.
         * @property peer
         * @type ozpIwc.network.Peer
         */
        this.peer = config.peer;

        /**
         * Unique name within the peer network.  Defaults to the peer id.
         * @property selfId
         * @type String
         * @default ozpIwc.network.Peer.selfId
         */
        this.selfId = config.selfId || this.peer.selfId;


        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        if (this.metrics) {
            this.metricsPrefix = "keyBroadcastLocalStorageLink." + this.selfId;
            this.droppedFragmentsCounter = this.metrics.counter(this.metricsPrefix, 'fragmentsDropped');
            this.fragmentsReceivedCounter = this.metrics.counter(this.metricsPrefix, 'fragmentsReceived');

            this.packetsSentCounter = this.metrics.counter(this.metricsPrefix, 'packetsSent');
            this.packetsReceivedCounter = this.metrics.counter(this.metricsPrefix, 'packetsReceived');
            this.packetParseErrorCounter = this.metrics.counter(this.metricsPrefix, 'packetsParseError');
            this.packetsFailedCounter = this.metrics.counter(this.metricsPrefix, 'packetsFailed');

            this.latencyInTimer = this.metrics.timer(this.metricsPrefix, 'latencyIn');
            this.latencyOutTimer = this.metrics.timer(this.metricsPrefix, 'latencyOut');
        }
        /**
         * Milliseconds to wait before deleting this link's keys
         * @todo UNUSUED
         * @property myKeysTimeout
         * @type Number
         * @default 5000
         */
        this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds

        /**
         * Milliseconds to wait before deleting other link's keys
         * @todo UNUSUED
         * @property otherKeysTimeout
         * @type Number
         * @default 120000
         */
        this.otherKeysTimeout = config.otherKeysTimeout || 2 * 60000; // 2 minutes


        /**
         * The maximum number of retries the link will take to send a package. A timeout of
         * max(1, 2^( <retry count> -1) - 1) milliseconds occurs between send attempts.
         * @property maxRetries
         * @type Number
         * @default 6
         */
        this.maxRetries = config.maxRetries || 6;

        /**
         * Maximum number of packets that can be in the send queue at any given time.
         * @property queueSize
         * @type Number
         * @default 1024
         */
        this.queueSize = config.queueSize || 1024;

        /**
         * A queue for outgoing packets. If this queue is full further packets will not be added.
         * @property sendQueue
         * @type Array[]
         * @default []
         */
        this.sendQueue = this.sendQueue || [];

        /**
         * An array of temporarily held received packet fragments indexed by their message key.
         * @type Array[]
         * @default []
         */
        this.fragments = this.fragments || [];

        /**
         * Minimum size in bytes that a packet will broken into fragments.
         * @property fragmentSize
         * @type Number
         * @default 1310720
         */
        this.fragmentSize = config.fragmentSize || (5 * 1024 * 1024) / 2 / 2; //50% of 5mb, divide by 2 for utf-16
                                                                              // characters

        /**
         * The amount of time allotted to the Link to wait between expected fragment packets. If an expected fragment
         * is not received within this timeout the packet is dropped.
         * @property fragmentTimeout
         * @type Number
         * @default 1000
         */
        this.fragmentTimeout = config.fragmentTimeout || 1000; // 1 second

        //Add fragmenting capabilities
        String.prototype.chunk = function (size) {
            var res = [];
            for (var i = 0; i < this.length; i += size) {
                res.push(this.slice(i, i + size));
            }
            return res;
        };

        // Hook into the system
        var self = this;
        var packet;
        var receiveStorageEvent = function (event) {
            if (event.key !== util.localStorageKey) {
                return;
            }
            if (event.newValue) {
                try {
                    packet = JSON.parse(event.newValue);
                } catch (e) {
                    log.error("Parse error on " + event.newValue);
                    if (self.metrics) {
                        self.packetParseErrorCounter.inc();
                    }
                    return;
                }
                if (packet.data.fragment) {
                    self.handleFragment(packet);
                } else {
                    forwardToPeer(self, packet);
                }
            }
        };
        if (util.getInternetExplorerVersion() >= 0) {
            // IE can keep storage events between refreshes.  If we give it a second, it'll
            // dump all of them on the floor
            setTimeout(function () {
                util.addEventListener('storage', receiveStorageEvent);
            }, 500);
        } else {
            util.addEventListener('storage', receiveStorageEvent);
        }

        this.peer.on("send", function (event) {
            self.send(event.packet);
        });

        this.peer.on("beforeShutdown", function () {
            util.removeEventListener('storage', receiveStorageEvent);
        }, this);

    };

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------
    /**
     * Passes the received packet to the local Peer component.
     * @method forwardToPeer
     * @private
     * @static
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Transport} packet
     */
    var forwardToPeer = function (link, packet) {
        link.peer.receive(link.linkId, packet);
        if (link.metrics) {
            link.packetsReceivedCounter.inc();
        }
        if (packet.data.time) {
            if (link.metrics) {
                link.latencyInTimer.mark(util.now() - packet.data.time);
            }
        }
    };

    /**
     *  Stores a received fragment. When the first fragment of a message is received, a timer is set to destroy the
     * storage of the message fragments should not all messages be received.
     *
     * @method storeFragment
     * @private
     * @static
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Network} packet NetworkPacket containing an {{#crossLink
     *     "ozpIwc.FragmentPacket"}}{{/crossLink}} as its data property
     *
     * @return {Boolean} result true if successful.
     */
    var storeFragment = function (link, packet) {
        if (!packet.data.fragment) {
            return null;
        }

        // NetworkPacket properties
        var sequence = packet.sequence;
        var srcPeer = packet.srcPeer;
        // FragmentPacket Properties
        var key = packet.data.msgId;
        var id = packet.data.id;
        var chunk = packet.data.chunk;
        var total = packet.data.total;

        if (key === undefined || id === undefined) {
            return null;
        }

        // If this is the first fragment of a message, add the storage object
        if (!link.fragments[key]) {
            link.fragments[key] = {};
            link.fragments[key].chunks = [];

            link.key = key;
            link.total = total;

            // Add a timeout to destroy the fragment should the whole message not be received.
            link.fragments[key].timeoutFunc = function () {
                if (link.metrics) {
                    link.droppedFragmentsCounter.inc(link.total);
                }
                delete link.fragments[link.key];
            };
        }

        // Restart the fragment drop countdown
        clearTimeout(link.fragments[key].fragmentTimer);
        link.fragments[key].fragmentTimer = setTimeout(link.fragments[key].timeoutFunc, link.fragmentTimeout);

        // keep a copy of properties needed for defragmenting, the last sequence & srcPeer received will be
        // reused in the defragmented packet
        link.fragments[key].total = total || link.fragments[key].total;
        link.fragments[key].sequence = (sequence !== undefined) ? sequence : link.fragments[key].sequence;
        link.fragments[key].srcPeer = srcPeer || link.fragments[key].srcPeer;
        link.fragments[key].chunks[id] = chunk;

        // If the necessary properties for defragmenting aren't set the storage fails
        if (link.fragments[key].total === undefined || link.fragments[key].sequence === undefined ||
            link.fragments[key].srcPeer === undefined) {
            return null;
        } else {
            if (link.metrics) {
                link.fragmentsReceivedCounter.inc();
            }
            return true;
        }
    };

    /**
     * Rebuilds the original packet sent across the keyBroadcastLocalStorageLink from the fragments it was broken up
     * into.
     *
     * @method defragmentPacket
     * @private
     * @static
     * @param {ozpIwc.packet.FragmentStore} fragments the grouping of fragments to reconstruct
     * @return {ozpIwc.packet.Network} result the reconstructed NetworkPacket with TransportPacket as its data
     *     property.
     */
    var defragmentPacket = function (fragments) {
        if (fragments.total !== fragments.chunks.length) {
            return null;
        }
        try {
            var result = JSON.parse(fragments.chunks.join(''));
            return {
                defragmented: true,
                sequence: fragments.sequence,
                srcPeer: fragments.srcPeer,
                data: result
            };
        } catch (e) {
            return null;
        }
    };

    /**
     * Places a packet in the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/sendQueue:property"}}{{/crossLink}}
     * if it does not already hold {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/queueSize:property"}}{{/crossLink}}
     * amount of packets.
     *
     * @method queueSend
     * @private
     * @static
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Transport} packet
     */
    var queueSend = function (link, packet) {
        if (link.sendQueue.length < link.queueSize) {
            link.sendQueue = link.sendQueue.concat(packet);
            while (link.sendQueue.length > 0) {
                attemptSend(link, link.sendQueue.shift());
            }
        } else {
            if (link.metrics) {
                link.packetsFailedCounter.inc();
            }
            log.error("Failed to write packet(len=" + packet.length + "):" + " Send queue full.");
        }
    };

    /**
     * Recursively tries sending the packet
     * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/maxRetries:property"}}{{/crossLink}} times.
     * The packet is dropped and the send fails after reaching max attempts.
     *
     * @method attemptSend
     * @private
     * @static
     *
     * @param {ozpIwc.network.KeyBroadcastLocalStorageLink} link
     * @param {ozpIwc.packet.Network} packet
     * @param {Number} [attemptCount] number of times attempted to send packet.
     */
    var attemptSend = function (link, packet, retryCount) {

        var sendStatus = link.sendImpl(packet);
        if (sendStatus) {
            retryCount = retryCount || 0;
            var timeOut = Math.max(1, Math.pow(2, (retryCount - 1))) - 1;

            if (retryCount < link.maxRetries) {
                retryCount++;
                // Call again but back off for an exponential amount of time.
                setTimeout(function () {
                    attemptSend(link, packet, retryCount);
                }, timeOut);
            } else {
                if (link.metrics) {
                    link.packetsFailedCounter.inc();
                }
                log.error("Failed to write packet(len=" + packet.length + "):" + sendStatus);
                return sendStatus;
            }
        }
    };

//--------------------------------------------------
//          Public Methods
//--------------------------------------------------
    /**
     * Handles fragmented packets received from the router. When all fragments of a message have been received,
     * the resulting packet will be passed on to the
     * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/peer:property"}}registered peer{{/crossLink}}.
     *
     * @method handleFragment
     * @param {ozpIwc.packet.Network} packet NetworkPacket containing an ozpIwc.FragmentPacket as its data property
     */
    Link.prototype.handleFragment = function (packet) {
        // Check to make sure the packet is a fragment and we haven't seen it
        if (this.peer.haveSeen(packet)) {
            return;
        }

        var key = packet.data.msgId;

        storeFragment(this, packet);

        var defragmentedPacket = defragmentPacket(this.fragments[key]);

        if (defragmentedPacket) {

            // clear the fragment timeout
            clearTimeout(this.fragments[key].fragmentTimer);

            // Remove the last sequence from the known packets to reuse it for the defragmented packet
            var packetIndex = this.peer.packetsSeen[defragmentedPacket.srcPeer].indexOf(defragmentedPacket.sequence);
            delete this.peer.packetsSeen[defragmentedPacket.srcPeer][packetIndex];

            forwardToPeer(this, defragmentedPacket);

            delete this.fragments[key];
        }
    };

    /**
     * Publishes a packet to other peers. If the sendQueue is full the send will not occur. If the TransportPacket is
     * larger than the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/fragmentSize:property"}}{{/crossLink}}, an
     * {{#crossLink "ozpIwc.FragmentPacket"}}{{/crossLink}} will be sent instead.
     *
     * @method send
     * @param {ozpIwc.packet.Network} packet
     */
    Link.prototype.send = function (packet) {
        var str;
        try {
            str = JSON.stringify(packet.data);
        } catch (e) {
            if (this.metrics) {
                this.packetsFailedCounter.inc();
            }
            var msgId = packet.msgId || "unknown";
            log.error("Failed to write packet(msgId=" + msgId + "):" + e.message);
            return;
        }

        if (str.length < this.fragmentSize) {
            queueSend(this, packet);
        } else {
            var fragments = str.chunk(this.fragmentSize);

            // Use the original packet as a template, delete the data and
            // generate new packets.
            var self = this;
            self.data = packet.data;
            delete packet.data;

            var fragmentGen = function (chunk, template) {

                template.sequence = self.peer.sequenceCounter++;
                template.data = {
                    fragment: true,
                    msgId: self.data.msgId,
                    id: i,
                    total: fragments.length,
                    chunk: chunk
                };
                return template;
            };

            // Generate & queue the fragments
            for (var i = 0; i < fragments.length; i++) {
                queueSend(this, fragmentGen(fragments[i], packet));
            }
        }
    };

    /**
     * Implementation of publishing packets to peers through localStorage. If the localStorage is full or a write
     * collision occurs, the send will not occur. Returns status of localStorage write, null if success.
     *
     * @todo move counter.inc() out of the impl and handle in attemptSend?
     * @method sendImpl
     * @param {ozpIwc.packet.Network} packet
     */
    Link.prototype.sendImpl = function (packet) {
        var sendStatus;
        try {
            var p = JSON.stringify(packet);
            localStorage.setItem(util.localStorageKey, p);
            if (this.metrics) {
                this.packetsSentCounter.inc();
            }
            if (packet.data.time) {
                if (this.metrics) {
                    this.latencyOutTimer.mark(util.now() - packet.data.time);
                }
            }
            localStorage.removeItem(util.localStorageKey);
            sendStatus = null;
        }
        catch (e) {
            if (e.message === "localStorage is null") {
                // Firefox about:config dom.storage.enabled = false : no mitigation with current links
                util.alert("Cannot locate localStorage. Contact your system administrator.", e);
            } else if (e.code === 18) {
                // cookies disabled : no mitigation with current links
                util.alert("Ozone requires your browser to accept cookies. Contact your system administrator.", e);
            } else {
                // If the error can't be mitigated, bubble it up
                sendStatus = e;
            }
        }
        finally {
            return sendStatus;
        }
    };

    return Link;
}(ozpIwc.log, ozpIwc.util));
