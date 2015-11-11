var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util = (function (util) {
    //----------------------------------------------------------------
    // Private properties
    //----------------------------------------------------------------
    var guid = util.generateId();
    var timerId = 0;
    var timerCallbacks = {};
    var timerWorker;
    var runLoc = "local";
    var enhancedTimersEnabled = false;

    var getTimerId = function () {
        return guid + ":" + timerId++;
    };

    var useLocalTimers = function () {
        return runLoc === "local";
    };

    var setLocalTimers = function () {
        runLoc = "local";
        for (var i in timerCallbacks) {
            if (timerCallbacks[i].type === "setInterval" && timerCallbacks[i].loc === "sharedWorker") {
                timerWorker.port.postMessage({
                    type: "clearInterval",
                    id: timerCallbacks[i].id
                });
                timerCallbacks[i].loc = "local";
                timerCallbacks[i].locId = window.setInterval(timerCallbacks[i].callback, timerCallbacks[i].time, timerCallbacks[i].args);
            }
        }
    };

    var setSharedWorkerTimers = function () {
        runLoc = "sharedWorker";
        for (var i in timerCallbacks) {
            if (timerCallbacks[i].type === "setInterval" && timerCallbacks[i].time < 1000 && timerCallbacks[i].loc === "local") {
                window.clearInterval(timerCallbacks[i].locId);
                timerCallbacks[i].loc = "sharedWorker";
                timerWorker.port.postMessage({
                    type: timerCallbacks[i].type,
                    id: timerCallbacks[i].id,
                    loc: timerCallbacks[i].loc,
                    time: timerCallbacks[i].time
                });
            }
        }
    };

    var clearCalls = function (type) {
        return function (id) {
            if (!enhancedTimersEnabled || !timerCallbacks[id]) {
                return window.clearInterval(id);
            } else if (timerCallbacks[id].loc === "local") {
                window.clearInterval(timerCallbacks[id].locId);
                timerCallbacks[id] = undefined;
            } else {
                timerWorker.port.postMessage({
                    type: type,
                    id: timerCallbacks[id].id
                });
                timerCallbacks[id] = undefined;
            }
        };
    };

    //----------------------------------------------------------------
    // Public methods
    //----------------------------------------------------------------

    /**
     * Creates connection the shared web worker and toggles util.setInterval and util.setTimeout to offload to the
     * shared web worker when the window goes hidden.
     * @method enableEnhancedTimers
     */
    util.enabledEnhancedTimers = function () {
        if (window.SharedWorker) {
            timerWorker = new SharedWorker('/js/ozpIwc.timer.js');

            timerWorker.port.addEventListener('message', function (evt) {
                console.log(evt);
                var timer = evt.data;
                var registered = timerCallbacks[timer.id];
                if (registered) {
                    registered.callback.call(window, registered.args);

                    if (timer.type === "setTimeout") {
                        timerCallbacks[timer.id] = null;
                    }
                }
            });

            document.addEventListener("visibilitychange", function runOnce(e) {
                switch (document.visibilityState) {
                    case "visible":
                        setLocalTimers();
                        break;
                    case "hidden":
                        setSharedWorkerTimers();
                        break;
                }
            });

            enhancedTimersEnabled = true;
            timerWorker.port.start();
        }
    };

    /**
     * A wrapper around the window.setTimeout function, if the window is hidden this offloads to the shared worker
     * if possible to avoid timer clamping.
     *
     * @method setTimeout
     * @param {Function} cb The function to call after the time has passed
     * @param {Number} time How long to wait to call the callback.
     * @returns {Number|String} The id associated with the timeout.
     */
    util.setTimeout = function (cb, time) {
        if (!enhancedTimersEnabled || useLocalTimers() || time && time >= 1000) {
            return window.setTimeout(cb, time);
        }
        var timer = {
            type: "setTimeout",
            time: time,
            id: getTimerId(),
            callback: cb,
            args: Array.prototype.slice.call(arguments, 2)
        };

        timerCallbacks[timer.id] = timer;
        timerWorker.port.postMessage(timer);
        return timer.id;
    };

    /**
     * A wrapper around the window.setImmediate function, if the window is hidden this offloads to the shared worker
     * if possible to avoid timer clamping.
     *
     * @method setTimeout
     * @param {Function} cb The function to call after the time has passed
     * @param {Number} time How often to call the callback.
     * @returns {Number|String} The id associated with the timeout.
     */
    util.setInterval = function (cb, time) {
        if (!enhancedTimersEnabled) {
            return window.setInterval(cb, time);
        }

        var timer = {
            type: "setInterval",
            time: time,
            id: getTimerId(),
            callback: cb,
            args: Array.prototype.slice.call(arguments, 2)
        };

        if (useLocalTimers() || time && time >= 1000) {
            timer.loc = "local";
            timer.locId = window.setInterval(cb, time);
            timerCallbacks[timer.id] = timer;
            return timer.locId;
        }

        timer.loc = "sharedWorker";
        timerCallbacks[timer.id] = timer;

        timerWorker.port.postMessage(timer);
        return timer.id;
    };

    /**
     * A wrapper around the window.clearInterval function. If the interval to clear is offloaded to the shared web
     * worker notification must be sent to it to stop updating.
     * @method clearInterval
     * @param {Number|String} id
     */
    util.clearInterval = clearCalls("clearInterval");

    /**
     * A wrapper around the window.clearTimeout function.If the timeout to clear is offloaded to the shared web
     * worker notification must be sent to it to stop it from firing.
     * @method clearInterval
     * @param {Number|String} id
     */
    util.clearTimeout = clearCalls("clearTimeout");

    return util;
}(ozpIwc.util));