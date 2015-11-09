var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Histogram = (function (metricTypes, metricStats, util) {
    /**
     * @class Histogram
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     */
    var Histogram = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);

        /**
         * @property sample
         * @type {ozpIwc.metric.stats.ExponentiallyDecayingSample}
         */
        this.sample = new metricStats.ExponentiallyDecayingSample();
        this.clear();
    });


    /**
     * @method clear
     */
    Histogram.prototype.clear = function () {
        this.sample.clear();
        this.min = this.max = null;
        this.varianceMean = 0;
        this.varianceM2 = 0;
        this.sum = 0;
        this.count = 0;
    };

    /**
     * @method mark
     * @param {Number} val
     * @param {Number} timestamp Current time in milliseconds.
     * @return {Number} Value of the counter after increment
     */
    Histogram.prototype.mark = function (val, timestamp) {
        timestamp = timestamp || util.now();

        this.sample.update(val, timestamp);

        this.max = (this.max === null ? val : Math.max(this.max, val));
        this.min = (this.min === null ? val : Math.min(this.min, val));
        this.sum += val;
        this.count++;

        var delta = val - this.varianceMean;
        this.varianceMean += delta / this.count;
        this.varianceM2 += delta * (val - this.varianceMean);

        return this.count;
    };

    /**
     * @method get
     * @return {{percentile10, percentile25, median, percentile75, percentile90, percentile95, percentile99,
 * percentile999, variance: null, mean: null, stdDev: null, count: *, sum: *, max: *, min: *}}
     */
    Histogram.prototype.get = function () {
        var values = this.sample.getValues().map(function (v) {
            return parseFloat(v);
        }).sort(function (a, b) {
            return a - b;
        });
        var percentile = function (p) {
            var pos = p * (values.length);
            if (pos >= values.length) {
                return values[values.length - 1];
            }
            pos = Math.max(0, pos);
            pos = Math.min(pos, values.length + 1);
            var lower = values[Math.floor(pos) - 1];
            var upper = values[Math.floor(pos)];
            return lower + (pos - Math.floor(pos)) * (upper - lower);
        };

        return {
            'percentile10': percentile(0.10),
            'percentile25': percentile(0.25),
            'median': percentile(0.50),
            'percentile75': percentile(0.75),
            'percentile90': percentile(0.90),
            'percentile95': percentile(0.95),
            'percentile99': percentile(0.99),
            'percentile999': percentile(0.999),
            'variance': this.count < 1 ? null : this.varianceM2 / (this.count - 1),
            'mean': this.count === 0 ? null : this.varianceMean,
            'stdDev': this.count < 1 ? null : Math.sqrt(this.varianceM2 / (this.count - 1)),
            'count': this.count,
            'sum': this.sum,
            'max': this.max,
            'min': this.min
        };
    };

    return Histogram;
}(ozpIwc.metric.types, ozpIwc.metric.stats, ozpIwc.util));