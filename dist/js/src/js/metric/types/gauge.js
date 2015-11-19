var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.Gauge = (function (metricTypes, util) {
    /**
     * @callback ozpIwc.metric.types.Gauge~gaugeCallback
     * @return {ozpIwc.metric.types.MetricsTree}
     */

    /**
     * A gauge is an externally defined set of metrics returned by a callback function
     *
     * @class Gauge
     * @namespace ozpIwc.metric.types
     * @extends ozpIwc.metric.types.BaseMetric
     * @param {ozpIwc.metric.types.Gauge~gaugeCallback} metricsCallback
     */
    var Gauge = util.extend(metricTypes.BaseMetric, function (metricsCallback) {
        metricTypes.BaseMetric.apply(this, arguments);
        this.callback = metricsCallback;
    });
    /**
     * Set the metrics callback for this gauge.
     *
     * @method set
     * @param {ozpIwc.metric.types.Gauge~gaugeCallback} metricsCallback
     *
     * @return {ozpIwc.metric.types.Gauge} this
     */
    Gauge.prototype.set = function (metricsCallback) {
        this.callback = metricsCallback;
        return this;
    };
    /**
     * Executes the callback and returns a metrics tree.
     *
     * @method get
     *
     * @return {ozpIwc.metric.types.MetricsTree}
     */
    Gauge.prototype.get = function () {
        if (this.callback) {
            return this.callback();
        }
        return undefined;
    };

    return Gauge;
}(ozpIwc.metric.types, ozpIwc.util));