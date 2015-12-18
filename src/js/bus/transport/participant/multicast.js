var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.Multicast = (function (transport, util) {
    /**
     * A participant to handle multicast communication on the IWC.
     *
     * @class Multicast
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Base
     * @constructor
     *
     * @param {String} name The name of the participant.
     */
    var Multicast = util.extend(transport.participant.Base, function (config) {

        /**
         * The address of the participant.
         * @property address
         * @type String
         */
        this.address = config.name;

        /**
         * The name of the participant.
         * @property name
         * @type String
         */
        this.name = config.name;

        /**
         * The type of the participant
         * @property participantType
         * @type String
         * @default "multicast"
         */
        this.participantType = "multicast";

        transport.participant.Base.apply(this, arguments);

        /**
         * Array of Participants that are part of the multicast group.
         * @property members
         * @type ozpIwc.transport.participant.Base[]
         * @default []
         */
        this.members = [];

        /**
         * The participants resource path for the Names API.
         * @property namesResource
         * @type String
         * @default "/multicast/"
         */
        this.namesResource = "/multicast/" + this.name;

        /**
         * Content type for the Participant's heartbeat status packets.
         * @property heartBeatContentType
         * @type String
         * @default "application/vnd.ozp-iwc-multicast-address-v1+json"
         */
        this.heartBeatContentType = "application/vnd.ozp-iwc-multicast-address-v1+json";

        /**
         *
         * @property heartBeatStatus.members
         * @type Array
         * @default []
         */
        this.heartBeatStatus.members = [];

        /**
         * Fires when the participant has connected to its router.
         * @event #connectedToRouter
         */
        this.on("connectedToRouter", function () {
            this.namesResource = "/multicast/" + this.name;
        }, this);

        //At creation the multicast participant knows what it can sendAs/receiveAs
        this.permissions.pushIfNotExist('ozp:iwc:address', config.name);
        this.permissions.pushIfNotExist('ozp:iwc:sendAs', config.name);
        this.permissions.pushIfNotExist('ozp:iwc:receiveAs', config.name);
    });

    /**
     * Receives a packet on behalf of the multicast group.
     *
     * @method receiveFromRouterImpl
     *
     * @param {ozpIwc.packet.Transport} packet
     * @return {Boolean} always false.
     */
    Multicast.prototype.receiveFromRouterImpl = function (packet) {
        if (this.metrics) {
            this.receivedPacketsMeter.mark();
        }
        this.members.forEach(function multicastRoute (m) {
            // as we send to each member, update the context to make it believe that it's the only recipient
            packet.dstParticipant = m;
            m.receiveFromRouter(packet);
        });
        return false;
    };

    /**
     * Adds a member to the multicast group.
     *
     * @method addMember
     *
     * @param {ozpIwc.transport.participant.Base} participant
     */
    Multicast.prototype.addMember = function (participant) {
        this.members.push(participant);
        this.heartBeatStatus.members.push(participant.address);
    };

    return Multicast;
}(ozpIwc.transport, ozpIwc.util));
