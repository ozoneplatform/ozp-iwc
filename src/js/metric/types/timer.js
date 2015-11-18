var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Timer = (function (metricTypes, util) {
    /**
     * @class Timer
     * @namespace ozpIwc
     * @extends ozpIwc.metric.types.BaseMetric
     * @type {Function}
     */
    var Timer = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);
        /**
         * @property meter
         * @type {ozpIwc.metric.types.Meter}
         */
        this.meter = new metricTypes.Meter();

        /**
         * @property histogram
         * @type {ozpIwc.metric.types.Histogram}
         */
        this.histogram = new metricTypes.Histogram();
    });

    /**
     * @method mark
     * @param {Number} val
     * @param {Number} timestamp Current time in milliseconds.
     */
    Timer.prototype.mark = function (val, time) {
        this.meter.mark();
        this.histogram.mark(val, time);
    };

    /**
     * Starts the timer
     *
     * @method start
     * @return {Function}
     */
    Timer.prototype.start = function () {
        var self = this;
        var startTime = util.now();
        return function () {
            var endTime = util.now();
            self.mark(endTime - startTime, endTime);
        };
    };

    /**
     * Times the length of a function call.
     *
     * @method time
     * @param {Function}callback
     */
    Timer.prototype.time = function (callback) {
        var startTime = util.now();
        try {
            callback();
        } finally {
            var endTime = util.now();
            this.mark(endTime - startTime, endTime);
        }
    };

    /**
     * Returns a histogram of the timer metrics.
     *
     * @method get
     * @return {Object}
     */
    Timer.prototype.get = function () {
        var val = this.histogram.get();
        var meterMetrics = this.meter.get();
        for (var k in meterMetrics) {
            val[k] = meterMetrics[k];
        }
        return val;
    };

    return Timer;
}(ozpIwc.metric.types, ozpIwc.util));
