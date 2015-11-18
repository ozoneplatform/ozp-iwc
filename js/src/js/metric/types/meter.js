var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Meter = (function (metricTypes, metricStats, util) {

    /**
     * @class Meter
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     */
    var Meter = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);
        /**
         * @property m1Rate
         * @type {ozpIwc.metric.stats.ExponentiallyWeightedMovingAverage}
         */
        this.m1Rate = new metricStats.ExponentiallyWeightedMovingAverage(metricStats.M1_ALPHA);
        /**
         * @property m5Rate
         * @type {ozpIwc.metric.stats.ExponentiallyWeightedMovingAverage}
         */
        this.m5Rate = new metricStats.ExponentiallyWeightedMovingAverage(metricStats.M5_ALPHA);
        /**
         * @property m15Rate
         * @type {ozpIwc.metric.stats.ExponentiallyWeightedMovingAverage}
         */
        this.m15Rate = new metricStats.ExponentiallyWeightedMovingAverage(metricStats.M15_ALPHA);
        /**
         * @property startTime
         * @type {Number}
         */
        this.startTime = util.now();
        /**
         * @property value
         * @type {Number}
         * @default 0
         */
        this.value = 0;
    });

    /**
     * @method mark
     * @param {Number} [delta=1] - Increment by this value
     * @return {Number} - Value of the counter after increment
     */
    Meter.prototype.mark = function (delta) {
        delta = delta || 1;
        this.value += delta;
        this.m1Rate.update(delta);
        this.m5Rate.update(delta);
        this.m15Rate.update(delta);

        return this.value;
    };

    /**
     * @method get
     * @return {{rate1m: (Number), rate5m: (Number), rate15m: (Number), rateMean: number, count: (Number)}}
     */
    Meter.prototype.get = function () {
        return {
            'rate1m': this.m1Rate.rate(),
            'rate5m': this.m5Rate.rate(),
            'rate15m': this.m15Rate.rate(),
            'rateMean': this.value / (util.now() - this.startTime) * 1000,
            'count': this.value
        };
    };

    /**
     * @method tick
     */
    Meter.prototype.tick = function () {
        this.m1Rate.tick();
        this.m5Rate.tick();
        this.m15Rate.tick();
    };

    return Meter;
}(ozpIwc.metric.types, ozpIwc.metric.stats, ozpIwc.util));
