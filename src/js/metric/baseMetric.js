var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types || {};

/**
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.types
 */

ozpIwc.metric.types.BaseMetric = (function () {
    /**
     * @Class BaseMetric
     * @namespace ozpIwc.metric.types
     */
    var BaseMetric = function () {
        /**
         * The value of the metric
         * @property value
         * @type Number
         * @default 0
         */
        this.value = 0;

        /**
         * The name of the metric
         * @property name
         * @type String
         * @default ""
         */
        this.name = "";

        /**
         * The unit name of the metric
         * @property unitName
         * @type String
         * @default ""
         */
        this.unitName = "";
    };

    /**
     * Returns the metric value
     * @method get
     * @return {Number}
     */
    BaseMetric.prototype.get = function () {
        return this.value;
    };

    /**
     * Sets the unit name if parameter provided. Returns the unit name if no parameter provided.
     * @method unit
     * @param {String} val
     * @return {ozpIwc.metric.types.BaseMetric|String}
     */
    BaseMetric.prototype.unit = function (val) {
        if (val) {
            this.unitName = val;
            return this;
        }
        return this.unitName;
    };

    return BaseMetric;
}());



