var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.metric
 */

ozpIwc.metric.Registry = (function (metricTypes) {
    /**
     * A repository of metrics
     * @class Registry
     * @namespace ozpIwc.metric
     */
    var Registry = function () {
        /**
         * Key value store of metrics
         * @property metrics
         * @type Object
         */
        this.metrics = {};
        var self = this;
        this.gauge('registry.metrics.types').set(function () {
            return Object.keys(self.metrics).length;
        });

    };

//--------------------------------------------------
//          Private Methods
//--------------------------------------------------

    /**
     * Finds or creates the metric in the registry.
     * @method findOrCreateMetric
     * @private
     * @static
     * @param {ozpIwc.metric.Registry} registry Name of the metric.
     * @param {String} name Name of the metric.
     * @param {Function} Type The constructor of the requested type for this metric.
     * @return {Object} Null if the metric already exists of a different type. Otherwise a reference to
     * the metric.
     */
    var findOrCreateMetric = function (registry, name, Type) {
        var m = registry.metrics[name];
        if (!m) {
            m = registry.metrics[name] = new Type();
            m.name = name;
            return m;
        }
        if (m instanceof Type) {
            return m;
        } else {
            return null;
        }
    };

//--------------------------------------------------
//          Public Methods
//--------------------------------------------------

    /**
     * Joins the arguments together into a name.
     * @method makeName
     * @private
     * @param {String[]} args Array or the argument-like "arguments" value.
     * @return {String} the name.
     */
    Registry.prototype.makeName = function (args) {
        // slice is necessary because "arguments" isn't a real array, and it's what
        // is usually passed in, here.
        return Array.prototype.slice.call(args).join(".");
    };

    /**
     * Returns the counter instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method counter
     * @param {String} name Components of the name.
     *
     * @return {ozpIwc.metric.types.Counter}
     */
    Registry.prototype.counter = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Counter);
    };

    /**
     * Returns the ozpIwc.metric.types.Meter instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method meter
     * @param {String} name Components of the name.
     *
     * @return {Object}
     */
    Registry.prototype.meter = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Meter);
    };

    /**
     * Returns the ozpIwc.metric.types.Gauge instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method gauge
     * @param {String} name Components of the name.
     * @return {Object}
     */
    Registry.prototype.gauge = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Gauge);
    };

    /**
     * Returns the ozpIwc.metric.types.Histogram instance(s) for the given name(s). If it does not exist it will be
     * created.
     *
     * @method histogram
     * @param {String} name Components of the name.
     *
     * @return {Object}
     */
    Registry.prototype.histogram = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Histogram);
    };

    /**
     * Returns the ozpIwc.metric.types.Timer instance(s) for the given name(s). If it does not exist it will be created.
     *
     * @method timer
     * @param {String} name Components of the name.
     *
     * @return {Object}
     */
    Registry.prototype.timer = function (name) {
        return findOrCreateMetric(this, this.makeName(arguments), metricTypes.Timer);
    };

    /**
     * Registers an ozpIwc.metric.types object to the metric registry
     *
     * @method register
     * @param {String} name Components of the name.
     * @param {Object} metric
     *
     * @return {Object} The metric passed in.
     */
    Registry.prototype.register = function (name, metric) {
        this.metrics[this.makeName(name)] = metric;

        return metric;
    };

    /**
     * Converts the metric registry to JSON.
     *
     * @method toJson
     * @return {Object} JSON converted registry.
     */
    Registry.prototype.toJson = function () {
        var rv = {};
        for (var k in this.metrics) {
            var path = k.split(".");
            var pos = rv;
            while (path.length > 1) {
                var current = path.shift();
                pos = pos[current] = pos[current] || {};
            }
            pos[path[0]] = this.metrics[k].get();
        }
        return rv;
    };

    /**
     * Returns an array of all ozpIwc.metric.types objects in the registry
     * @method allMetrics
     * @return {Object[]}
     */
    Registry.prototype.allMetrics = function () {
        var rv = [];
        for (var k in this.metrics) {
            rv.push(this.metrics[k]);
        }
        return rv;
    };

    return Registry;
}(ozpIwc.metric.types || {}));
