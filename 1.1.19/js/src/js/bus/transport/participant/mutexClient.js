var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant.MutexClient = (function (transport, util) {
    /**
     * A Client participant that adheres to mutual exclusion on the IWC Bus based on its **name**. If another mutex
     * client controls the lock, outbound requests of this client will be dropped. Adhering to distributed practices,
     * during a transition of lock ownership all mutex clients related to the lock will queue outbound requests.
     *
     * @class MutexClient
     * @namespace ozpIwc.transport.participant
     * @extends ozpIwc.transport.participant.Client
     * @constructor
     *
     * @param {String} name The name of the participant.
     */
    var MutexClient = util.extend(transport.participant.Client, function (config) {
        config = config || {};
        if (!config.name) {
            throw "Cannot instantiate a MutexClient without a name.";
        }
        transport.participant.Client.apply(this, arguments);
        /**
         * The type of the participant
         * @property participantType
         * @type String
         * @default "multicast"
         */
        this.participantType = "MutexClient";

        this.onLock = config.onLock || function () {};
        this.onRelease = config.onRelease || function () {};

        requestOwnership(this);
    });


    /**
     * Remove this participant from the $bus.multicast multicast group.
     *
     * @method leaveEventChannel
     */
    MutexClient.prototype.leaveEventChannel = function () {
        this.events.trigger("shutdown");

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
            return true;
        } else {
            return false;
        }

    };
    MutexClient.prototype.relock = function () {
        if (this.lockPromise) {
            return;
        }
        requestOwnership(this);
    };
    //-----------------------------------------------------
    // Private Methods
    //-----------------------------------------------------
    var requestOwnership = function (mutexClient) {
        if (mutexClient.lockPromise) {
            return;
        }
        mutexClient.lockPromise = util.mutex({
            requester: mutexClient,
            resource: "/mutex/" + mutexClient.name,
            onUnlock: function () {
                mutexClient.lockPromise = undefined;
                mutexClient.onRelease();
            }
        }).then(mutexClient.onLock);
    };


    return MutexClient;
}(ozpIwc.transport, ozpIwc.util));