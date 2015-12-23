var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.Event = (function (util) {

    /**
     * An Event emitter/receiver class.
     * @class Event
     * @constructor
     * @namespace ozpIwc.util
     */
    var Event = function () {
        /**
         * A key value store of events.
         * @property events
         * @type {Object}
         * @default {}
         */
        this.events = {};
    };

    /**
     * Registers a handler for the the event.
     *
     * @method on
     * @param {String} event The name of the event to trigger on.
     * @param {Function} callback Function to be invoked.
     * @param {Object} [self] Used as the this pointer when callback is invoked.
     *
     * @return {Object} A handle that can be used to unregister the callback via
     * {{#crossLink "ozpIwc.util.Event/off:method"}}{{/crossLink}}
     */
    Event.prototype.on = function (event, callback, self) {
        var wrapped = callback;
        if (self) {
            wrapped = function () {
                callback.apply(self, arguments);
            };
            wrapped.ozpIwcDelegateFor = callback;
        }
        this.events[event] = this.events[event] || [];
        this.events[event].push(wrapped);
        return wrapped;
    };

    /**
     * Unregisters an event handler previously registered.
     *
     * @method off
     * @param {String} event
     * @param {Function} callback
     */
    Event.prototype.off = function (event, callback) {
        this.events[event] = (this.events[event] || []).filter(function (h) {
            return h !== callback && h.ozpIwcDelegateFor !== callback;
        });
    };

    /**
     * Fires an event that will be received by all handlers.
     *
     * @method
     * @param {String} eventName Name of the event.
     * @param {Object} event Event object to pass to the handlers.
     *
     * @return {Object} The event after all handlers have processed it.
     */
    Event.prototype.trigger = function (eventName) {
        //if no event data push a new cancelable event
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length < 1) {
            args.push(new util.CancelableEvent());
        }
        var handlers = this.events[eventName] || [];

        handlers.forEach(function handleEvent(h) {
            h.apply(this, args);
        });
        return args[0];
    };

    /**
     * Adds an {{#crossLink "ozpIwc.util.Event/off:method"}}on(){{/crossLink}} and
     * {{#crossLink "ozpIwc.util.Event/off:method"}}off(){{/crossLink}} function to the target that delegate to this
     * object.
     *
     * @method mixinOnOff
     * @param {Object} target Target to receive the on/off functions
     */
    Event.prototype.mixinOnOff = function (target) {
        var self = this;
        target.on = function () { return self.on.apply(self, arguments);};
        target.off = function () { return self.off.apply(self, arguments);};
    };

    return Event;
}(ozpIwc.util));
