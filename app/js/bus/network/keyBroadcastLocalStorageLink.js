/** @namespace **/
var ozpIwc = ozpIwc || {};

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
 * @class
 * @param {Object} [config] - Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {string} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 * @param {Number} [config.maxRetries] - Number of times packet transmission will retry if failed. Defaults to 6.
 * @param {Number} [config.queueSize] - Number of packets allowed to be queued at one time. Defaults to 1024.
 * @param {Number} [config.fragmentSize] - Size in bytes of which any TransportPacket exceeds will be sent in FragmentPackets.
 * @param {Number} [config.fragmentTime] - Time in milliseconds after a fragment is received and additional expected
 *                                         fragments are not received that the message is dropped.
 */
ozpIwc.KeyBroadcastLocalStorageLink = function (config) {
    config = config || {};

    this.prefix = config.prefix || 'ozpIwc';
    this.peer = config.peer || ozpIwc.defaultPeer;
    this.selfId = config.selfId || this.peer.selfId;
    this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds
    this.otherKeysTimeout = config.otherKeysTimeout || 2 * 60000; // 2 minutes
    this.maxRetries = config.maxRetries || 6;
    this.queueSize = config.queueSize || 1024;
    this.sendQueue = this.sendQueue || [];
    this.fragmentSize = config.fragmentSize || (5 * 1024 * 1024) / 2 / 2; //50% of 5mb, divide by 2 for utf-16 characters
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
        try {
            packet = JSON.parse(event.key);
        } catch (e) {
            console.log("Parse error on " + event.key);
            ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.parseError').inc();
            return;
        }
        if (packet.data.fragment) {
            self.handleFragment(packet);
        } else {
            self.peer.receive(self.linkId, packet);
            ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();
        }
    };
    window.addEventListener('storage', receiveStorageEvent, false);

    this.peer.on("send", function (event) {
        self.send(event.packet);
    });

    this.peer.on("beforeShutdown", function () {
        window.removeEventListener('storage', receiveStorageEvent);
    }, this);

};

/**
 * @typedef ozpIwc.FragmentPacket
 * @property {boolean} fragment - Flag for knowing this is a fragment packet. Should be true.
 * @property {Number} msgId - The msgId from the TransportPacket broken up into fragments.
 * @property {Number} id - The position amongst other fragments of the TransportPacket.
 * @property {Number} total - Total number of fragments of the TransportPacket expected.
 * @property {String} chunk - A segment of the TransportPacket in string form.
 *
 */

/**
 * @typedef ozpIwc.FragmentStore
 * @property {Number} sequence - The sequence of the latest fragment received.
 * @property {Number} total - The total number of fragments expected.
 * @property {String} src_peer - The src_peer of the fragments expected.
 * @property {Array(String)} chunks - String segments of the TransportPacket.
 */

/**
 * Handles fragmented packets received from the router. When all fragments of a message have been received,
 * the resulting packet will be passed on to the registered peer of the KeyBroadcastLocalStorageLink.
 * @param {ozpIwc.NetworkPacket} packet - NetworkPacket containing an ozpIwc.FragmentPacket as its data property
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.handleFragment = function (packet) {
    // Check to make sure the packet is a fragment and we haven't seen it
    if (this.peer.haveSeen(packet)) {
        return;
    }

    var key = packet.data.msgId;

    this.storeFragment(packet);

    var defragmentedPacket = this.defragmentPacket(this.fragments[key]);

    if (defragmentedPacket) {

        // clear the fragment timeout
        window.clearTimeout(this.fragments[key].fragmentTimer);

        // Remove the last sequence from the known packets to reuse it for the defragmented packet
        var packetIndex = this.peer.packetsSeen[defragmentedPacket.src_peer].indexOf(defragmentedPacket.sequence);
        delete this.peer.packetsSeen[defragmentedPacket.src_peer][packetIndex];

        this.peer.receive(this.linkId, defragmentedPacket);
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();

        delete this.fragments[key];
    }
};

/**
 *  Stores a received fragment. When the first fragment of a message is received, a timer is set to destroy the storage
 *  of the message fragments should not all messages be received.
 * @param {ozpIwc.NetworkPacket} packet - NetworkPacket containing an ozpIwc.FragmentPacket as its data property
 * @returns {boolean} result - true if successful.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.storeFragment = function (packet) {
    if (!packet.data.fragment) {
        return null;
    }

    this.fragments = this.fragments || [];
    // NetworkPacket properties
    var sequence = packet.sequence;
    var src_peer = packet.src_peer;
    // FragmentPacket Properties
    var key = packet.data.msgId;
    var id = packet.data.id;
    var chunk = packet.data.chunk;
    var total = packet.data.total;

    if (key === undefined || id === undefined) {
        return null;
    }

    // If this is the first fragment of a message, add the storage object
    if (!this.fragments[key]) {
        this.fragments[key] = {};
        this.fragments[key].chunks = [];

        var self = this;
        self.key = key;
        self.total = total ;

        // Add a timeout to destroy the fragment should the whole message not be received.
        this.fragments[key].timeoutFunc = function () {
            ozpIwc.metrics.counter('network.packets.dropped').inc();
            ozpIwc.metrics.counter('network.fragments.dropped').inc(self.total );
            delete self.fragments[self.key];
        };
    }

    // Restart the fragment drop countdown
    window.clearTimeout(this.fragments[key].fragmentTimer);
    this.fragments[key].fragmentTimer = window.setTimeout(this.fragments[key].timeoutFunc, this.fragmentTimeout);

    // keep a copy of properties needed for defragmenting, the last sequence & src_peer received will be
    // reused in the defragmented packet
    this.fragments[key].total = total || this.fragments[key].total ;
    this.fragments[key].sequence = (sequence !== undefined) ? sequence : this.fragments[key].sequence;
    this.fragments[key].src_peer = src_peer || this.fragments[key].src_peer;
    this.fragments[key].chunks[id] = chunk;

    // If the necessary properties for defragmenting aren't set the storage fails
    if (this.fragments[key].total === undefined || this.fragments[key].sequence === undefined ||
        this.fragments[key].src_peer === undefined) {
        return null;
    } else {
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.fragments.received').inc();
        return true;
    }
};

/**
 * Rebuilds the original packet sent across the keyBroadcastLocalStorageLink from the fragments it was broken up into.
 * @param {ozpIwc.FragmentStore} fragments - the grouping of fragments to reconstruct
 * @returns {ozpIwc.NetworkPacket} result - the reconstructed NetworkPacket with TransportPacket as its data property.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.defragmentPacket = function (fragments) {
    if (fragments.total != fragments.chunks.length) {
        return null;
    }
    try {
        var result = JSON.parse(fragments.chunks.join(''));
        return {
            defragmented: true,
            sequence: fragments.sequence,
            src_peer: fragments.src_peer,
            data: result
        };
    } catch (e) {
        return null;
    }
};

/**
 * <p>Publishes a packet to other peers.
 * <p>If the sendQueue is full (KeyBroadcastLocalStorageLink.queueSize) send will not occur.
 * <p>If the TransportPacket is too large (KeyBroadcastLocalStorageLink.fragmentSize) ozpIwc.FragmentPacket's will
 *    be sent instead.
 *
 * @class
 * @param {ozpIwc.NetworkPacket} - packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.send = function (packet) {
    var str = JSON.stringify(packet.data);

    if (str.length < this.fragmentSize) {
        this.queueSend(packet);
    } else {
        var fragments = str.chunk(this.fragmentSize);

        // Use the original packet as a template, delete the data and
        // generate new packets.
        var self = this;
        self.data= packet.data;
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
            this.queueSend(fragmentGen(fragments[i], packet));
        }
    }
};

ozpIwc.KeyBroadcastLocalStorageLink.prototype.queueSend = function (packet) {
    if (this.sendQueue.length < this.queueSize) {
        this.sendQueue = this.sendQueue.concat(packet);
        while (this.sendQueue.length > 0) {
            this.attemptSend(this.sendQueue.shift());
        }
    } else {
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.failed').inc();
        ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + " Send queue full.");
    }
};

/**
 * <p> Recursively tries sending the packet (KeyBroadcastLocalStorageLink.maxRetries) times
 * The packet is dropped and the send fails after reaching max attempts.
 *
 * @class
 * @param {ozpIwc.NetworkPacket} - packet
 * @param {Number} [attemptCount] - number of times attempted to send packet.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.attemptSend = function (packet, retryCount) {

    var sendStatus = this.sendImpl(packet);
    if (sendStatus) {
        var self = this;
        retryCount = retryCount || 0;
        var timeOut = Math.max(1, Math.pow(2, (retryCount - 1))) - 1;

        if (retryCount < self.maxRetries) {
            retryCount++;
            // Call again but back off for an exponential amount of time.
            window.setTimeout(function () {
                self.attemptSend(packet, retryCount);
            }, timeOut);
        } else {
            ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.failed').inc();
            ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + sendStatus);
            return sendStatus;
        }
    }
};

/**
 * <p>Implementation of publishing packets to peers through localStorage.
 * <p>If the localStorage is full or a write collision occurs, the send will not occur.
 * <p>Returns status of localStorage write, null if success.
 *
 * @todo move counter.inc() out of the impl and handle in attemptSend?
 *
 * @class
 * @param {ozpIwc.NetworkPacket} - packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.sendImpl = function (packet) {
    var sendStatus;
    try {
        var p = JSON.stringify(packet);
        localStorage.setItem(p, "");
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.sent').inc();
        localStorage.removeItem(p);
        sendStatus = null;
    }
    catch (e) {
        sendStatus = e;
    }
    finally {
        return sendStatus;
    }
};
