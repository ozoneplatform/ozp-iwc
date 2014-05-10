/** @namespace */
var sibilant=sibilant || {};

/** @namespace */
sibilant.util=sibilant.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 * @returns {String}
 */
sibilant.util.generateId=function() {
		return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 * @returns {Number}
 */
sibilant.util.now=function() {
		return new Date().getTime();
};

/**
 * Create a class with the given parent in it's prototype chain.
 * @param {function} baseClass - the class being derived from
 * @param {function} newConstructor - the new base class
 * @returns {Function} newConstructor with an augmented prototype
 */
sibilant.util.extend=function(baseClass,newConstructor) {
	newConstructor.prototype = Object.create(baseClass.prototype); 
	newConstructor.prototype.constructor = newConstructor;
	return newConstructor;
};

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

sibilant.metricsStats.DEFAULT_POOL_SIZE=1024;

sibilant.metricsStats.Sample = function(){
	this.clear();
};

sibilant.metricsStats.Sample.prototype.update = function(val){ 
	this.values.push(val); 
};

sibilant.metricsStats.Sample.prototype.clear = function(){ 
	this.values = []; 
	this.count = 0; 
};
sibilant.metricsStats.Sample.prototype.size = function(){ 
	return this.values.length;
};

sibilant.metricsStats.Sample.prototype.getValues = function(){ 
	return this.values; 
};


/**
 *  Take a uniform sample of size size for all values
 *  @class
 *  @param {Number} [size=sibilant.metricsStats.DEFAULT_POOL_SIZE] - The size of the sample pool.
 */
sibilant.metricsStats.UniformSample=sibilant.util.extend(sibilant.metricsStats.Sample,function(size) {
	sibilant.metricsStats.Sample.apply(this);
  this.limit = size || sibilant.metricsStats.DEFAULT_POOL_SIZE;
});

sibilant.metricsStats.UniformSample.prototype.update = function(val) {
  this.count++;
  if (this.size() < this.limit) {
    this.values.push(val);
  } else {
    var rand = parseInt(Math.random() * this.count);
    if (rand < this.limit) {
      this.values[rand] = val;
    }
  }
};

// From http://eloquentjavascript.net/appendix2.html, 
// licensed under CCv3.0: http://creativecommons.org/licenses/by/3.0/

var sibilant=sibilant || {};
sibilant.metricsStats=sibilant.metricsStats || {};
/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. Originally from from http://eloquentjavascript.net/appendix2.html
 * <p>Licenced under CCv3.0
 * @class
 * @param {type} scoreFunction
 * @returns {BinaryHeap}
 */
sibilant.metricsStats.BinaryHeap = function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
};

sibilant.metricsStats.BinaryHeap.prototype = {

  clone: function() {
    var heap = new sibilant.metricsStats.BinaryHeap(this.scoreFunction);
    // A little hacky, but effective.
    heap.content = JSON.parse(JSON.stringify(this.content));
    return heap;
  },

  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  peek: function() {
    return this.content[0];
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node))
            this.bubbleUp(i);
          else
            this.sinkDown(i);
        }
        return true;
      }
    }
    throw new Error("Node not found.");
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to move it further.
      else {
        break;
      }
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};


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

//  Take an exponentially decaying sample of size size of all values
sibilant.metricsStats.DEFAULT_RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds
sibilant.metricsStats.DEFAULT_DECAY_ALPHA=1;
/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. 
 * @class 
	*/
sibilant.metricsStats.ExponentiallyDecayingSample=sibilant.util.extend(sibilant.metricsStats.Sample,function(size, alpha) {
	sibilant.metricsStats.Sample.apply(this);
  this.limit = size || sibilant.metricsStats.DEFAULT_POOL_SIZE;
  this.alpha = alpha || sibilant.metricsStats.DEFAULT_DECAY_ALPHA;
	this.rescaleThreshold = sibilant.metricsStats.DEFAULT_RESCALE_THRESHOLD;
});

// This is a relatively expensive operation
sibilant.metricsStats.ExponentiallyDecayingSample.prototype.getValues = function() {
  var values = [];
  var heap = this.values.clone();
	var elt;
  while(elt = heap.pop()) {
    values.push(elt.val);
  }
  return values;
};

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.size = function() {
  return this.values.size();
};

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.newHeap = function() {
  return new sibilant.metricsStats.BinaryHeap(function(obj){return obj.priority;});
};

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.now = function() {
  return sibilant.util.now();
};

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.tick = function() {
  return this.now() / 1000;
};

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.clear = function() {
  this.values = this.newHeap();
  this.count = 0;
  this.startTime = this.tick();
  this.nextScaleTime = this.now() + this.rescaleThreshold;
};

/*
* timestamp in milliseconds
*/
sibilant.metricsStats.ExponentiallyDecayingSample.prototype.update = function(val, timestamp) {
  // Convert timestamp to seconds
  if (timestamp == undefined) {
    timestamp = this.tick();
  } else {
    timestamp = timestamp / 1000;
  }
  var priority = this.weight(timestamp - this.startTime) / Math.random()
    , value = {val: val, priority: priority};
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

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.weight = function(time) {
  return Math.exp(this.alpha * time);
};

sibilant.metricsStats.ExponentiallyDecayingSample.prototype.rescale = function() {
  this.nextScaleTime = this.now() + this.rescaleThreshold;
  var oldContent = this.values.content
    , newContent = []
    , elt
    , oldStartTime = this.startTime;
  this.startTime = this.tick();
  // Downscale every priority by the same factor. Order is unaffected, which is why we're avoiding the cost of popping.
  for(var i = 0; i < oldContent.length; i++) {
    newContent.push({val: oldContent[i].val, priority: oldContent[i].priority * Math.exp(-this.alpha * (this.startTime - oldStartTime))});
  }
  this.values.content = newContent;
};

var sibilant=sibilant || {};
sibilant.metricTypes=sibilant.metricTypes || {};

/**
 * @typedef {object} sibilant.MetricType 
 * @property {function} get - returns the current value of the metric
 */

/**
 * @class
 * @extends sibilant.MetricType
 * A counter running total that can be adjusted up or down.
 * Where a meter is set to a known value at each update, a
 * counter is incremented up or down by a known change.
 */
sibilant.metricTypes.Counter=function() {
	this.value=0;
};

/**
 * @returns {Number} Current value of the counter
 */
sibilant.metricTypes.Counter.prototype.get=function() { 
	return this.value; 
};

/**
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
sibilant.metricTypes.Counter.prototype.inc=function(delta) { 
	return this.value+=(delta?delta:1);
};

/**
 * @param {Number} [delta=1] - Decrement by this value
 * @returns {Number} - Value of the counter after decrement
 */
sibilant.metricTypes.Counter.prototype.dec=function(delta) { 
	return this.value-=(delta?delta:1);
};

/**
 * @class 
 * @extends sibilant.MetricType
 * A meter a value of a number as a point in time.  Where a counter
 * is incremented up or down, a meter is set to a known value at
 * each update.
 */
sibilant.metricTypes.Meter=function() {
	this.value=0;
	};
/**
 * @param {Number} value - The value to set the meter to
 * @returns {sibilant.metricTypes.Meter} this object
 */
sibilant.metricTypes.Meter.prototype.set=function(value) { 
	this.value=value; 
	return this;
};

/**
 * @returns {Number} the current value of the Meter
 */
sibilant.metricTypes.Meter.prototype.get=function() { 
	return this.value; 
};

/**
 * @callback sibilant.metricTypes.Gauge~gaugeCallback
 * @returns {sibilant.metricTypes.MetricsTree} 
 */

/**
 * @class
 * @extends sibilant.MetricType
 * A gauge is an externally defined set of metrics returned by a callback function
 * @param {sibilant.metricTypes.Gauge~gaugeCallback} metricsCallback
 */
sibilant.metricTypes.Gauge=function(metricsCallback) {
	this.callback=metricsCallback;
};
/**
 * Set the metrics callback for this gauge.
 * @param {sibilant.metricTypes.Gauge~gaugeCallback} metricsCallback
 * @returns {sibilant.metricTypes.Gauge} this
 */
sibilant.metricTypes.Gauge.prototype.set=function(metricsCallback) { 
	callback=metricsCallback; 
	return this;
};
/**
 * Executes the callback and returns a metrics tree.
 * @returns {sibilant.metricTypes.MetricsTree}
 */
sibilant.metricTypes.Gauge.prototype.get=function() { 
	return callback(); 
};

/**
 * @class
 * A repository of metrics
 */
sibilant.MetricsRegistry=function() {
	this.metrics={};
};

/**
 * 
 * @private
 * @param {string} name - Name of the metric
 * @param {function} type - The constructor of the requested type for this metric.
 * @returns {MetricType} - Null if the metric already exists of a different type.  Otherwise a reference to the metric.
 */
sibilant.MetricsRegistry.prototype.findOrCreateMetric=function(name,type) {
	var m= this.metrics[name] = this.metrics[name] || new type();
	if(m instanceof type){
			return m;
	} else {
			return null;
	}			
};

/**
 * Joins the arguments together into a name.
 * @private
 * @param {string[]} args - Array or the argument-like "arguments" value.
 * @returns {string}
 */
sibilant.MetricsRegistry.prototype.makeName=function(args) {
	// slice is necessary because "arguments" isn't a real array, and it's what
	// is usually passed in, here.
	return Array.prototype.slice.call(args).join(".");
};

/**
 * @param {...string} name - components of the name
 * @returns {sibilant.metricTypes.Counter}
 */
sibilant.MetricsRegistry.prototype.counter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),sibilant.metricTypes.Counter);
};

/**
 * @param {...string} name - components of the name
 * @returns {sibilant.metricTypes.Meter}
 */
sibilant.MetricsRegistry.prototype.meter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),sibilant.metricTypes.Meter);
};

/**
 * @param {...string} name - components of the name
 * @returns {sibilant.metricTypes.Gauge}
 */
sibilant.MetricsRegistry.prototype.gauge=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),sibilant.metricTypes.Gauge);
};
/**
 * 
 * @returns {unresolved}
 */
sibilant.MetricsRegistry.prototype.toJson=function() {
	var rv={};
	for(var k in this.metrics) {
		var path=k.split(".");
		var pos=rv;
		while(path.length > 1) {
			var current=path.shift();
			pos = pos[current]=pos[current] || {};
		}
		pos[path[0]]=this.metrics[k].get();
	}
	return rv;
};

	
sibilant.metrics=new sibilant.MetricsRegistry();
