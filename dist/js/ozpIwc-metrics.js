/*jshint -W079 */
var window = window || self;
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally. This also holds a reference to known-good
// functions.
var $Array = Array;
var ArrayPrototype = $Array.prototype;
var $Object = Object;
var ObjectPrototype = $Object.prototype;
var FunctionPrototype = Function.prototype;
var $String = String;
var StringPrototype = $String.prototype;
var $Number = Number;
var NumberPrototype = $Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var array_concat = ArrayPrototype.concat;
var call = FunctionPrototype.call;
var max = Math.max;
var min = Math.min;

// Having a toString local variable name breaks in Opera so use to_string.
var to_string = ObjectPrototype.toString;

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, tryFunctionObject = function tryFunctionObject(value) { try { fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]'; isCallable = function isCallable(value) { if (typeof value !== 'function') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };

/* inlined from http://npmjs.com/define-properties */
var defineProperties = (function (has) {
  var supportsDescriptors = $Object.defineProperty && (function () {
      try {
          var obj = {};
          $Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
          for (var _ in obj) { return false; }
          return obj.x === obj;
      } catch (e) { /* this is ES3 */
          return false;
      }
  }());

  // Define configurable, writable and non-enumerable props
  // if they don't exist.
  var defineProperty;
  if (supportsDescriptors) {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          $Object.defineProperty(object, name, {
              configurable: true,
              enumerable: false,
              writable: true,
              value: method
          });
      };
  } else {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          object[name] = method;
      };
  }
  return function defineProperties(object, map, forceAssign) {
      for (var name in map) {
          if (has.call(map, name)) {
            defineProperty(object, name, map[name], forceAssign);
          }
      }
  };
}(ObjectPrototype.hasOwnProperty));

//
// Util
// ======
//

/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
var isPrimitive = function isPrimitive(input) {
    var type = typeof input;
    return input === null || (type !== 'object' && type !== 'function');
};

var isActualNaN = $Number.isNaN || function (x) { return x !== x; };

var ES = {
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
    ToInteger: function ToInteger(num) {
        var n = +num;
        if (isActualNaN(n)) {
            n = 0;
        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
    ToPrimitive: function ToPrimitive(input) {
        var val, valueOf, toStr;
        if (isPrimitive(input)) {
            return input;
        }
        valueOf = input.valueOf;
        if (isCallable(valueOf)) {
            val = valueOf.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        toStr = input.toString;
        if (isCallable(toStr)) {
            val = toStr.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError();
    },

    // ES5 9.9
    // http://es5.github.com/#x9.9
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
    ToObject: function (o) {
        /* jshint eqnull: true */
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert " + o + ' to object');
        }
        return $Object(o);
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
    ToUint32: function ToUint32(x) {
        return x >>> 0;
    }
};

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

var Empty = function Empty() {};

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isCallable(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    array_concat.call(args, array_slice.call(arguments))
                );
                if ($Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    array_concat.call(args, array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            array_push.call(boundArgs, '$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);
var toStr = call.bind(ObjectPrototype.toString);
var strSlice = call.bind(StringPrototype.slice);
var strSplit = call.bind(StringPrototype.split);

//
// Array
// =====
//

var isArray = $Array.isArray || function isArray(obj) {
    return toStr(obj) === '[object Array]';
};

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
defineProperties(ArrayPrototype, {
    unshift: function () {
        array_unshift.apply(this, arguments);
        return this.length;
    }
}, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties($Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = $Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';

            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var i = -1;
        var length = ES.ToUint32(self.length);
        var T;
        if (arguments.length > 1) {
          T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.forEach callback must be a function');
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                if (typeof T === 'undefined') {
                    callbackfn(self[i], i, object);
                } else {
                    callbackfn.call(T, self[i], i, object);
                }
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var result = $Array(length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.map callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                if (typeof T === 'undefined') {
                    result[i] = callbackfn(self[i], i, object);
                } else {
                    result[i] = callbackfn.call(T, self[i], i, object);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
defineProperties(ArrayPrototype, {
    filter: function filter(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var result = [];
        var value;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.filter callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                    array_push.call(result, value);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
defineProperties(ArrayPrototype, {
    every: function every(callbackfn /*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.every callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return false;
            }
        }
        return true;
    }
}, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
defineProperties(ArrayPrototype, {
    some: function some(callbackfn/*, thisArg */) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.some callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return true;
            }
        }
        return false;
    }
}, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
var reduceCoercesToObject = false;
if (ArrayPrototype.reduce) {
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduce: function reduce(callbackfn /*, initialValue*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduce callback must be a function');
        }

        // no value to return if no initial value and an empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        }

        return result;
    }
}, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
var reduceRightCoercesToObject = false;
if (ArrayPrototype.reduceRight) {
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduceRight: function reduceRight(callbackfn/*, initial*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduceRight callback must be a function');
        }

        // no value to return if no initial value, empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result;
        var i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        } while (i--);

        return result;
    }
}, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(searchElement /*, fromIndex */) {
        var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
        var length = ES.ToUint32(self.length);

        if (length === 0) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = ES.ToInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === searchElement) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
defineProperties(ArrayPrototype, {
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */) {
        var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
        var length = ES.ToUint32(self.length);

        if (length === 0) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = min(i, ES.ToInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && searchElement === self[i]) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2LastIndexOfBug);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, !spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = max(ES.ToInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = array_slice.call(arguments);
            if (args.length < 2) {
                array_push.call(args, this.length - start);
            } else {
                args[1] = ES.ToInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);
var spliceWorksWithLargeSparseArrays = (function () {
    // Per https://github.com/es-shims/es5-shim/issues/295
    // Safari 7/8 breaks with sparse arrays of size 1e5 or greater
    var arr = new $Array(1e5);
    // note: the index MUST be 8 or larger or the test will false pass
    arr[8] = 'x';
    arr.splice(1, 1);
    // note: this test must be defined *after* the indexOf shim
    // per https://github.com/es-shims/es5-shim/issues/313
    return arr.indexOf('x') === 7;
}());
var spliceWorksWithSmallSparseArrays = (function () {
    // Per https://github.com/es-shims/es5-shim/issues/295
    // Opera 12.15 breaks on this, no idea why.
    var n = 256;
    var arr = [];
    arr[n] = 'a';
    arr.splice(n + 1, 0, 'b');
    return arr[n] === 'a';
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        var O = ES.ToObject(this);
        var A = [];
        var len = ES.ToUint32(O.length);
        var relativeStart = ES.ToInteger(start);
        var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
        var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);

        var k = 0;
        var from;
        while (k < actualDeleteCount) {
            from = $String(actualStart + k);
            if (owns(O, from)) {
                A[k] = O[from];
            }
            k += 1;
        }

        var items = array_slice.call(arguments, 2);
        var itemCount = items.length;
        var to;
        if (itemCount < actualDeleteCount) {
            k = actualStart;
            while (k < (len - actualDeleteCount)) {
                from = $String(k + actualDeleteCount);
                to = $String(k + itemCount);
                if (owns(O, from)) {
                    O[to] = O[from];
                } else {
                    delete O[to];
                }
                k += 1;
            }
            k = len;
            while (k > (len - actualDeleteCount + itemCount)) {
                delete O[k - 1];
                k -= 1;
            }
        } else if (itemCount > actualDeleteCount) {
            k = len - actualDeleteCount;
            while (k > actualStart) {
                from = $String(k + actualDeleteCount - 1);
                to = $String(k + itemCount - 1);
                if (owns(O, from)) {
                    O[to] = O[from];
                } else {
                    delete O[to];
                }
                k -= 1;
            }
        }
        k = actualStart;
        for (var i = 0; i < items.length; ++i) {
            O[k] = items[i];
            k += 1;
        }
        O.length = len - actualDeleteCount + itemCount;

        return A;
    }
}, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString');
var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
var hasStringEnumBug = !owns('x', '0');
var equalsConstructorPrototype = function (o) {
    var ctor = o.constructor;
    return ctor && ctor.prototype === o;
};
var blacklistedKeys = {
    $window: true,
    $console: true,
    $parent: true,
    $self: true,
    $frame: true,
    $frames: true,
    $frameElement: true,
    $webkitIndexedDB: true,
    $webkitStorageInfo: true
};
var hasAutomationEqualityBug = (function () {
    /* globals window */
    if (typeof window === 'undefined') { return false; }
    for (var k in window) {
        try {
            if (!blacklistedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
                equalsConstructorPrototype(window[k]);
            }
        } catch (e) {
            return true;
        }
    }
    return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (object) {
    if (typeof window === 'undefined' || !hasAutomationEqualityBug) { return equalsConstructorPrototype(object); }
    try {
        return equalsConstructorPrototype(object);
    } catch (e) {
        return false;
    }
};
var dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
];
var dontEnumsLength = dontEnums.length;

// taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
// can be replaced with require('is-arguments') if we ever use a build process instead
var isStandardArguments = function isArguments(value) {
    return toStr(value) === '[object Arguments]';
};
var isLegacyArguments = function isArguments(value) {
    return value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        !isArray(value) &&
        isCallable(value.callee);
};
var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;

defineProperties($Object, {
    keys: function keys(object) {
        var isFn = isCallable(object);
        var isArgs = isArguments(object);
        var isObject = object !== null && typeof object === 'object';
        var isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if ((isStr && hasStringEnumBug) || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                array_push.call(theKeys, $String(i));
            }
        }

        if (!isArgs) {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    array_push.call(theKeys, $String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    array_push.call(theKeys, dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = $Object.keys && (function () {
    // Safari 5.0 bug
    return $Object.keys(arguments).length === 2;
}(1, 2));
var keysHasArgumentsLengthBug = $Object.keys && (function () {
    var argKeys = $Object.keys(arguments);
    return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
}(1));
var originalKeys = $Object.keys;
defineProperties($Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(array_slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments || keysHasArgumentsLengthBug);

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000;
var negativeYearString = '-000001';
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;
var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';

defineProperties(Date.prototype, {
    toISOString: function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError('Date.prototype.toISOString called on non-finite value.');
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
            strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = '0' + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + '-' + array_slice.call(result, 0, 2).join('-') +
            'T' + array_slice.call(result, 2).join(':') + '.' +
            strSlice('000' + this.getUTCMilliseconds(), -3) + 'Z'
        );
    }
}, hasNegativeDateBug || hasSafari51DateBug);

// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = (function () {
    try {
        return Date.prototype.toJSON &&
            new Date(NaN).toJSON() === null &&
            new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
            Date.prototype.toJSON.call({ // generic
                toISOString: function () { return true; }
            });
    } catch (e) {
        return false;
    }
}());
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ES.ToPrimitive(O, hint Number).
        var O = $Object(this);
        var tv = ES.ToPrimitive(O);
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === 'number' && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        var toISO = O.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (!isCallable(toISO)) {
            throw new TypeError('toISOString property is not callable');
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(O);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    /* global Date: true */
    /* eslint-disable no-undef */
    var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;
    var secondsWithinMaxSafeUnsigned32Bit = Math.floor(maxSafeUnsigned32Bit / 1e3);
    var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());
    Date = (function (NativeDate) {
    /* eslint-enable no-undef */
        // Date.length === 7
        var DateShim = function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            var date;
            if (this instanceof NativeDate) {
                var seconds = s;
                var millis = ms;
                if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {
                    // work around a Safari 8/9 bug where it treats the seconds as signed
                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                    var sToShift = Math.floor(msToShift / 1e3);
                    seconds += sToShift;
                    millis -= sToShift * 1e3;
                }
                date = length === 1 && $String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(DateShim.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
            } else {
                date = NativeDate.apply(this, arguments);
            }
            if (!isPrimitive(date)) {
              // Prevent mixups with unfixed Date object
              defineProperties(date, { constructor: DateShim }, true);
            }
            return date;
        };

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp('^' +
            '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                                      // 6-digit extended year
            '(?:-(\\d{2})' + // optional month capture
            '(?:-(\\d{2})' + // optional day capture
            '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                    ':(\\d{2})' + // seconds capture
                    '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
            '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                    '([-+])' + // sign capture
                    '(\\d{2})' + // hours offset capture
                    ':(\\d{2})' + // minutes offset capture
                ')' +
            ')?)?)?)?' +
        '$');

        var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

        var dayFromMonth = function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        };

        var toUTC = function toUTC(t) {
            var s = 0;
            var ms = t;
            if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {
                // work around a Safari 8/9 bug where it treats the seconds as signed
                var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                var sToShift = Math.floor(msToShift / 1e3);
                s += sToShift;
                ms -= sToShift * 1e3;
            }
            return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));
        };

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            if (owns(NativeDate, key)) {
                DateShim[key] = NativeDate[key];
            }
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        defineProperties(DateShim, {
            now: NativeDate.now,
            UTC: NativeDate.UTC
        }, true);
        DateShim.prototype = NativeDate.prototype;
        defineProperties(DateShim.prototype, {
            constructor: DateShim
        }, true);

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        var parseShim = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = $Number(match[1]),
                    month = $Number(match[2] || 1) - 1,
                    day = $Number(match[3] || 1) - 1,
                    hour = $Number(match[4] || 0),
                    minute = $Number(match[5] || 0),
                    second = $Number(match[6] || 0),
                    millisecond = Math.floor($Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === '-' ? 1 : -1,
                    hourOffset = $Number(match[10] || 0),
                    minuteOffset = $Number(match[11] || 0),
                    result;
                var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;
                if (
                    hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };
        defineProperties(DateShim, { parse: parseShim });

        return DateShim;
    }(Date));
    /* global Date: false */
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
var hasToFixedBugs = NumberPrototype.toFixed && (
  (0.00008).toFixed(3) !== '0.000' ||
  (0.9).toFixed(0) !== '1' ||
  (1.255).toFixed(2) !== '1.25' ||
  (1000000000000000128).toFixed(0) !== '1000000000000000128'
);

var toFixedHelpers = {
  base: 1e7,
  size: 6,
  data: [0, 0, 0, 0, 0, 0],
  multiply: function multiply(n, c) {
      var i = -1;
      var c2 = c;
      while (++i < toFixedHelpers.size) {
          c2 += n * toFixedHelpers.data[i];
          toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
          c2 = Math.floor(c2 / toFixedHelpers.base);
      }
  },
  divide: function divide(n) {
      var i = toFixedHelpers.size, c = 0;
      while (--i >= 0) {
          c += toFixedHelpers.data[i];
          toFixedHelpers.data[i] = Math.floor(c / n);
          c = (c % n) * toFixedHelpers.base;
      }
  },
  numToString: function numToString() {
      var i = toFixedHelpers.size;
      var s = '';
      while (--i >= 0) {
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
              var t = $String(toFixedHelpers.data[i]);
              if (s === '') {
                  s = t;
              } else {
                  s += strSlice('0000000', 0, 7 - t.length) + t;
              }
          }
      }
      return s;
  },
  pow: function pow(x, n, acc) {
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
  },
  log: function log(x) {
      var n = 0;
      var x2 = x;
      while (x2 >= 4096) {
          n += 12;
          x2 /= 4096;
      }
      while (x2 >= 2) {
          n += 1;
          x2 /= 2;
      }
      return n;
  }
};

defineProperties(NumberPrototype, {
    toFixed: function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = $Number(fractionDigits);
        f = isActualNaN(f) ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = $Number(this);

        if (isActualNaN(x)) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return $String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;
            } else {
                m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    }
}, hasToFixedBugs);

//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === 't' ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
        var maxSafe32BitInt = Math.pow(2, 32) - 1;

        StringPrototype.split = function (separator, limit) {
            var string = this;
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (!isRegex(separator)) {
                return strSplit(this, separator, limit);
            }

            var output = [];
            var flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline ? 'm' : '') +
                        (separator.unicode ? 'u' : '') + // in ES6
                        (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            var separatorCopy = new RegExp(separator.source, flags + 'g');
            string += ''; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // maxSafe32BitInt
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);
            match = separatorCopy.exec(string);
            while (match) {
                // `separatorCopy.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    array_push.call(output, strSlice(string, lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        /* eslint-disable no-loop-func */
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (typeof arguments[i] === 'undefined') {
                                    match[i] = void 0;
                                }
                            }
                        });
                        /* eslint-enable no-loop-func */
                    }
                    if (match.length > 1 && match.index < string.length) {
                        array_push.apply(output, array_slice.call(match, 1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= splitLimit) {
                        break;
                    }
                }
                if (separatorCopy.lastIndex === match.index) {
                    separatorCopy.lastIndex++; // Avoid an infinite loop
                }
                match = separatorCopy.exec(string);
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separatorCopy.test('')) {
                    array_push.call(output, '');
                }
            } else {
                array_push.call(output, strSlice(string, lastLastIndex));
            }
            return output.length > splitLimit ? strSlice(output, 0, splitLimit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ('0'.split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (typeof separator === 'undefined' && limit === 0) { return []; }
        return strSplit(this, separator, limit);
    };
}

var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        array_push.call(groups, group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isCallable(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match) || [];
                searchValue.lastIndex = originalLastIndex;
                array_push.call(args, arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        var normalizedStart = start;
        if (start < 0) {
            normalizedStart = max(this.length + start, 0);
        }
        return string_substr.call(this, normalizedStart, length);
    }
}, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
    '\u2029\uFEFF';
var zeroWidth = '\u200b';
var wsRegexChars = '[' + ws + ']';
var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
defineProperties(StringPrototype, {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    trim: function trim() {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    }
}, hasTrimWhitespaceBug);

// ES-5 15.1.2.2
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
    /* global parseInt: true */
    parseInt = (function (origParseInt) {
        var hexRegex = /^0[xX]/;
        return function parseInt(str, radix) {
            var string = $String(str).trim();
            var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
            return origParseInt(string, defaultedRadix);
        };
    }(parseInt));
}

}));

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {

var call = Function.prototype.call;
var prototypeOfObject = Object.prototype;
var owns = call.bind(prototypeOfObject.hasOwnProperty);
var propertyIsEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable);
var toStr = call.bind(prototypeOfObject.toString);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle */
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
    /* eslint-enable no-underscore-dangle */
}

// ES5 15.2.3.2
// http://es5.github.com/#x15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/es-shims/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    //
    // sure, and webreflection says ^_^
    // ... this will nerever possibly return null
    // ... Opera Mini breaks here with infinite loops
    Object.getPrototypeOf = function getPrototypeOf(object) {
        /* eslint-disable no-proto */
        var proto = object.__proto__;
        /* eslint-enable no-proto */
        if (proto || proto === null) {
            return proto;
        } else if (toStr(object.constructor) === '[object Function]') {
            return object.constructor.prototype;
        } else if (object instanceof Object) {
          return prototypeOfObject;
        } else {
          // Correctly return null for Objects created with `Object.create(null)`
          // (shammed or native) or `{ __proto__: null}`.  Also returns null for
          // cross-realm objects on browsers that lack `__proto__` support (like
          // IE <11), but that's the best we can do.
          return null;
        }
    };
}

// ES5 15.2.3.3
// http://es5.github.com/#x15.2.3.3

var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {
    try {
        object.sentinel = 0;
        return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
    } catch (exception) {
        return false;
    }
};

// check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
if (Object.defineProperty) {
    var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
    var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||
    doesGetOwnPropertyDescriptorWork(document.createElement('div'));
    if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
        var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
    }
}

if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
    var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';

    /* eslint-disable no-proto */
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object !== 'object' && typeof object !== 'function') || object === null) {
            throw new TypeError(ERR_NON_OBJECT + object);
        }

        // make a valiant attempt to use the real getOwnPropertyDescriptor
        // for I8's DOM elements.
        if (getOwnPropertyDescriptorFallback) {
            try {
                return getOwnPropertyDescriptorFallback.call(Object, object, property);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        var descriptor;

        // If object does not owns property return undefined immediately.
        if (!owns(object, property)) {
            return descriptor;
        }

        // If object has a property then it's for sure `configurable`, and
        // probably `enumerable`. Detect enumerability though.
        descriptor = {
            enumerable: propertyIsEnumerable(object, property),
            configurable: true
        };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            var notPrototypeOfObject = object !== prototypeOfObject;
            // avoid recursion problem, breaking in Opera Mini when
            // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
            // or any other Object.prototype accessor
            if (notPrototypeOfObject) {
                object.__proto__ = prototypeOfObject;
            }

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            if (notPrototypeOfObject) {
                // Once we have getter and setter we can put values back.
                object.__proto__ = prototype;
            }

            if (getter || setter) {
                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }
                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        descriptor.writable = true;
        return descriptor;
    };
    /* eslint-enable no-proto */
}

// ES5 15.2.3.4
// http://es5.github.com/#x15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({ __proto__: null } instanceof Object);
                        // the following produces false positives
                        // in Opera Mini => not a reliable check
                        // Object.prototype.__proto__ === null

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    /* global ActiveXObject */
    var shouldUseActiveX = function shouldUseActiveX() {
        // return early if document.domain not set
        if (!document.domain) {
            return false;
        }

        try {
            return !!new ActiveXObject('htmlfile');
        } catch (exception) {
            return false;
        }
    };

    // This supports IE8 when document.domain is used
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    var getEmptyViaActiveX = function getEmptyViaActiveX() {
        var empty;
        var xDoc;

        xDoc = new ActiveXObject('htmlfile');

        xDoc.write('<script><\/script>');
        xDoc.close();

        empty = xDoc.parentWindow.Object.prototype;
        xDoc = null;

        return empty;
    };

    // The original implementation using an iframe
    // before the activex approach was added
    // see https://github.com/es-shims/es5-shim/issues/150
    var getEmptyViaIFrame = function getEmptyViaIFrame() {
        var iframe = document.createElement('iframe');
        var parent = document.body || document.documentElement;
        var empty;

        iframe.style.display = 'none';
        parent.appendChild(iframe);
        /* eslint-disable no-script-url */
        iframe.src = 'javascript:';
        /* eslint-enable no-script-url */

        empty = iframe.contentWindow.Object.prototype;
        parent.removeChild(iframe);
        iframe = null;

        return empty;
    };

    /* global document */
    if (supportsProto || typeof document === 'undefined') {
        createEmpty = function () {
            return { __proto__: null };
        };
    } else {
        // In old IE __proto__ can't be used to manually set `null`, nor does
        // any other method exist to make an object that inherits from nothing,
        // aside from Object.prototype itself. Instead, create a new global
        // object and *steal* its Object.prototype and strip it bare. This is
        // used as the prototype to create nullary objects.
        createEmpty = function () {
            // Determine which approach to use
            // see https://github.com/es-shims/es5-shim/issues/150
            var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

            delete empty.constructor;
            delete empty.hasOwnProperty;
            delete empty.propertyIsEnumerable;
            delete empty.isPrototypeOf;
            delete empty.toLocaleString;
            delete empty.toString;
            delete empty.valueOf;

            var Empty = function Empty() {};
            Empty.prototype = empty;
            // short-circuit future calls
            createEmpty = function () {
                return new Empty();
            };
            return new Empty();
        };
    }

    Object.create = function create(prototype, properties) {

        var object;
        var Type = function Type() {}; // An empty constructor.

        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype !== 'object' && typeof prototype !== 'function') {
                // In the native implementation `parent` can be `null`
                // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                // like they are in modern browsers. Using `Object.create` on DOM elements
                // is...err...probably inappropriate, but the native version allows for it.
                throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
            }
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            /* eslint-disable no-proto */
            object.__proto__ = prototype;
            /* eslint-enable no-proto */
        }

        if (properties !== void 0) {
            Object.defineProperties(object, properties);
        }

        return object;
    };
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, 'sentinel', {});
        return 'sentinel' in object;
    } catch (exception) {
        return false;
    }
};

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' ||
        doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty,
            definePropertiesFallback = Object.defineProperties;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object !== 'object' && typeof object !== 'function') || object === null) {
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        }
        if ((typeof descriptor !== 'object' && typeof descriptor !== 'function') || descriptor === null) {
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        }
        // make a valiant attempt to use the real defineProperty
        // for I8's DOM elements.
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        // If it's a data property.
        if ('value' in descriptor) {
            // fail silently if 'writable', 'enumerable', or 'configurable'
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                ('writable' in descriptor && !descriptor.writable) ||
                ('enumerable' in descriptor && !descriptor.enumerable) ||
                ('configurable' in descriptor && !descriptor.configurable)
            ))
                throw new RangeError(
                    'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                /* eslint-disable no-proto */
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
                /* eslint-enable no-proto */
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors && (('get' in descriptor) || ('set' in descriptor))) {
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            }
            // If we got that far then getters and setters can be defined !!
            if ('get' in descriptor) {
                defineGetter(object, property, descriptor.get);
            }
            if ('set' in descriptor) {
                defineSetter(object, property, descriptor.set);
            }
        }
        return object;
    };
}

// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (!Object.defineProperties || definePropertiesFallback) {
    Object.defineProperties = function defineProperties(object, properties) {
        // make a valiant attempt to use the real defineProperties
        if (definePropertiesFallback) {
            try {
                return definePropertiesFallback.call(Object, object, properties);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        Object.keys(properties).forEach(function (property) {
            if (property !== '__proto__') {
                Object.defineProperty(object, property, properties[property]);
            }
        });
        return object;
    };
}

// ES5 15.2.3.8
// http://es5.github.com/#x15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.seal can only be called on Objects.');
        }
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
// http://es5.github.com/#x15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.freeze can only be called on Objects.');
        }
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function (freezeObject) {
        return function freeze(object) {
            if (typeof object === 'function') {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    }(Object.freeze));
}

// ES5 15.2.3.10
// http://es5.github.com/#x15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.preventExtensions can only be called on Objects.');
        }
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
// http://es5.github.com/#x15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.isSealed can only be called on Objects.');
        }
        return false;
    };
}

// ES5 15.2.3.12
// http://es5.github.com/#x15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        if (Object(object) !== object) {
            throw new TypeError('Object.isFrozen can only be called on Objects.');
        }
        return false;
    };
}

// ES5 15.2.3.13
// http://es5.github.com/#x15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        // 1. If Type(O) is not Object throw a TypeError exception.
        if (Object(object) !== object) {
            throw new TypeError('Object.isExtensible can only be called on Objects.');
        }
        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}

}));

(function() {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };
})();

define("promise/all", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @for RSVP
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    function all(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && isFunction(promise.then)) {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }

    __exports__.all = all;
  });
define("promise/asap", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }

    __exports__.asap = asap;
  });
define("promise/config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {
      instrument: false
    };

    function configure(name, value) {
      if (arguments.length === 2) {
        config[name] = value;
      } else {
        return config[name];
      }
    }

    __exports__.config = config;
    __exports__.configure = configure;
  });
define("promise/polyfill", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*global self*/
    var RSVPPromise = __dependency1__.Promise;
    var isFunction = __dependency2__.isFunction;

    function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport = 
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = RSVPPromise;
      }
    }

    __exports__.polyfill = polyfill;
  });
define("promise/promise", 
  ["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var configure = __dependency1__.configure;
    var objectOrFunction = __dependency2__.objectOrFunction;
    var isFunction = __dependency2__.isFunction;
    var now = __dependency2__.now;
    var all = __dependency3__.all;
    var race = __dependency4__.race;
    var staticResolve = __dependency5__.resolve;
    var staticReject = __dependency6__.reject;
    var asap = __dependency7__.asap;

    var counter = 0;

    config.async = asap; // default async is asap;

    function Promise(resolver) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._subscribers = [];

      invokeResolver(resolver, this);
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      then: function(onFulfillment, onRejection) {
        var promise = this;

        var thenPromise = new this.constructor(function() {});

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        return thenPromise;
      },

      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    Promise.all = all;
    Promise.race = race;
    Promise.resolve = staticResolve;
    Promise.reject = staticReject;

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      publish(promise, promise._state = REJECTED);
    }

    __exports__.Promise = Promise;
  });
define("promise/race", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */
    var isArray = __dependency1__.isArray;

    /**
      `RSVP.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    function race(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to race.');
      }
      return new Promise(function(resolve, reject) {
        var results = [], promise;

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    }

    __exports__.race = race;
  });
define("promise/reject", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    function reject(reason) {
      /*jshint validthis:true */
      var Promise = this;

      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }

    __exports__.reject = reject;
  });
define("promise/resolve", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function resolve(value) {
      /*jshint validthis:true */
      if (value && typeof value === 'object' && value.constructor === this) {
        return value;
      }

      var Promise = this;

      return new Promise(function(resolve) {
        resolve(value);
      });
    }

    __exports__.resolve = resolve;
  });
define("promise/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x) {
      return typeof x === "function";
    }

    function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };


    __exports__.objectOrFunction = objectOrFunction;
    __exports__.isFunction = isFunction;
    __exports__.isArray = isArray;
    __exports__.now = now;
  });
requireModule('promise/polyfill').polyfill();
}());
var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util = (function (util) {
    /**
     * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
     *
     * @method generateId
     * @static
     * @return {String}
     */
    util.generateId = function () {
        return Math.floor(Math.random() * 0xffffffff).toString(16);
    };

    /**
     * Used to get the current epoch time.  Tests overrides this
     * to allow a fast-forward on time-based actions.
     *
     * @method now
     * @return {Number}
     */
    util.now = function () {
        return new Date().getTime();
    };

    /**
     * Applies the template using the supplied object for values
     *
     * @method resolveUriTemplate
     * @param {string} template The template to use
     * @param {Object} obj The object to get template paramters from
     * @param {Object} fallback A secondary object for parameters not contained by the first
     * @return {Number}
     */
    util.resolveUriTemplate = function (template, obj, fallback) {
        var converters = {
            "+": function (a) { return a;},
            "": function (a) { return encodeURIComponent(a);}
        };
        var t = template.replace(/\{([\+\#\.\/\;\?\&]?)(.+?)\}/g, function (match, type, name) {
            return converters[type](obj[name] || fallback[name]);
        });
        // look for the :// of the protocol
        var protocolOffset = t.indexOf("://");
        // if we found it, set the offset to the end.  otherwise, leave it
        // at -1 so that a leading "//" will be replaced, below
        if (protocolOffset > 0) {
            protocolOffset += 3;
        }

        // remove double // that show up after the protocolOffset
        return t.replace(/\/\//g, function (m, offset) {
            // only swap it after the protocol
            if (offset > protocolOffset) {
                return "/";
            } else {
                return m;
            }
        });
    };

    /**
     * A record of event listeners used in the given IWC context. Grouped by type.
     *
     * @property eventListeners
     * @static
     * @type {Object}
     */
    util.eventListeners = {};

    /**
     * Adds an event listener to the window and stores its listener in ozpIwc.util.eventListeners.
     *
     * @method addEventListener
     * @param {String} type the event to listen to
     * @param {Function} listener the callback to be used upon the event being emitted
     */
    util.addEventListener = function (type, listener) {
        var l = util.eventListeners[type];
        if (!l) {
            l = util.eventListeners[type] = [];
        }
        l.push(listener);
        window.addEventListener(type, listener);
    };

    /**
     * Removes an event listener from the window and from ozpIwc.util.eventListeners
     * @param {String} type the event to remove the listener from
     * @param {Function} listener the callback to unregister
     */
    util.removeEventListener = function (type, listener) {
        var l = util.eventListeners[type];
        if (l) {
            util.eventListeners[type] = l.filter(function (v) { return v !== listener;});
        }
        window.removeEventListener(type, listener);
    };

    /**
     * Removes all event listeners registered in ozpIwc.util.eventListeners
     * @param {String} type the event to remove the listener from
     * @param {Function} listener the callback to unregister
     * @param {Boolean} [useCapture] if true all events of the specified type will be dispatched to the registered
     *     listener before being dispatched to any EventTarget beneath it in the DOM tree. Events which are bubbling
     *     upward through the tree will not trigger a listener designated to use capture.
     */
    util.purgeEventListeners = function () {
        ozpIwc.util.object.eachEntry(util.eventListeners, function (type, listenerList) {
            listenerList.forEach(function (listener) {
                window.removeEventListener(type, listener);
            });
        });
        util.eventListeners = {};
    };

    /**
     * Create a class with the given parent in it's prototype chain.
     *
     * @method extend
     * @param {Function} baseClass The class being derived from.
     * @param {Function} newConstructor The new base class.
     *
     * @return {Function} New Constructor with an augmented prototype.
     */
    util.extend = function (baseClass, newConstructor) {
        if (!baseClass || !baseClass.prototype) {
            ozpIwc.log.error("Cannot create a new class for ", newConstructor, " due to invalid baseclass:", baseClass);
            throw new Error("Cannot create a new class due to invalid baseClass.  Dependency not loaded first?");
        }
        newConstructor.prototype = Object.create(baseClass.prototype);
        newConstructor.prototype.constructor = newConstructor;
        return newConstructor;
    };

    /**
     * Invoke postMessage on a given window in a safe manner. Test whether the browser
     * supports structured clones, and stringifies the message if not. Catches
     * errors (especially attempts to send non-cloneable objects), and tries to
     * send a stringified copy of the message asa fallback.
     *
     * @param window a window on which to invoke postMessage
     * @param msg the message to be sent
     * @param origin the target origin. The message will be sent only if it matches the origin of window.
     */
    util.safePostMessage = function (window, msg, origin) {
        try {
            var data = msg;
            if (!util.structuredCloneSupport() && typeof data !== 'string') {
                data = JSON.stringify(msg);
            }
            window.postMessage(data, origin);
        } catch (e) {
            try {
                window.postMessage(JSON.stringify(msg), origin);
            } catch (e) {
                ozpIwc.log.debug("Invalid call to window.postMessage: " + e.message);
            }
        }
    };

    /**
     * Detect browser support for structured clones. Returns quickly since it
     * caches the result. This method only determines browser support for structured
     * clones. Clients are responsible, when accessing capabilities that rely on structured
     * cloning, to ensure that objects to be cloned meet the criteria of the structured clone
     * algorithm. (See ozpIwc.util.safePostMessage for a method which handles attempts to
     * clone an invalid object.). NB: a bug in FF will cause file objects to be treated as
     * non-cloneable, even in FF versions that support structured clones.
     * (see https://bugzilla.mozilla.org/show_bug.cgi?id=722126).
     *
     * @private
     * @method structuredCloneSupport
     * @return {Boolean} True if structured clones are supported, false otherwise.
     */
    util.structuredCloneSupport = function () {
        if (util.structuredCloneSupportCache !== undefined) {
            return util.structuredCloneSupportCache;
        }
        var cloneSupport = 'postMessage' in window;
        //If the browser doesn't support structured clones, it will call toString() on the object passed to postMessage.
        try {
            window.postMessage({
                toString: function () {
                    cloneSupport = false;
                }
            }, "*");
        } catch (e) {
            //exception expected: objects with methods can't be cloned
            //e.DATA_CLONE_ERR will exist only for browsers with structured clone support, which can be used as an
            // additional check if needed
        }
        util.structuredCloneSupportCache = cloneSupport;
        return util.structuredCloneSupportCache;
    };

    /**
     * Does a deep clone of a serializable object.  Note that this will not
     * clone unserializable objects like DOM elements, Date, RegExp, etc.
     *
     * @method clone
     * @param {Array|Object} value The value to be cloned.
     * @return {Array|Object}  a deep copy of the object
     */
    util.clone = function (value) {
        if (Array.isArray(value) || typeof(value) === 'object') {
            try {
                return JSON.parse(JSON.stringify(value));
            } catch (e) {
                ozpIwc.log.error(e);
            }
        } else {
            return value;
        }
    };

    /**
     * A regex method to parse query parameters.
     *
     * @method parseQueryParams
     * @param {String} query
     *
     */
    util.parseQueryParams = function (query) {
        query = query || window.location.search;
        var params = {};
        var regex = /\??([^&=]+)=?([^&]*)/g;
        var match;
        while ((match = regex.exec(query)) !== null) {
            params[match[1]] = decodeURIComponent(match[2]);
        }
        return params;
    };

    /**
     * Adds params to the query string of the given url. Accepts objects, preformed query strings, and arrays of query
     * params.
     *
     * @method addQueryParams
     * @param {String} url
     * @param {String|Object|Array} params
     * @return {String}
     */
    util.addQueryParams = function (url, params) {
        if (typeof url !== "string") {
            throw new Error("url should be a string.");
        }

        var formattedParams = {};
        switch (typeof params) {
            case "object":
                // if in array form ["a=true","b=en_us",...]
                if (Array.isArray(params)) {
                    if (params.length === 0) {
                        return url;
                    }
                    for (var i in params) {
                        if (typeof params[i] === "string") {
                            var p = util.parseQueryParams(params[i]);
                            for (var j in p) {
                                formattedParams[j] = p[j];
                            }
                        }
                    }
                } else {
                    if (Object.keys(params).length === 0) {
                        return url;
                    }
                    // if in object form {a:true, b:"en_us",...}
                    formattedParams = params;
                }
                break;
            case "undefined":
                return url;

            default:
                if (params.length === 0) {
                    return url;
                }
                // if in string form "?a=true&b=en_us&..."
                formattedParams = util.parseQueryParams(params);
                break;
        }
        var hash = "";
        // Separate the hash temporarily (if exists)
        var hashSplit = url.split("#");
        if (hashSplit.length > 2) {
            throw new Error("Invalid url.");
        } else {
            url = hashSplit[0];
            hash = hashSplit[1] || "";
        }

        //if the url has no query params  we append the initial "?"
        if (url.indexOf("?") === -1) {
            url += "?";
        } else {
            url += "&";
        }
        //skip on first iteration
        var ampersand = "";
        for (var k in formattedParams) {
            url += ampersand + k + "=" + formattedParams[k];
            ampersand = "&";
        }

        if (hash.length > 0) {
            url += "#" + hash;
        }

        return url;
    };

    /**
     * A mapping for common protocols and their ports.
     * @property protocolPorts
     * @type {Object}
     */
    util.protocolPorts = {
        "http:": "80",
        "https:": "443",
        "ws:": "80",
        "wss:": "443"
    };

    /**
     * Determines the origin of a given url.
     * @method determineOrigin
     * @param url
     * @return {String}
     */
    util.determineOrigin = function (url) {
        var a = document.createElement("a");
        a.href = url;
        if (a.origin) {
            return a.origin;
        }
        var origin = a.protocol + "//" + a.hostname;
        /* Internet Explorer adds the port to urls in <a> tags created by a script, even
         * if it wasn't there to start with.  Thanks, IE!
         * https://connect.microsoft.com/IE/feedback/details/817343/ie11-scripting-value-of-htmlanchorelement-host-differs-between-script-created-link-and-link-from-document
         *
         * Other browsers seem to drop the port if it's the default, so we'll do the same.
         */

        if (a.port && util.protocolPorts[a.protocol] !== a.port) {
            origin += ":" + a.port;
        }
        return origin;
    };

    /**
     * Escapes regular expression characters in a string.
     * @method escapeRegex
     * @param {String} str
     * @return {String}
     */
    util.escapeRegex = function (str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    /**
     *
     * @method parseOzpUrl
     * @param {type} url
     * @return {ozpIwc.packet.Transport}
     */
    util.parseOzpUrl = function (url) {
        var m = /^(?:(?:web\+ozp|ozp):\/\/)?([0-9a-zA-Z](?:[-.\w])*)(\/[^?#]*)(\?[^#]*)?(#.*)?$/.exec(decodeURIComponent(url));
        if (m) {
            // an action of "get" is implied
            var packet = {
                'dst': m[1],
                'resource': m[2],
                'action': "get"
            };
            // TODO: parse the query params into fields

            return packet;
        }
        return null;
    };

    /**
     * Returns true if the specified packet meets the criteria of an IWC Packet.
     * @method isIwcPacket
     * @static
     * @param {ozpIwc.packet.Transport} packet
     * @return {Boolean}
     */
    util.isIWCPacket = function (packet) {
        if (typeof packet.src !== "string" || typeof packet.dst !== "string" ||
            typeof packet.ver !== "number" || typeof packet.msgId !== "string") {
            return false;
        } else {
            return true;
        }
    };

    /**
     * Returns the version of Internet Explorer or a -1
     * (indicating the use of another browser).
     * @return {number}
     */
    util.getInternetExplorerVersion = function () {
        var rv = -1; // Return value assumes failure.
        var ua, re;
        if (navigator.appName === 'Microsoft Internet Explorer') {
            ua = navigator.userAgent;
            re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        } else if (navigator.appName === 'Netscape') {
            ua = navigator.userAgent;
            re = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/;
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    };

    /**
     * A promise that resolves when the document is past its prerender state.
     * @method prerender
     * @static
     * @return {Promise}
     */
    util.prerender = function () {
        if (util.runningInWorker()) {
            return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
            if (document === undefined || document.visibilityState === undefined || (document.visibilityState !== "prerender" &&
                document.visibilityState !== "unload")) {
                resolve();
            } else {
                document.addEventListener("visibilitychange", function runOnce(e) {
                    if (document.visibilityState !== "prerender") {
                        document.removeEventListener(runOnce);
                        resolve();
                    }
                });
            }
        });
    };

    var runningInWorkerCache = (typeof WorkerGlobalScope !== 'undefined' && this instanceof WorkerGlobalScope);
    /**
     * A utility to determine if this code is running in a HTML5 Worker. Used to decide on browser technologies
     * to use.
     * @method runningInWorker
     * @static
     * @return {Boolean}
     */
    util.runningInWorker = function () {
        return runningInWorkerCache;
    };

    /**
     * Wraps window.open.  If the bus is running in a worker, then
     * it doesn't have access to the window object and needs help from
     * a participant.
     * @see window.open documentation for what the parameters actually do
     *
     * @method openWindow
     * @static
     * @param {String} url The URL to open in a new window
     * @param {String} windowName The window name to open with.
     * @param {String} [features] The window features.
     */
    util.openWindow = function (url, windowName, features) {
        if (typeof windowName === "object") {
            var str = "";
            for (var k in windowName) {
                str += k + "=" + encodeURIComponent(windowName[k]) + "&";
            }
            windowName = str;
        }
        try {
            window.open(url, windowName, features);
        } catch (e) {
            //fallback for IE
            window.open(url + "?" + windowName, null, features);
        }
    };

    return util;
}(ozpIwc.util || {}));








var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * A Static collection of api to address/actions mapping.
 *
 * @class apiMap
 * @namespace ozpIwc
 * @static
 * @type {Object}
 */
ozpIwc.apiMap = {
    /**
     * @property data.api
     * @type Object
     */
    "data.api": {
        'address': 'data.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "addChild", "removeChild"]
    },

    /**
     * @property intents.api
     * @type Object
     */
    "intents.api": {
        'address': 'intents.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "register", "invoke", "broadcast"]
    },

    /**
     * @property names.api
     * @type Object
     */
    "names.api": {
        'address': 'names.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet"]
    },

    /**
     * @property system.api
     * @type Object
     */
    "system.api": {
        'address': 'system.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "launch"]
    },

    /**
     * @property locks.api
     * @type Object
     */
    "locks.api": {
        'address': 'locks.api',
        'actions': ["get", "watch", "unwatch", "list", "lock", "unlock"]
    }
};
var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.ApiPromiseMixin = (function (apiMap, log, util) {
    /**
     * @class ApiPromiseMixin
     * @namespace ozpIwc.util
     * @static
     * Augments a participant or connection that supports basic IWC communications
     * functions for sending and receiving.
     * @uses ozpIwc.util.Event
     * @param {ozpIwc.transport.participant.Base} participant
     * @param {Boolean} autoConnect
     */
    var ApiPromiseMixin = function (participant, autoConnect) {
        autoConnect = (typeof autoConnect === "undefined" || autoConnect);

        participant.address = participant.address || "$nobody";
        participant.connect = participant.connect || function () {
                participant.connectPromise = Promise.resolve();

                return participant.connectPromise;
            };

        if (!participant.events) {
            participant.events = new util.Event();
            participant.events.mixinOnOff(participant);
        }

        var mixins = ApiPromiseMixin.getCore();
        for (var i in mixins) {
            participant[i] = mixins[i];
        }

        participant.readLaunchParams(window.name);
        participant.readLaunchParams(window.location.search);
        participant.readLaunchParams(window.location.hash);

        ApiPromiseMixin.registerEvents(participant);

        participant.constructApiFunctions();

        if (autoConnect) {
            participant.connect();
        }
    };

    /**
     * Registers event listeners for the participant.  Listens for the following events: disconnect.
     * @method registerEvents
     * @static
     * @param {ozpIwc.transport.participant.Base} participant
     */
    ApiPromiseMixin.registerEvents = function (participant) {
        participant.on("disconnect", function () {
            participant.promiseCallbacks = {};
            participant.registeredCallbacks = {};
            window.removeEventListener("message", participant.postMessageHandler, false);
            participant.connectPromise = null;
        });
    };

    /**
     * A factory for the apiPromise functionality.
     *
     * @method getCore
     * @static
     * @return {Object}
     */
    ApiPromiseMixin.getCore = function () {
        return {

            /**
             * @property promiseCallbacks
             * @type Object
             * @default {}
             */
            promiseCallbacks: {},

            /**
             * @property msgIdSequence
             * @type Number
             * @default 0
             */
            msgIdSequence: 0,

            /**
             * @property receivedPackets
             * @type Number
             * @default 0
             */
            receivedPackets: 0,

            /**
             * @property receivedBytes
             * @type Number
             * @default 0
             */
            receivedBytes: 0,

            /**
             * @property sentPackets
             * @type Number
             * @default 0
             */
            sentPackets: 0,

            /**
             * @property sentBytes
             * @type Number
             * @default 0
             */
            sentBytes: 0,

            /**
             * The epoch time the Client was instantiated.
             * @property startTime
             * @type Number
             */
            startTime: util.now(),

            /**
             * A map of available apis and their actions.
             * @property apiMap
             * @type Object
             */
            apiMap: apiMap || {},

            /**
             * @property wrapperMap
             * @type Object
             * @default {}
             */
            wrapperMap: {},

            /**
             * @property preconnectionQueue
             * @type Array
             * @default []
             */
            preconnectionQueue: [],

            /**
             * @property launchParams
             * @type Object
             * @default {}
             */
            launchParams: {},

            /**
             * @property watchMsgMap
             * @type Object
             * @default {}
             */
            watchMsgMap: {},

            /**
             * @property registeredCallbacks
             * @type Object
             * @default {}
             */
            registeredCallbacks: {},

            /**
             * @property launchedIntents
             * @type Array
             * @default []
             */
            launchedIntents: [],

            /**
             * Returns whether or not the participant is connected to the IWC bus.
             *
             * @method isConnected
             * @return {Boolean}
             */
            isConnected: function () {
                return this.address !== "$nobody";
            },

            /**
             * Parses launch parameters based on the raw string input it receives.
             *
             * @method readLaunchParams
             * @param {String} rawString
             */
            readLaunchParams: function (rawString) {
                // of the form ozpIwc.VARIABLE=VALUE, where:
                //   VARIABLE is alphanumeric + "_"
                //   VALUE does not contain & or #
                var re = /ozpIwc.(\w+)=([^&#]+)/g;
                var m;
                while ((m = re.exec(rawString)) !== null) {
                    var params = decodeURIComponent(m[2]);
                    try {
                        params = JSON.parse(params);
                    } catch (e) {
                        // ignore the errors and just pass through the string
                    }
                    this.launchParams[m[1]] = params;
                }
            },

            /**
             * Receive a packet from the connected peer.  If the packet is a reply, then
             * the callback for that reply is invoked.  Otherwise, it fires a receive event
             *
             * Fires:
             *     - {{#crossLink "ozpIwc.Client/receive:event}}{{/crossLink}}
             *
             * @method receive
             * @protected
             * @param {ozpIwc.packet.Transport} packetContext
             */
            receiveFromRouterImpl: function (packetContext) {
                var handled = false;

                // If no packet, it is likely a $transport packet.
                var packet = packetContext.packet || packetContext;
                //Try and handle this packet as a reply message
                if (packet.replyTo && this.promiseCallbacks[packet.replyTo]) {

                    var replyCancel = false;
                    var replyDone = function () {
                        replyCancel = true;
                    };
                    this.promiseCallbacks[packet.replyTo](packet, replyDone);

                    if (replyCancel) {
                        this.cancelPromiseCallback(packet.replyTo);
                        handled = true;
                    }

                }

                //Try and handle this packet as callback message
                if (!handled && packet.replyTo && this.registeredCallbacks[packet.replyTo]) {

                    var registeredCancel = false;
                    var registeredDone = function () {
                        registeredCancel = true;
                    };

                    handled = this.registeredCallbacks[packet.replyTo](packet, registeredDone);
                    if (registeredCancel) {
                        if (this.watchMsgMap[packet.replyTo] && this.watchMsgMap[packet.replyTo].action === "watch") {
                            this.api(this.watchMsgMap[packet.replyTo].dst).unwatch(this.watchMsgMap[packet.replyTo].resource);
                        }
                        this.cancelRegisteredCallback(packet.replyTo);
                    }
                }
                if (!handled) {
                    // Otherwise trigger "receive" for someone to handle it
                    this.events.trigger("receive", packetContext);
                }
            },

            /**
             * Builds the client api calls from the values in client.apiMap
             *
             * @method constructApiFunctions
             */
            constructApiFunctions: function () {
                for (var api in this.apiMap) {
                    var apiObj = this.apiMap[api];
                    var apiFuncName = apiObj.address.replace('.api', '');

                    //prevent overriding client constructed fields, but allow updating of constructed APIs
                    if (!this.hasOwnProperty(apiFuncName) || this.apiMap[api].functionName === apiFuncName) {
                        // wrap this in a function to break the closure
                        // on apiObj.address that would otherwise register
                        // everything for the last api in the list
                        /*jshint loopfunc:true*/
                        (function (self, addr) {
                            self[apiFuncName] = function () {
                                return self.api(addr);
                            };
                            self.apiMap[addr] = self.apiMap[addr] || {};
                            self.apiMap[addr].functionName = apiFuncName;
                            self.updateApi(addr);
                        })(this, apiObj.address);
                    }
                }
            },

            /**
             * Calls the names.api to gather the /api/* resources to gain knowledge of available api actions of the
             * current bus.
             *
             * @method gatherApiInformation
             * @return {Promise}
             */
            gatherApiInformation: function () {
                var self = this;
                // gather api information
                return this.send({
                    dst: "names.api",
                    action: "get",
                    resource: "/api"
                }).then(function (reply) {
                    if (reply.response === 'ok') {
                        return reply.entity;
                    } else {
                        throw reply.response;
                    }
                }).then(function (apis) {
                    var promiseArray = [];
                    apis.forEach(function (api) {
                        var promise = self.send({
                            dst: "names.api",
                            action: "get",
                            resource: api
                        }).then(function (res) {
                            if (res.response === 'ok') {
                                var name = api.replace('/api/', '');
                                self.apiMap[name] = self.apiMap[name] || {};
                                self.apiMap[name].address = name;
                                self.apiMap[name].actions = res.entity.actions;
                            } else {
                                throw res.response;
                            }
                        });
                        promiseArray.push(promise);
                    });
                    return Promise.all(promiseArray);
                });
            },

            /**
             * Cancel a reply callback registration.
             * @method cancelPromiseCallback
             * @param (String} msgId The packet replyTo ID for which the callback was registered.
             *
             * @return {Boolean} True if the cancel was successful, otherwise false.
             */
            cancelPromiseCallback: function (msgId) {
                var success = false;
                if (msgId) {
                    delete this.promiseCallbacks[msgId];
                    success = true;
                }
                return success;
            },

            /**
             * Cancel a watch callback registration.
             *
             * @method cancelRegisteredCallback
             * @param (String} msgId The packet replyTo ID for which the callback was registered.
             *
             * @return {Boolean} True if the cancel was successful, otherwise false.
             */
            cancelRegisteredCallback: function (msgId) {
                var success = false;
                if (msgId) {
                    delete this.registeredCallbacks[msgId];
                    delete this.watchMsgMap[msgId];
                    success = true;
                }
                return success;
            },

            /**
             * Registers callbacks
             *
             * @method on
             * @param {String} event The event to call the callback on.
             * @param {Function} callback The function to be called.
             *
             */
            on: function (event, callback) {
                if (event === "connected" && this.isConnected()) {
                    callback(this);
                    return;
                }
                return this.events.on.apply(this.events, arguments);
            },

            /**
             * De-registers callbacks
             *
             * @method off
             * @param {String} event The event to call the callback on.
             * @param {Function} callback The function to be called.
             *
             */
            off: function (event, callback) {
                return this.events.off.apply(this.events, arguments);
            },

            /**
             * Handles intent invocation packets. Communicates back with the intents.api to operate the in flight
             * intent
             * state machine.
             *
             * @method intentInvocationHandling
             * @param resource {String} The resource of the packet that sent the intent invocation
             * @param inFlightIntent {Object} The in flight intent, used internally to operate the in flight intent
             *     state machine
             * @param callback {Function} The intent handler's callback function
             * @return {Promise}
             */
            intentInvocationHandling: function (packet, inFlightIntent, callback) {
                var self = this;
                var res;
                var promiseChain;
                callback = callback || function () {};
                inFlightIntent = inFlightIntent || {};
                if (inFlightIntent.entity) {
                    promiseChain = Promise.resolve(inFlightIntent);
                } else {
                    promiseChain = self.send({
                        dst: "intents.api",
                        action: "get",
                        resource: inFlightIntent.resource
                    });
                }
                return promiseChain.then(function (inFlightIntentRes) {
                    res = inFlightIntentRes;
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            handler: {
                                resource: packet.resource,
                                address: self.address
                            },
                            state: "running"
                        }
                    });
                }).then(function () {
                    // Run the intent handler. Wrapped in a promise chain in case the callback itself is async.
                    return callback(res.entity,inFlightIntent);
                }).then(function (result) {
                    // Allow the callback to override the intent state (usefull for preventing intent resolution if
                    // chained operations are performed.
                    if(result && result.intentIncomplete){
                        return Promise.resolve();
                    }
                    // Respond to the inflight resource
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            reply: {
                                'entity': result || {},
                                'contentType': res.entity.intent.type
                            },
                            state: "complete"
                        }
                    });
                })['catch'](function (e) {
                    log.error("Error in handling intent: ", e, " -- Reporting error on in-flight intent node:",
                        res.resource);
                    // Respond to the inflight resource
                    return self.send({
                        dst: "intents.api",
                        contentType: res.contentType,
                        action: "set",
                        resource: res.resource,
                        entity: {
                            reply: {
                                'entity': e || {},
                                'contentType': res.entity.intent.type
                            },
                            state: "error"
                        }
                    });
                });
            },

            /**
             * Calls the specific api wrapper given an api name specified.
             * If the wrapper does not exist it is created.
             *
             * @method api
             * @param apiName {String} The name of the api.
             * @return {Function} returns the wrapper call for the given api.
             */
            api: function (apiName) {
                return this.wrapperMap[apiName] || this.updateApi(apiName);
            },
            /**
             * Updates the wrapper map for api use. Whenever functionality is added or removed from the apiMap the
             * updateApi must be called to reflect said changes on the wrapper map.
             *
             * @method updateApi
             * @param apiName {String} The name of the api
             * @return {Function} returns the wrapper call for the given api.
             */
            updateApi: function (apiName) {

                /**
                 * Function generator. Generates API functions given a messageBuilder function.
                 * @method augment
                 * @param messageBuilder
                 * @param client
                 * @return {Function}
                 */
                var augment = function (messageBuilder, client) {
                    return function (resource, fragment, otherCallback) {
                        var message = messageBuilder(resource, fragment, otherCallback);
                        var packet = message.packet;


                        if (packet.dst === "intents.api" && packet.action === "register") {
                            for (var i in client.launchedIntents) {
                                var loadedResource = '/' + client.launchedIntents[i].entity.intent.type + '/' + client.launchedIntents[i].entity.intent.action;
                                if (resource === loadedResource) {
                                    client.intentInvocationHandling(packet, client.launchedIntents[i], message.callback);
                                    delete client.launchedIntents[i];
                                }
                            }
                        }
                        return client.send(packet, message.callback);
                    };
                };

                /**
                 * Function generator. Generates API message formatting functions for a client-destination-action
                 * pairing. These are generated for bulk sending capabilities, since the message needs to be formatted
                 * but not transmitted until desired.
                 *
                 * @method messageBuilderAugment
                 * @param dst
                 * @param action
                 * @param client
                 * @return {Function}
                 */
                var messageBuilderAugment = function (dst, action, client) {
                    return function (resource, fragment, otherCallback) {
                        // If a fragment isn't supplied argument #2 should be a callback (if supplied)
                        if (typeof fragment === "function") {
                            otherCallback = fragment;
                            fragment = {};
                        }
                        var packet = {
                            'dst': dst,
                            'action': action,
                            'resource': resource,
                            'entity': {}
                        };
                        for (var k in fragment) {
                            packet[k] = fragment[k];
                        }
                        var resolve, reject;
                        var sendData = new Promise(function (res, rej) {
                            resolve = res;
                            reject = rej;
                        });

                        sendData.packet = client.fixPacket(packet);
                        sendData.callback = otherCallback;
                        sendData.res = resolve;
                        sendData.rej = reject;
                        return sendData;
                    };
                };

                var wrapper = this.wrapperMap[apiName] || {};
                if (this.apiMap.hasOwnProperty(apiName)) {
                    var api = this.apiMap[apiName];
                    wrapper = {};

                    /**
                     *  All message formatting calls sits inside the API wrapper's messageBuilder object. These
                     *  calls will return a formatted message ready to be sent.
                     *  (e.g: data().messageBuilder.set)
                     */
                    wrapper.messageBuilder = {};
                    wrapper.messageBuilder.bulkSend = function (messages, otherCallback) {
                        var packet = {
                            'dst': api.address,
                            'action': "bulkSend",
                            'resource': "/",
                            'entity': messages
                        };

                        return {
                            'packet': packet,
                            'callback': otherCallback
                        };
                    };

                    /**
                     * All function calls are on the root level of the API wrapper. These calls will format messages and
                     * then send them to the router.
                     * (e.g: data().set)
                     */
                    wrapper.bulkSend = (function (bulkMessageBuilder, client) {
                        return function (messages) {
                            var message = bulkMessageBuilder(messages);
                            return client.send(message.packet, message.callback);
                        };
                    })(wrapper.messageBuilder.bulkSend, this);

                    /**
                     * Iterate over all mapped function calls and augment their message formatter and function call.
                     */
                    for (var i = 0; i < api.actions.length; ++i) {
                        var action = api.actions[i];
                        wrapper.messageBuilder[action] = messageBuilderAugment(api.address, action, this);
                        wrapper[action] = augment(wrapper.messageBuilder[action], this);
                    }

                    this.wrapperMap[apiName] = wrapper;
                }
                wrapper.apiName = apiName;
                return wrapper;
            },

            /**
             * Applies necessary properties to the packet to be transmitted through the router.
             *
             * @method fixPacket
             * @param {Object} fields
             * @return {Object}
             */
            fixPacket: function (fields) {
                var packet = {
                    ver: 1,
                    src: fields.src || this.address,
                    msgId: fields.msgId || "p:" + this.msgIdSequence++,
                    time: fields.time || new Date().getTime()
                };

                for (var k in fields) {
                    packet[k] = fields[k] || packet[k];
                }

                if (packet.src === "$nobody") {
                    packet.src = this.address;
                }

                return packet;
            },

            /**
             * Registers callbacks for API request callbacks and promises.
             *
             * @method registerResponses
             * @property {Object} packet
             * @property {Function} callback
             * @property {Function} promiseRes
             * @property {Function} promiseRej
             */
            registerResponses: function (packet, callback, promiseRes, promiseRej) {
                var self = this;
                if (callback) {
                    this.registeredCallbacks[packet.msgId] = function (reply, done) {
                        // We've received a message that was a promise response but we've aready handled our promise
                        // response.
                        if (/(ok).*/.test(reply.response) || /(bad|no).*/.test(reply.response)) {
                            // Do nothing and let it get sent to the event handler (this is to filter out registration
                            // of callback responses)
                            return false;
                        } else if (reply.entity && reply.entity.inFlightIntent) {
                            self.intentInvocationHandling(packet, reply.entity.inFlightIntent, callback);
                        } else {
                            callback(reply, done);
                        }
                        return true;
                    };
                }

                //respondOn "all", "error", or no value (default all) will register a promise callback.
                if (packet.respondOn !== "none") {
                    this.promiseCallbacks[packet.msgId] = function (reply, done) {
                        if (reply.src === "$transport" || /(ok).*/.test(reply.response)) {
                            done();
                            promiseRes(reply);
                        } else if (/(bad|no).*/.test(reply.response)) {
                            done();
                            promiseRej(reply);
                        } else {
                            // it was not a promise callback
                        }
                    };
                }

                if (packet.action === "watch") {
                    this.watchMsgMap[packet.msgId] = packet;
                } else if (packet.action === "unwatch" && packet.replyTo) {
                    this.cancelRegisteredCallback(packet.replyTo);
                }

                if (packet.action === "bulkSend") {
                    packet.entity.forEach(function (message) {
                        self.registerResponses(message.packet, message.callback, message.res, message.rej);
                    });
                }
            },
            /**
             * Sends a packet through the IWC.
             * Will call the participants sendImpl function.
             *
             * @method send
             * @param {Object} fields properties of the send packet..
             * @param {Function} callback The Callback for any replies. The callback will be persisted if it returns a
             *     truth-like
             * @param {Function} preexistingPromiseRes If this send already has a promise resolve registration, use it
             *     rather than make a new one.
             * @param {Function} preexistingPromiseRej If this send already has a promise reject registration, use it
             *     rather than make a new one. value, canceled if it returns a false-like value.
             */
            send: function (fields, callback, preexistingPromiseRes, preexistingPromiseRej) {
                if (this.sendingBlocked) {
                    return Promise.resolve({response: "dropped"});
                }
                var promiseRes = preexistingPromiseRes;
                var promiseRej = preexistingPromiseRej;
                var promise = new Promise(function (resolve, reject) {

                    if (!promiseRes && !promiseRej) {
                        promiseRes = resolve;
                        promiseRej = reject;
                    }
                });

                if (!(this.isConnected() || fields.dst === "$transport")) {
                    // when send is switched to promises, create the promise first and return it here, as well
                    this.preconnectionQueue.push({
                        'fields': fields,
                        'callback': callback,
                        'promiseRes': promiseRes,
                        'promiseRej': promiseRej
                    });
                    return promise;
                }
                var packet = this.fixPacket(fields);
                this.registerResponses(packet, callback, promiseRes, promiseRej);
                this.sendImpl(packet);
                this.sentBytes += packet.length;
                this.sentPackets++;

                return promise;
            },

            /**
             * Generic handler for a bus connection to handle any queued messages & launch data after its connected.
             * @method afterConnected
             * @return {Promise}
             */
            afterConnected: function () {
                var self = this;
                // dump any queued sends, trigger that we are fully connected
                self.preconnectionQueue.forEach(function (p) {
                    self.send(p.fields, p.callback, p.promiseRes, p.promiseRej);
                });
                self.preconnectionQueue = [];
                if (!self.launchParams.inFlightIntent || self.internal) {
                    self.events.trigger("connected");
                    return Promise.resolve();
                }

                // fetch the inFlightIntent
                return self.intents().get(self.launchParams.inFlightIntent).then(function (response) {
                    // If there is an inflight intent that has not already been handled (i.e. page refresh driving to
                    // here)
                    if (response && response.entity && response.entity.intent) {
                        var launchParams = response.entity.entity || {};
                        if (response.response === 'ok') {
                            for (var k in launchParams) {
                                self.launchParams[k] = launchParams[k];
                            }
                        }
                        self.intents().set(self.launchParams.inFlightIntent, {
                            entity: {
                                state: "complete"
                            }
                        });

                        if(self.launchParams.launchData && self.launchParams.launchData.inFlightIntent){
                            self.launchedIntents.push(self.launchParams.launchData.inFlightIntent);
                        }
                    }
                    self.events.trigger("connected");
                })['catch'](function (e) {
                    console.error(self.launchParams.inFlightIntent, " not handled, reason: ", e);
                    self.events.trigger("connected");
                });
            }

        };
    };

    return ApiPromiseMixin;
}(ozpIwc.apiMap, ozpIwc.log, ozpIwc.util));
var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.CancelableEvent = (function () {

    /**
     * Convenient base for events that can be canceled.  Provides and manages
     * the properties canceled and cancelReason, as well as the member function
     * cancel().
     *
     * @class CancelableEvent
     * @constructor
     * @namespace ozpIwc.util
     * @param {Object} data Data that will be copied into the event
     */
    var CancelableEvent = function (data) {
        data = data || {};
        for (var k in data) {
            this[k] = data[k];
        }
        /**
         * @property canceled
         * @type {Boolean}
         */
        this.canceled = false;

        /**
         * @property cancelReason
         * @type {String}
         */
        this.cancelReason = null;
    };

    /**
     * Marks the event as canceled.
     * @method cancel
     * @param {String} reason A text description of why the event was canceled.
     *
     * @return {ozpIwc.util.CancelableEvent} Reference to self
     */
    CancelableEvent.prototype.cancel = function (reason) {
        reason = reason || "Unknown";
        this.canceled = true;
        this.cancelReason = reason;
        return this;
    };

    return CancelableEvent;
}());
var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

ozpIwc.util.Event = (function (util) {

    /**
     * An Event emitter/receiver class.
     * @class Event
     * @constructor
     * @namespace ozpIwc.util
     */
    var Event = function () {
        /**
         * A key value store of events.
         * @property events
         * @type {Object}
         * @default {}
         */
        this.events = {};
    };

    /**
     * Registers a handler for the the event.
     *
     * @method on
     * @param {String} event The name of the event to trigger on.
     * @param {Function} callback Function to be invoked.
     * @param {Object} [self] Used as the this pointer when callback is invoked.
     *
     * @return {Object} A handle that can be used to unregister the callback via
     * {{#crossLink "ozpIwc.util.Event/off:method"}}{{/crossLink}}
     */
    Event.prototype.on = function (event, callback, self) {
        var wrapped = callback;
        if (self) {
            wrapped = function () {
                callback.apply(self, arguments);
            };
            wrapped.ozpIwcDelegateFor = callback;
        }
        this.events[event] = this.events[event] || [];
        this.events[event].push(wrapped);
        return wrapped;
    };

    /**
     * Unregisters an event handler previously registered.
     *
     * @method off
     * @param {String} event
     * @param {Function} callback
     */
    Event.prototype.off = function (event, callback) {
        this.events[event] = (this.events[event] || []).filter(function (h) {
            return h !== callback && h.ozpIwcDelegateFor !== callback;
        });
    };

    /**
     * Fires an event that will be received by all handlers.
     *
     * @method
     * @param {String} eventName Name of the event.
     * @param {Object} event Event object to pass to the handlers.
     *
     * @return {Object} The event after all handlers have processed it.
     */
    Event.prototype.trigger = function (eventName) {
        //if no event data push a new cancelable event
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length < 1) {
            args.push(new util.CancelableEvent());
        }
        var handlers = this.events[eventName] || [];

        handlers.forEach(function (h) {
            h.apply(this, args);
        });
        return args[0];
    };

    /**
     * Fires an event that will be received by all handlers.
     *
     * @method
     * @param {String} eventName Name of the event.
     * @param {Object} event Event object to pass to the handers.
     *
     * @return {Object} The event after all handlers have processed it.
     */
    Event.prototype.trigger = function (eventName) {
        //if no event data push a new cancelable event
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length < 1) {
            args.push(new util.CancelableEvent());
        }
        var handlers = this.events[eventName] || [];

        handlers.forEach(function (h) {
            h.apply(this, args);
        });
        return args[0];
    };

    /**
     * Adds an {{#crossLink "ozpIwc.util.Event/off:method"}}on(){{/crossLink}} and
     * {{#crossLink "ozpIwc.util.Event/off:method"}}off(){{/crossLink}} function to the target that delegate to this object.
     *
     * @method mixinOnOff
     * @param {Object} target Target to receive the on/off functions
     */
    Event.prototype.mixinOnOff = function (target) {
        var self = this;
        target.on = function () { return self.on.apply(self, arguments);};
        target.off = function () { return self.off.apply(self, arguments);};
    };

    /**
     * Adds an {{#crossLink "ozpIwc.util.Event/off:method"}}on(){{/crossLink}} and
     * {{#crossLink "ozpIwc.util.Event/off:method"}}off(){{/crossLink}} function to the target that delegate to this object.
     *
     * @method mixinOnOff
     * @param {Object} target Target to receive the on/off functions
     */
    Event.prototype.mixinOnOff = function (target) {
        var self = this;
        target.on = function () { return self.on.apply(self, arguments);};
        target.off = function () { return self.off.apply(self, arguments);};
    };

    return Event;
}(ozpIwc.util));


if(!(window.console && console.log)) {
    console = {
        log: function(){},
        debug: function(){},
        info: function(){},
        warn: function(){},
        error: function(){}
    };
}
var ozpIwc = ozpIwc || {};

/**
 * Logging functionality for the IWC.
 * @module ozpIwc
 */

/**
 * A logging wrapper for the ozpIwc namespace
 * @class log
 * @static
 * @namespace ozpIwc
 */
ozpIwc.log = (function () {
    /**
     * Gathers the stacktrace for an error.
     * @method getStackTrace
     * @private
     * @return {String}
     */
    var getStackTrace = function () {
        var obj = {};
        Error.captureStackTrace(obj, getStackTrace);
        return obj.stack;
    };

    return {
        /**
         * @property NONE
         * @type {Object}
         */
        NONE: {logLevel: true, severity: 0, name: "NONE"},

        /**
         * @property DEFAULT
         * @type {Object}
         */
        DEFAULT: {logLevel: true, severity: 1, name: "DEFAULT"},

        /**
         * @property ERROR
         * @type {Object}
         */
        ERROR: {logLevel: true, severity: 3, name: "ERROR"},

        /**
         * @property INFO
         * @type {Object}
         */
        INFO: {logLevel: true, severity: 6, name: "INFO"},

        /**
         * @property DEBUG
         * @type {Object}
         */
        DEBUG: {logLevel: true, severity: 7, name: "DEBUG"},

        /**
         * @property ALL
         * @type {Object}
         */
        ALL: {logLevel: true, severity: 10, name: "ALL"},

        /**
         * @property threshold
         * @type {Number}
         */
        threshold: 3,

        /**
         * Sets the threshold for the IWC's logger.
         * @method setThreshold
         * @param {Number|Object} level
         * @param {Number} [level.severity]
         */
        setThreshold: function (level) {
            if (typeof(level) === "number") {
                ozpIwc.log.threshold = level;
            } else if (typeof(level.severity) === "number") {
                ozpIwc.log.threshold = level.severity;
            } else {
                throw new TypeError("Threshold must be a number or one of the ozpIwc.log constants.  Instead got" + level);
            }
        },

        /**
         * A wrapper for log messages. Forwards to console.log if available.
         * @property log
         * @type {Function}
         */
        log: function (level) {
            if (level.logLevel === true && typeof(level.severity) === "number") {
                ozpIwc.log.logMsg(level, Array.prototype.slice.call(arguments, 1));
            } else {
                ozpIwc.log.logMsg(ozpIwc.log.DEFAULT, Array.prototype.slice.call(arguments, 0));
            }
        },

        /**
         * Logs the given message if the severity is above the threshold.
         * @method logMsg
         * @param {Number} level
         * @param {Arguments} args
         */
        logMsg: function (level, args) {
            if (level.severity > ozpIwc.log.threshold) {
                return;
            }

            // if no console, no logs.
            if (!console || !console.log) {
                return;
            }

            var msg = args.reduce(function (acc, val) {
                if (val instanceof Error) {
                    //"[" + val.name + "]" + val.message;
                    return acc + val.toString() + (val.stack ? (" -- " + val.stack) : "");
                } else if (typeof(val) === "object") {
                    return acc + JSON.stringify(val, null, 2);
                }
                return acc + val;
            }, "[" + level.name + "] ");

            console.log(msg);
        },

        /**
         * A wrapper for error messages.
         * @property error
         * @type {Function}
         */
        error: function () {
            ozpIwc.log.logMsg(ozpIwc.log.ERROR, Array.prototype.slice.call(arguments, 0));
        },

        /**
         * A wrapper for debug messages.
         * @property debug
         * @type {Function}
         */
        debug: function () {
            ozpIwc.log.logMsg(ozpIwc.log.DEBUG, Array.prototype.slice.call(arguments, 0));
        },

        /**
         * A wrapper for info messages.
         * @property info
         * @type {Function}
         */
        info: function () {
            ozpIwc.log.logMsg(ozpIwc.log.INFO, Array.prototype.slice.call(arguments, 0));
        }
    };

}());

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */

/**
 * @class object
 * @namespace ozpIwc.util
 * @static
 */
ozpIwc.util.object = (function () {
    return {
        /**
         * @method eachEntry
         * @param {Object} obj
         * @param {Function} fn
         * @param {Object} self
         * @return {Array}
         */
        eachEntry: function (obj, fn, self) {
            var rv = [];
            for (var k in obj) {
                rv.push(fn.call(self, k, obj[k], obj.hasOwnProperty(k)));
            }
            return rv;
        },

        /**
         * @method values
         * @param {Object} obj
         * @param {Function} filterFn
         * @return {Array}
         */
        values: function (obj, filterFn) {
            filterFn = filterFn || function (key, value) {
                    return true;
                };
            var rv = [];
            for (var k in obj) {
                if (filterFn(k, obj[k])) {
                    rv.push(obj[k]);
                }
            }
            return rv;
        }
    };
}());

var ozpIwc = ozpIwc || {};
ozpIwc.util = ozpIwc.util || {};

/**
 * @module ozpIwc
 * @submodule ozpIwc.util
 */


ozpIwc.util.PacketRouter = (function (log, util) {

    /**
     * A routing module for packet controlling via template matching and filtering.
     * @class PacketRouter
     * @namespace ozpIwc.util
     */
    var PacketRouter = function () {
        /**
         * The key on this table is the route action.
         * The value is an array of config objects of the form:
         *    action: from the route declaration
         *    resource: from the route declaration
         *    handler: the function from the route declaration
         *    uriTemplate: uriTemplate function
         * @property routes
         * @type {Object}
         */
        this.routes = {};

        /**
         * The route that matches all packet handling requests. Should defined route be able to handle a packet, this
         * route is called. Can be changed using the declareDefaultRoute method.
         *
         * @property defaultRoute
         * @return {Boolean} Returns false by default. Expected to be overriden by calling declareDefaultRoute.
         */
        this.defaultRoute = function () { return false; };

        /**
         * The default scope of the router.
         * @type {PacketRouter}
         */
        this.defaultSelf = this;
    };

    /**
     * Assigns a route to the Packet Router for the specific action. This route is taken by a packet if its resource
     * matches the routes resource template, passes any assigned filters. Additionally, a packet may only take one
     * route, if multiple possible routes are possible, the route which was declared earliest will handle the packet.
     *
     * @method declareRoute
     * @param {Object} config
     * @param {String} config.action The action this route is defined to (ex. "get", "set", "list", ...)
     * @param {String} config.resource The serialized uri template definition pertaining to the route (ex. "/foo",
     *     "/{id:\\d+}", "/{param1}/{param2}")
     * @param {Array} config.filters Any filters that better isolate the packet routing based on the context and packet
     *     properties
     * @param {Function} handler The resulting action to be taken should this route handle a packet.
     * @param {Object}handlerSelf The scope of the handler, the PacketRouter object holds the default scope if none is
     *     provided.
     *
     * @return {ozpIwc.util.PacketRouter}
     */
    PacketRouter.prototype.declareRoute = function (config, handler, handlerSelf) {
        if (!config || !config.action || !config.resource) {
            throw new Error("Bad route declaration: " + JSON.stringify(config, null, 2));
        }
        config.handler = handler;
        config.filters = config.filters || [];
        config.handlerSelf = handlerSelf;
        config.uriTemplate = PacketRouter.uriTemplate(config.resource);

        // @TODO FIXME var actions=ozpIwc.util.ensureArray(config.action);
        var actions = util.ensureArray(config.action);

        actions.forEach(function (a) {
            if (!this.routes.hasOwnProperty(a)) {
                this.routes[a] = [];
            }

            this.routes[a].push(config);
        }, this);
        return this;
    };

    /**
     * Recursively passes through all filters for the packet, calling the handler only if all filters pass.
     *
     * @method filterChain
     * @param {Object} packet
     * @param {Object} context
     * @param {Object} pathParams
     * @param {Object} routeSpec
     * @param {Array} filters
     * @return {Function|null} The handler function should all filters pass.
     */
    PacketRouter.prototype.filterChain = function (packet, context, pathParams, routeSpec, thisPointer, filters) {
        // if there's no more filters to call, just short-circuit the filter chain
        if (!filters.length) {
            return routeSpec.handler.call(thisPointer, packet, context, pathParams);
        }
        // otherwise, chop off the next filter in queue and return it.
        var currentFilter = filters.shift();
        var self = this;
        var filterCalled = false;
        var returnValue = currentFilter.call(thisPointer, packet, context, pathParams, function () {
            filterCalled = true;
            return self.filterChain(packet, context, pathParams, routeSpec, thisPointer, filters);
        });
        if (!filterCalled) {
            log.debug("Filter did not call next() and did not throw an exception", currentFilter);
        } else {
            log.debug("Filter returned ", returnValue);
        }
        return returnValue;
    };

    /**
     * Routes the given packet based on the context provided.
     *
     * @method routePacket
     * @param {Object} packet
     * @param {Object} context
     * @param {Object} routeOverrides - if it exists, this to determine the route instead of the packet
     * @return {*} The output of the route's handler. If the specified action does not have any routes false is
     *                    returned. If the specified action does not have a matching route the default route is applied
     */
    PacketRouter.prototype.routePacket = function (packet, context, thisPointer, routeOverrides) {
        routeOverrides = routeOverrides || {};
        var action = routeOverrides.action || packet.action;
        var resource = routeOverrides.resource || packet.resource;

        if (!action || !resource) {
            context.defaultRouteCause = "nonRoutablePacket";
            return this.defaultRoute.call(thisPointer, packet, context, {});
        }

        context = context || {};
        thisPointer = thisPointer || this.defaultSelf;
        if (!this.routes.hasOwnProperty(action)) {
            context.defaultRouteCause = "noAction";
            return this.defaultRoute.call(thisPointer, packet, context, {});
        }
        var actionRoutes = this.routes[action];
        for (var i = 0; i < actionRoutes.length; ++i) {
            var route = actionRoutes[i];
            if (!route) {
                continue;
            }
            var pathParams = route.uriTemplate(resource);
            if (pathParams) {
                thisPointer = route.handlerSelf || thisPointer;
                var filterList = route.filters.slice();
                return this.filterChain(packet, context, pathParams, route, thisPointer, filterList);
            }
        }
        // if we made it this far, then we know about the action, but there are no resources for it
        context.defaultRouteCause = "noResource";
        return this.defaultRoute.call(thisPointer, packet, context, {});

    };

    /**
     * Assigns the default route for the Packet Router.
     *
     * @method declareDefaultRoute
     * @param {Function} handler
     */
    PacketRouter.prototype.declareDefaultRoute = function (handler) {
        this.defaultRoute = handler;
    };

    /**
     * Generates a template function to deserialize a uri string based on the RegExp pattern provided.
     *
     * @method uriTemplate
     * @static
     * @param {String} pattern
     * @return {Function} If the uri does not meet the template criteria, null will be returned when the returned
     *                     function is invoked.
     */
    PacketRouter.uriTemplate = function (pattern) {
        var fields = [];
        var modifiedPattern = "^" + pattern.replace(/\{.+?\}|[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, function (match) {
                if (match.length === 1) {
                    return "\\" + match;
                }
                var colon = match.indexOf(":");

                if (colon > 0) {
                    fields.push(match.slice(1, colon));
                    return "(" + match.slice(colon + 1, -1) + ")";
                } else {
                    fields.push(match.slice(1, -1));
                    return "([^\/]+)";
                }
            }) + "$";
        var regex = new RegExp(modifiedPattern);

        return function (input) {
            var results = regex.exec(input);
            if (!results) {
                return null;
            }
            var obj = {};
            for (var i = 1; i < results.length; ++i) {
                obj[fields[i - 1]] = results[i];
            }
            return obj;
        };

    };

    /**
     * Augments the provided class with a class-level router
     * and routing functions on the prototype.  This allows the use of
     * "declareRoute" on the class to create routes for all instances of
     * that class.  All filters and handlers are evaluated using the
     * instance as "this".
     *
     * Defines:
     *    classToAugment.declareRoute(routeConfig,handler)
     *    classToAugment.prototype.routePacket(packet,context);
     *
     * If the instance has a "defaultRoute" member, it will be used as the
     * default route for packets.
     *
     * Example:
     *    ozpIwc.util.PacketRouter.mixin(MyClass);
     *
     *    MyClass.declareRoute({
     *       action: "get",
     *       resource: "/foo/{id}"
     *    },function (packet,context,pathParams) {
     *       console.log("Foo handler",packet,context,pathParams);
     *       return "foo handler";
     *    });
     *
     *    MyClass.prototype.defaultRoute=function(packet,context) {
     *      console.log("Default handler",packet,context,pathParams);
     *      return "default!";
     *    };
     *
     *    var instance=new MyClass();
     *
     *    var packet1={ resource: "/foo/123", action: "get", ...}
     *    var rv=instance.routePacket(packet1,{ bar: 2});
     *    // console output: Foo handler, packet1, {bar:2}, {id: 123}
     *    // rv === "foo handler"
     *
     *    var packet2={ resource: "/dne/123", action: "get", ...}
     *    rv=instance.routePacket(packet2,{ bar: 3});
     *    // console output: Default handler, packet2, {bar:3}
     *    // rv === "default!"
     *
     * @param {Type} classToAugment
     * @return {Type}
     */
    PacketRouter.mixin = function (classToAugment) {
        var packetRouter = new PacketRouter();

        var superClass = Object.getPrototypeOf(classToAugment.prototype);
        if (superClass && superClass.routePacket) {
            packetRouter.defaultRoute = function (packet, context) {
                return superClass.routePacket.apply(this, arguments);
            };
        } else {
            packetRouter.defaultRoute = function (packet, context) {
                if (this.defaultRoute) {
                    return this.defaultRoute.apply(this, arguments);
                } else {
                    return false;
                }
            };
        }
        classToAugment.declareRoute = function (config, handler) {
            packetRouter.declareRoute(config, handler);
        };

        classToAugment.prototype.routePacket = function (packet, context) {
            return packetRouter.routePacket(packet, context, this);
        };
    };

    return PacketRouter;

}(ozpIwc.log, ozpIwc.util));



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
     * @property DEFAULT_POOL_SIZE
     * @type {Number}
     * @default 1028
     */
    stats.DEFAULT_POOL_SIZE = 1028;

    /**
     * @Class Sample
     * @namespace ozpIwc.metric.stats
     * @constructor
     */
    stats.Sample = function () {
        /**
         * @property values
         * @type Array
         */
        this.clear();
    };

    /**
     * Appends the value.
     * @method update
     * @param {Number} val
     */
    stats.Sample.prototype.update = function (val) {
        this.values.push(val);
    };

    /**
     * Clears the values.
     * @method clear
     */
    stats.Sample.prototype.clear = function () {
        this.values = [];
        this.count = 0;
    };

    /**
     * Returns the number of the values.
     * @method size
     * @return {Number}
     */
    stats.Sample.prototype.size = function () {
        return this.values.length;
    };

    /**
     * Returns the array of values.
     * @method getValues
     * @return {Array}
     */
    stats.Sample.prototype.getValues = function () {
        return this.values;
    };


    /**
     *  Take a uniform sample of size size for all values
     *  @class UniformSample
     *  @param {Number} [size=ozpIwc.metric.stats.DEFAULT_POOL_SIZE] - The size of the sample pool.
     */
    stats.UniformSample = ozpIwc.util.extend(stats.Sample, function (size) {
        stats.Sample.apply(this);
        this.limit = size || stats.DEFAULT_POOL_SIZE;
    });

    stats.UniformSample.prototype.update = function (val) {
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

    return stats;
}(ozpIwc.metric.stats));
// From http://eloquentjavascript.net/appendix2.html, 
// licensed under CCv3.0: http://creativecommons.org/licenses/by/3.0/
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.stats = ozpIwc.metric.stats || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module ozpIwc.metric
 * @submodule ozpIwc.metric.stats
 */

ozpIwc.metric.stats.BinaryHeap = (function () {
    /**
     * This acts as a ordered binary heap for any serializeable JS object or collection of such objects
     * <p>Borrowed from https://github.com/mikejihbe/metrics. Originally from from
     * http://eloquentjavascript.net/appendix2.html
     * <p>Licenced under CCv3.0
     *
     * @class BinaryHeap
     * @namespace ozpIwc.metric.stats
     * @param {Function} scoreFunction
     * @return {ozpIwc.metric.stats.BinaryHeap}
     */
    var BinaryHeap = function BinaryHeap(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    };

    BinaryHeap.prototype = {

        clone: function () {
            var heap = new BinaryHeap(this.scoreFunction);
            // A little hacky, but effective.
            heap.content = JSON.parse(JSON.stringify(this.content));
            return heap;
        },

        push: function (element) {
            // Add the new element to the end of the array.
            this.content.push(element);
            // Allow it to bubble up.
            this.bubbleUp(this.content.length - 1);
        },

        peek: function () {
            return this.content[0];
        },

        pop: function () {
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

        remove: function (node) {
            var len = this.content.length;
            // To remove a value, we must search through the array to find
            // it.
            for (var i = 0; i < len; i++) {
                if (this.content[i] === node) {
                    // When it is found, the process seen in 'pop' is repeated
                    // to fill up the hole.
                    var end = this.content.pop();
                    if (i !== len - 1) {
                        this.content[i] = end;
                        if (this.scoreFunction(end) < this.scoreFunction(node)) {
                            this.bubbleUp(i);
                        }
                        else {
                            this.sinkDown(i);
                        }
                    }
                    return true;
                }
            }
            throw new Error("Node not found.");
        },

        size: function () {
            return this.content.length;
        },

        bubbleUp: function (n) {
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

        sinkDown: function (n) {
            // Look up the target element and its score.
            var length = this.content.length,
                element = this.content[n],
                elemScore = this.scoreFunction(element);

            while (true) {
                // Compute the indices of the child elements.
                var child2N = (n + 1) * 2, child1N = child2N - 1;
                // This is used to store the new position of the element,
                // if any.
                var swap = null;
                var child1Score = null;
                // If the first child exists (is inside the array)...
                if (child1N < length) {
                    // Look it up and compute its score.
                    var child1 = this.content[child1N];
                    child1Score = this.scoreFunction(child1);
                    // If the score is less than our element's, we need to swap.
                    if (child1Score < elemScore) {
                        swap = child1N;
                    }
                }
                // Do the same checks for the other child.
                if (child2N < length) {
                    var child2 = this.content[child2N],
                        child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score)) {
                        swap = child2N;
                    }
                }

                // If the element needs to be moved, swap it, and continue.
                if (swap !== null) {
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

    return BinaryHeap;
}());
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
     * @property M1_ALPHA
     * @type {Number}
     * @default 1 - e^(-5/60)
     */
    stats.M1_ALPHA = 1 - Math.exp(-5 / 60);

    /**
     * @property M5_ALPHA
     * @type {Number}
     * @default 1 - e^(-5/60/5)
     */
    stats.M5_ALPHA = 1 - Math.exp(-5 / 60 / 5);

    /**
     * @property M15_ALPHA
     * @type {Number}
     * @default 1 - e^(-5/60/15)
     */
    stats.M15_ALPHA = 1 - Math.exp(-5 / 60 / 15);

    /**
     *  Exponentially weighted moving average.
     *  @method ExponentiallyWeightedMovingAverage
     *  @param {Number} alpha
     *  @param {Number} interval Time in milliseconds
     */
    stats.ExponentiallyWeightedMovingAverage = function (alpha, interval) {
        this.alpha = alpha;
        this.interval = interval || 5000;
        this.currentRate = null;
        this.uncounted = 0;
        this.lastTick = ozpIwc.util.now();
    };

    /**
     * @method update
     * @param n
     */
    stats.ExponentiallyWeightedMovingAverage.prototype.update = function (n) {
        this.uncounted += (n || 1);
        this.tick();
    };

    /**
     * Update the rate measurements every interval
     *
     * @method tick
     */
    stats.ExponentiallyWeightedMovingAverage.prototype.tick = function () {
        var now = ozpIwc.util.now();
        var age = now - this.lastTick;
        if (age > this.interval) {
            this.lastTick = now - (age % this.interval);
            var requiredTicks = Math.floor(age / this.interval);
            for (var i = 0; i < requiredTicks; ++i) {
                var instantRate = this.uncounted / this.interval;
                this.uncounted = 0;
                if (this.currentRate !== null) {
                    this.currentRate += this.alpha * (instantRate - this.currentRate);
                } else {
                    this.currentRate = instantRate;
                }
            }
        }
    };

    /**
     * Return the rate per second
     *
     * @return {Number}
     */
    stats.ExponentiallyWeightedMovingAverage.prototype.rate = function () {
        return this.currentRate * 1000;
    };

    return stats;
}(ozpIwc.metric.stats));
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types|| {};

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
var ozpIwc = ozpIwc || {};
ozpIwc.metric = ozpIwc.metric || {};
ozpIwc.metric.types = ozpIwc.metric.types|| {};

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
     * Returns the ozpIwc.metric.types.Histogram instance(s) for the given name(s). If it does not exist it will be created.
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

//# sourceMappingURL=ozpIwc-metrics.js.map