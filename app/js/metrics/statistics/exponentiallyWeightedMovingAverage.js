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
var sibilant=sibilant || {};
sibilant.metricsStats=sibilant.metricsStats || {};

/*
 *  Exponentially weighted moving average.
 *  Args: 
 *  - alpha:
 *  - interval: time in milliseconds
 */

sibilant.metricsStats.M1_ALPHA = 1 - Math.exp(-5/60);
sibilant.metricsStats.M5_ALPHA = 1 - Math.exp(-5/60/5);
sibilant.metricsStats.M15_ALPHA = 1 - Math.exp(-5/60/15);

sibilant.metricsStats.ExponentiallyWeightedMovingAverage=function(alpha, interval) {
  var self = this;
  this.alpha = alpha;
  this.interval = interval || 5000;
  this.initialized = false;
  this.currentRate = 0.0;
  this.uncounted = 0;
  if (interval) {
    this.tickInterval = setInterval(function(){ self.tick(); }, interval);

    // Don't keep the process open if this is the last thing in the event loop.
    this.tickInterval.unref();
  }
};

sibilant.metricsStats.ExponentiallyWeightedMovingAverage.prototype.update = function(n) {
  this.uncounted += (n || 1);
};

/*
 * Update our rate measurements every interval
 */
sibilant.metricsStats.ExponentiallyWeightedMovingAverage.prototype.tick = function() {
  var  instantRate = this.uncounted / this.interval;
  this.uncounted = 0;
  
  if(this.initialized) {
    this.currentRate += this.alpha * (instantRate - this.currentRate);
  } else {
    this.currentRate = instantRate;
    this.initialized = true;
  }
};

/*
 * Return the rate per second
 */
sibilant.metricsStats.ExponentiallyWeightedMovingAverage.prototype.rate = function() {
  return this.currentRate * 1000;
};

sibilant.metricsStats.ExponentiallyWeightedMovingAverage.prototype.stop = function() {
  clearInterval(this.tickInterval);
};

//module.exports.createM1EWMA = function(){ return new EWMA(M1_ALPHA, 5000); }
//module.exports.createM5EWMA = function(){ return new EWMA(M5_ALPHA, 5000); }
//module.exports.createM15EWMA = function(){ return new EWMA(M15_ALPHA, 5000); }
