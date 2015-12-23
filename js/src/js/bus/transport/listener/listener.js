var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.listener = ozpIwc.transport.listener || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.listener
 */


ozpIwc.transport.listener.Base = (function (log, transport, util) {
    /**
     * Base class for Participant listeners. Should be inherited from for different browser transport components.
     *
     * @class Base
     * @namespace ozpIwc.transport.participant
     * @param {Object} [config]
     * @param {ozpIwc.transport.Router} [config.router]
     * @param {ozpIwc.metric.Registry} [config.metrics] The metric registry to put this modules metrics in. If no
     *     registry metrics not taken
     * @param {ozpIwc.policyAuth.PDP} [config.authorization] The authorization component for this module.
     */
    var Base = function (config) {
        config = config || {};
        if (!config.router) {
            throw "Listener requires a router.";
        }
        /**
         * @property Participants
         * @type ozpIwc.transport.participant.PostMessage[]
         */
        this.participants = [];

        /**
         * @property router
         * @type ozpIwc.transport.Router
         */
        this.router = config.router;

        /**
         * Policy authorizing module.
         * @property authorization
         * @type {ozpIwc.policyAuth.PDP}
         */
        this.authorization = config.authorization;

        /**
         * Metric registry to store metrics on this link.
         * @property metrics
         * @type {ozpIwc.metric.Registry}
         */
        this.metrics = config.metrics;

        /**
         * @property readyPromise
         * @type {Promise}
         */
        this.readyPromise = config.ready || Promise.resolve();

        var self = this;

        this.registration();

        if (this.metrics) {
            this.metrics.gauge('transport.listener.' + this.name + '.participants').set(function () {
                return self.getParticipantCount();
            });
        }
    };

    Base.prototype.name = "Base";
    Base.prototype.registration = function () {
        throw "Listener registration should be overriden by inheriting class.";
    };
    /**
     * Gets the count of known participants
     *
     * @method getParticipantCount
     *
     * @return {Number} the number of known participants
     */
    Base.prototype.getParticipantCount = function () {
        if (!this.participants) {
            return 0;
        }
        return this.participants.length;
    };

    /**
     * Finds the participant associated with the given window.  Unfortunately, this is an
     * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
     * compare windows other than equality.
     *
     * @method findParticipant
     * @param {Object} source - the participant handle from message's event.source
     */
    Base.prototype.findParticipant = function (source) {
        for (var i = 0; i < this.participants.length; ++i) {
            if (this.participants[i].source === source) {
                return this.participants[i];
            }
        }
    };

    return Base;
}(ozpIwc.log, ozpIwc.transport, ozpIwc.util));
