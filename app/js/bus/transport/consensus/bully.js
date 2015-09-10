var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.consensus = ozpIwc.transport.consensus || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.consensus
 */


ozpIwc.transport.consensus.Bully = (function (consensus, ozpConfig, util) {
    /**
     * An implementation of the Bully Algorithm as a consensus module for the IWC.
     * Acknowledge(OK) message is not used in current implementation, rather a victory message is sent out on an
     * interval to notify other consensus modules whom the coordinator is.
     *
     * The consensusId is a negative reference to the time at which the bully was created. This means the oldest bully
     * module leads.
     *
     * @class Bully
     * @namespace ozpIwc.transport.consensus
     * @extends ozpIwc.transport.consensus.Base
     * @type {Function}
     */
    var Bully = util.extend(consensus.Base, function (config) {
        consensus.Base.apply(this, arguments);
        /**
         * Election rank of this module. Seniority rules.
         * @property consensusId
         * @type {Number}
         */
        this.consensusId = config.consensusId || -util.now();

        /**
         * How long this module waits before assuming the coordinator is down.
         * @property coordinatorTimeoutHeartbeat
         * @type {Number}
         */
        this.coordinatorTimeoutHeartbeat = config.heartbeat || ozpConfig.consensusTimeout;

        /**
         * How often this module broadcasts being the coordinator (if coordinator).
         * @property coordinatorTimeoutHeartbeat
         * @type {Number}
         */
        this.coordinatorIntervalHeartbeat = this.coordinatorTimeoutHeartbeat / 2;

        /**
         * Data passing functionality for those who use this module. Data passed into gatherLogs will be shared with
         * other matching modules if this module is the coordinator.
         *
         * @method gatherLogs
         * @type {Function}
         */
        this.gatherLogs = config.gatherLogs || function () {};

        //Give some arbitrary time for the query to respond before kicking off an election
        restartCoordinatorTimeout(this,1000);
        sendQueryMessage(this);
    });

    /**
     * Routes packets for the bully module. Packets with the following actions are accepted:
     *  - election
     *  - acknowledge
     *  - query
     *  - victory
     *
     * @method routePacket
     * @override
     * @param {ozpIwc.packet.Transport} packetContext
     */
    Bully.prototype.routePacket = function (packetContext) {
        var packet = packetContext.packet || {};

        //Accept packets sent out to this consensus module
        if (packet.dst === this.consensusAddress) {
            //But ignore own packets
            if (packet.src !== this.participant.address) {
                switch (packet.action) {
                    case "election":
                        onElectionMessage(this, packet);
                        break;
                    case "acknowledge":
                        onAckMessage(this, packet);
                        break;
                    case "victory":
                        onVictoryMessage(this, packet);
                        break;
                    case "query":
                        onQueryMessage(this, packet);
                        break;
                    default:
                        break;
                }
            }
        }

    };


//==================================================================
// Consensus message sending
//==================================================================
    /**
     * Sends an election message to other Bully Modules to determine a coordinator.
     *
     * @method sendElectionMessage
     */
    Bully.prototype.sendElectionMessage = function () {
        this.participant.send({
            'dst': this.consensusAddress,
            'action': "election",
            'entity': {
                'consensusId': this.consensusId
            }
        });
    };

    ///**
    // * @TODO: Unused, a modified bully algorithm was implemented.
    // * Sends an acknowledge message to the consensusId that sent an election message to inform them that this module out
    // * ranks them.
    // *
    // * @method sendAckMessage
    // * @private
    // * @static
    // * @param {ozpIwc.transport.consensus.Bully} bully
    // * @param {String}consensusSender
    // */
    //var sendAckMessage = function (bully, consensusSender) {
    //    bully.participant.send({
    //        'dst': bully.consensusAddress,
    //        'action': "acknowledge",
    //        'entity': {
    //            'consensusId': bully.consensusId,
    //            'replyTo': {
    //                'consensusId': consensusSender
    //            }
    //        }
    //    });
    //};

    /**
     * Sends a victory message to other bully modules informing them of this modules role as Coordinator.
     *
     * @method sendVictoryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     */
    var sendVictoryMessage = function (bully) {
        var logs = bully.gatherLogs();
        bully.participant.send({
            'dst': bully.consensusAddress,
            'action': "victory",
            'entity': {
                'consensusId': bully.consensusId,
                'logs': logs
            }
        });
    };

    /**
     * Sends a query message to other bully modules. The Coordinator will hear this message and respond immediately with
     * a victory message to inform Coordinator status.
     *
     * @method sendQueryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     */
    var sendQueryMessage = function (bully) {
        bully.participant.send({
            'dst': bully.consensusAddress,
            'action': "query",
            'entity': {
                'consensusId': bully.consensusId
            }
        });
    };


//==================================================================
// Consensus message handling
//==================================================================
    /**
     * Handler function for receiving election messages. If the message sender is of lower rank than this module, this
     * module joins the election.
     *
     * @method onElectionMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onElectionMessage = function (bully, packet) {
        var entity = packet.entity;
        if (!entity.consensusId) {
            throw "Non-formatted election message received.";
        }
        var consensusId = entity.consensusId;

        // Ignore it if they out rank us.
        if (consensusId > bully.consensusId) {
            cancelElection(bully);
            restartCoordinatorTimeout(bully, bully.coordinatorTimeoutHeartbeat, true);
            return;
        }

        // Let them know that we out rank them.
        //sendAckMessage(bully, consensusId);
        cancelElection(bully);
        startElection(bully);
    };

    /**
     * Handler function for receiving acknowledge messages. If the acknowledge message is directed at this bully
     * module, it will cancel its election as a higher ranking module exists.
     *
     * @method onAckMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onAckMessage = function (bully, packet) {
        var entity = packet.entity;
        var replyTo = entity.replyTo || {};
        if (!replyTo.consensusId) {
            throw "Non-formatted acknowledge message received.";
        }
        var consensusId = replyTo.consensusId;

        // Ignore if it wasn't sent directly to me.
        if (consensusId !== bully.consensusId) {
            return;
        }

        //what do we do on ack?
        //cancel election timeout
        cancelElection(bully);
    };

    /**
     * Handler function for receiving victory messages. If the sender out ranks this module, the module will act as a
     * member of the module group and start a watchdog to start a new election if the coordinator goes silent.
     *
     * @method onVictoryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onVictoryMessage = function (bully, packet) {
        var entity = packet.entity;
        if (!entity.consensusId) {
            throw "Non-formatted election message received.";
        }
        var consensusId = entity.consensusId;

        // Ignore it if they out rank us.
        if (consensusId > bully.consensusId) {
            cancelElection(bully);
            if (entity.logs) {
                bully.events.trigger("receivedLogs", entity.logs);
            }
            restartCoordinatorTimeout(bully);
            return;
        }

        //Rebel if needed.
        startElection(bully);

    };


    /**
     * Handler function for receiving query messages. If this module is the coordinator it will respond with a victory
     * message to inform sender that this module is the coordinator.
     *
     * @method onQueryMessage
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Object} packet
     */
    var onQueryMessage = function (bully, packet) {
        var entity = packet.entity;
        if (!entity.consensusId) {
            throw "Non-formatted election message received.";
        }

        // If this Bully is pumping out victory messages its the leader, otherwise don't respond
        if (bully.coordinatorInterval) {
            sendVictoryMessage(bully);
            return;
        }
    };


//==================================================================
// Consensus Coordinator timeout
//==================================================================
    /**
     * Restarts the watchdog for which the coordinator must respond before ending otherwise this module will start an
     * election.
     *
     * @method restartCoordinatorTimeout
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Number}[timeout]
     */
    var restartCoordinatorTimeout = function (bully, timeout, keepState) {
        timeout = timeout || bully.coordinatorTimeoutHeartbeat;
        window.clearTimeout(bully.coordinatorTimeout);
        if (!keepState) {
            bully.changeState("member");
        }
        bully.coordinatorTimeout = window.setTimeout(function () {
            bully.onCoordinatorTimeout(timeout);
        }, timeout);
    };

    /**
     * Handler function for when no response was made by the coordinator and its watchdog times out.
     *
     * @method onCoordinatorTimeout
     * @param timeout
     */
    Bully.prototype.onCoordinatorTimeout = function (timeout) {
        startElection(this, timeout);
    };


//==================================================================
// Coordinator functionality
//==================================================================
    /**
     * Handler function for when this module becomes coordinator of all active matching bully modules.
     *
     * @override
     * @method onBecomeCoordinator
     */
    Bully.prototype.onBecomeCoordinator = function () {
        var self = this;
        window.clearInterval(this.coordinatorInterval);

        sendVictoryMessage(this, this.lastElection);
        this.changeState("coordinator");
        this.coordinatorInterval = window.setInterval(function () {
            sendVictoryMessage(self, self.lastElection);
        }, this.coordinatorIntervalHeartbeat);
    };

//==================================================================
// Election control
//==================================================================
    /**
     * Makes this bully module start an election for the coordinator role.
     *
     * @method startElection
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     * @param {Number} [timeout]
     */
    var startElection = function (bully, timeout) {
        timeout = timeout || bully.coordinatorTimeoutHeartbeat;
        window.clearTimeout(bully.electionTimeout);

        bully.electionTimeout = window.setTimeout(function () {
            bully.onBecomeCoordinator();
        }, timeout);

        bully.sendElectionMessage();
    };

    /**
     * Cancels this modules participation in the current election.
     *
     * @method cancelElection
     * @private
     * @static
     * @param {ozpIwc.transport.consensus.Bully} bully
     */
    var cancelElection = function (bully) {
        window.clearTimeout(bully.electionTimeout);
    };

    return Bully;

}(ozpIwc.transport.consensus, ozpIwc.config, ozpIwc.util));
