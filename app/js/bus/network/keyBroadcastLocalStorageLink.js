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
 * @todo Fragment the packet if it's more than storage can handle.
 * @todo Compress the key
 *
 * @class
 * @param {Object} [config] - Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {string} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 * @param {Number} [config.maxRetries] - Number of times packet transmission will retry if failed. Defaults to 6.
 * @param {Number} [config.queueSize] - Number of packets allowed to be queued at one time. Defaults to 1024.
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
        if (packet.fragment) {
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

ozpIwc.KeyBroadcastLocalStorageLink.prototype.handleFragment = function (packet) {
    // Check to make sure we haven't seen this fragment
    if (this.peer.haveSeen(packet)) {
        return;
    }

    this.fragments = this.fragments || [];
    this.fragments[packet.fragment.time] = this.fragments[packet.fragment.time] || {
        handling: false,
        chunks: []
    };

    this.fragments[packet.fragment.time].chunks[packet.fragment.id] = packet.fragment.chunk;

    if (this.fragments[packet.fragment.time].chunks.length === packet.fragment.count) {
        var result = JSON.parse(this.fragments[packet.fragment.time].chunks.join(''));

        var defragmentedPacket = {
            sequence: packet.sequence,
            src_peer: packet.src_peer,
            data: result
        };

        this.peer.receive(this.linkId, defragmentedPacket);
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();

        delete this.fragments[packet.fragment.time];
    }
};
/**
 * <p>Publishes a packet to other peers.
 * <p>If the sendQueue is full (KeyBroadcastLocalStorageLink.queueSize) send will not occur.
 *
 * @class
 * @param {ozpIwc.NetworkPacket} - packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.send = function (packet) {

    var str = JSON.stringify(packet.data);

    // 50% of localStorage = 5MB / 2(utf-16 strings) / 2(50%) = 1280
    if (str.length < 1280) {
        this.queueSend(packet);
    } else {
        var fragments = str.chunk(1280);

        // Use the original packet as a template, delete the data and
        // generate new packets.
        delete packet.data;
        var self = this;
        var fragmentGen = function(chunk) {
            packet.sequence = self.peer.sequenceCounter++;
            packet.fragment = {
                id: i,
                count: fragments.length,
                chunk: chunk
            };
            return packet;
        };

        for (var i = 0; i < fragments.length; i++) {
            this.queueSend(fragmentGen(fragments[i]));
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
