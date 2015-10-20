var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types|| {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Counter = (function (metricTypes, util) {

    /**
     * A counter running total that can be adjusted up or down.
     * Where a meter is set to a known value at each update, a
     * counter is incremented up or down by a known change.
     *
     * @class Counter
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     */
    var Counter = util.extend(metricTypes.BaseMetric, function () {
        metricTypes.BaseMetric.apply(this, arguments);
        this.value = 0;
    });

    /**
     * @method inc
     * @param {Number} [delta=1]  Increment by this value
     * @return {Number} Value of the counter after increment
     */
    Counter.prototype.inc = function (delta) {
        return this.value += (delta ? delta : 1);
    };

    /**
     * @method dec
     * @param {Number} [delta=1]  Decrement by this value
     * @return {Number} Value of the counter after decrement
     */
    Counter.prototype.dec = function (delta) {
        return this.value -= (delta ? delta : 1);
    };

    return Counter;
}(ozpIwc.metric.types, ozpIwc.util));