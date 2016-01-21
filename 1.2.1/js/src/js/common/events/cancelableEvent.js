var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.CancelableEvent = (function () {

    /**
     * Convenient base for events that can be canceled.  Provides and manages
     * the properties canceled and cancelReason, as well as the member function
     * cancel().
     *
     * @class CancelableEvent
     * @constructor
     * @namespace ozpIwc.util
     * @param {Object} data Data that will be copied into the event
     */
    var CancelableEvent = function (data) {
        data = data || {};
        for (var k in data) {
            this[k] = data[k];
        }
        /**
         * @property canceled
         * @type {Boolean}
         */
        this.canceled = false;

        /**
         * @property cancelReason
         * @type {String}
         */
        this.cancelReason = null;
    };

    /**
     * Marks the event as canceled.
     * @method cancel
     * @param {String} reason A text description of why the event was canceled.
     *
     * @return {ozpIwc.util.CancelableEvent} Reference to self
     */
    CancelableEvent.prototype.cancel = function (reason) {
        reason = reason || "Unknown";
        this.canceled = true;
        this.cancelReason = reason;
        return this;
    };

    return CancelableEvent;
}());