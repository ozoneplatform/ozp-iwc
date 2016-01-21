/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */

var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.stats = ozpIwc.metric.stats || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.stats
 */


ozpIwc.metric.stats = (function (stats) {
    /**
     * @property DEFAULT_RESCALE_THRESHOLD
     * @type {Number}
     * @default 3600000
     */
    stats.DEFAULT_RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

    /**
     * @property DEFAULT_DECAY_ALPHA
     * @type {Number}
     * @default 0.015
     */
    stats.DEFAULT_DECAY_ALPHA = 0.015;

    /**
     * This acts as a ordered binary heap for any serializeable JS object or collection of such objects
     * <p>Borrowed from https://github.com/mikejihbe/metrics.
     * @class ExponentiallyDecayingSample
     * @namespace ozpIwc.metric.stats
     */
    stats.ExponentiallyDecayingSample = ozpIwc.util.extend(stats.Sample, function (size, alpha) {
        stats.Sample.apply(this);
        this.limit = size || stats.DEFAULT_POOL_SIZE;
        this.alpha = alpha || stats.DEFAULT_DECAY_ALPHA;
        this.rescaleThreshold = stats.DEFAULT_RESCALE_THRESHOLD;
    });

// This is a relatively expensive operation
    /**
     * @method getValues
     * @return {Array}
     */
    stats.ExponentiallyDecayingSample.prototype.getValues = function () {
        var values = [];
        var heap = this.values.clone();
        var elt;
        while ((elt = heap.pop()) !== undefined) {
            values.push(elt.val);
        }
        return values;
    };

    /**
     * @method size
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.size = function () {
        return this.values.size();
    };

    /**
     * @method newHeap
     * @return {ozpIwc.metric.stats.BinaryHeap}
     */
    stats.ExponentiallyDecayingSample.prototype.newHeap = function () {
        return new stats.BinaryHeap(function (obj) {return obj.priority;});
    };

    /**
     * @method now
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.now = function () {
        return ozpIwc.util.now();
    };

    /**
     * @method tick
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.tick = function () {
        return this.now() / 1000;
    };

    /**
     * @method clear
     */
    stats.ExponentiallyDecayingSample.prototype.clear = function () {
        this.values = this.newHeap();
        this.count = 0;
        this.startTime = this.tick();
        this.nextScaleTime = this.now() + this.rescaleThreshold;
    };

    /**
     * timestamp in milliseconds
     * @method update
     * @param {Number} val
     * @param {Number} timestamp
     */
    stats.ExponentiallyDecayingSample.prototype.update = function (val, timestamp) {
        // Convert timestamp to seconds
        if (timestamp === undefined) {
            timestamp = this.tick();
        } else {
            timestamp = timestamp / 1000;
        }
        var priority = this.weight(timestamp - this.startTime) / Math.random();
        var value = {val: val, priority: priority};
        if (this.count < this.limit) {
            this.count += 1;
            this.values.push(value);
        } else {
            var first = this.values.peek();
            if (first.priority < priority) {
                this.values.push(value);
                this.values.pop();
            }
        }

        if (this.now() > this.nextScaleTime) {
            this.rescale();
        }
    };

    /**
     * @method weight
     * @param {Number}time
     * @return {Number}
     */
    stats.ExponentiallyDecayingSample.prototype.weight = function (time) {
        return Math.exp(this.alpha * time);
    };

    /**
     * @method rescale
     */
    stats.ExponentiallyDecayingSample.prototype.rescale = function () {
        this.nextScaleTime = this.now() + this.rescaleThreshold;
        var oldContent = this.values.content;
        var newContent = [];
        var oldStartTime = this.startTime;
        this.startTime = this.tick();
        // Downscale every priority by the same factor. Order is unaffected, which is why we're avoiding the cost of
        // popping.
        for (var i = 0; i < oldContent.length; i++) {
            newContent.push({
                val: oldContent[i].val,
                priority: oldContent[i].priority * Math.exp(-this.alpha * (this.startTime - oldStartTime))
            });
        }
        this.values.content = newContent;
    };

    return stats;
}(ozpIwc.metric.stats));