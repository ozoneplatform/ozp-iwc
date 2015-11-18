var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.transport
 */

ozpIwc.transport.consensus = ozpIwc.transport.consensus || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.consensus
 */

ozpIwc.transport.consensus.Base = (function (transport, util) {
    /**
     * A base-class for consensus modules.
     *
     * @class Base
     * @namespace ozpIwc.transport.consensus
     * @uses ozpIwc.util.Event
     * @param {Object} config
     * @param {String} config.name
     * @param {Function} config.routePacket
     * @param {ozpIwc.transport.participant.Base} [config.participant]
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     * @param {String} [config.consensusAddress]
     * @param {ozpIwc.transport.Router} [config.router]
     * @constructor
     */
    var Base = function (config) {
        config = config || {};
        var self = this;
        if (!config.name) {
            throw "Consensus module expects a name.";
        }
        if (!config.router) {
            throw "Consensus module expects a router.";
        }
        /**
         * name of the consensus module
         * @property name
         * @type {String}
         */
        this.name = config.name;

        /**
         * The communication module of this consensus module.
         * @property participant
         * @tyope {Object}
         */
        this.participant = config.participant || new transport.participant.Client({
                'internal': true,
                'router': config.router,
                'authorization': config.authorization,
                'name': config.name
            });

        /**
         * The messaging address common among all matching modules.
         * @property consensusAddress
         * @type {String}
         */
        this.consensusAddress = config.consensusAddress || this.name + ".consensus";

        /**
         * The router for which this modules participant communicates over
         * @property router
         */
        this.router = config.router;

        /**
         * An eventing module.
         * @property events
         * @type {ozpIwc.util.Event}
         */
        this.events = new util.Event();
        this.events.mixinOnOff(this);

        /**
         * The state of the module. (coordinator/member)
         * @property state
         * @type {string}
         */
        this.state = "unknown";
        this.participant.on("connectedToRouter", function () {
            self.participant.permissions.pushIfNotExist('ozp:iwc:address', [self.participant.address, self.consensusAddress]);
            self.participant.permissions.pushIfNotExist('ozp:iwc:sendAs', [self.participant.address, self.consensusAddress]);
            self.participant.permissions.pushIfNotExist('ozp:iwc:receiveAs', [self.participant.address, self.consensusAddress]);
        });

        this.routePacket = config.routePacket || this.routePacket;

        this.router.registerMulticast(this.participant, [this.consensusAddress]);
        this.participant.on("receive", this.routePacket, this);
    };

    /**
     * Packet routing functionality of the consensus module. Expected to be overridden by subclass.
     *
     * @method routePacket
     * @param {Object} packetContext
     */
    Base.prototype.routePacket = function (packetContext) {
        throw "routePacket is to be overridden by consensus implementation";
    };


    /**
     * Module becoming coordinator handler for the consensus module. Expected to be overridden by subclass.
     *
     * @method onBecomeCoordinator
     */
    Base.prototype.onBecomeCoordinator = function () {
        throw "onBecomeCoordinator is to be overridden by consensus implementation";
    };


    /**
     * Module becoming member handler for the consensus module. Expected to be overridden by subclass.
     *
     * @method onBecomeMember
     */
    Base.prototype.onBecomeMember = function () {
        throw "onBecomeMember is to be overridden by consensus implementation";
    };

    /**
     * Changes state of the consensus module. Triggers "changedState" event.
     *
     * @method changeState
     * @param {String} state
     */
    Base.prototype.changeState = function (state) {
        if (this.state !== state) {
            this.state = state;
            this.events.trigger("changedState", this.state);
        }
    };

    return Base;

}(ozpIwc.transport, ozpIwc.util));
