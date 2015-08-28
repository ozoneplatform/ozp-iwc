angular.module('ozpIwcBus', []).factory('iwcBus', function () {
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

var ES = {
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
    ToInteger: function ToInteger(num) {
        var n = +num;
        if (n !== n) { // isNaN
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
        var length = self.length >>> 0;
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
                if (typeof T !== 'undefined') {
                    callbackfn.call(T, self[i], i, object);
                } else {
                    callbackfn(self[i], i, object);
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
        var length = self.length >>> 0;
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
                if (typeof T !== 'undefined') {
                    result[i] = callbackfn.call(T, self[i], i, object);
                } else {
                    result[i] = callbackfn(self[i], i, object);
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
        var length = self.length >>> 0;
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
        var length = self.length >>> 0;
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
        var length = self.length >>> 0;
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
        var length = self.length >>> 0;

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
        var length = self.length >>> 0;

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
        var length = self.length >>> 0;

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
        var length = self.length >>> 0;

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
    $frames: true,
    $frameElement: true,
    $webkitIndexedDB: true,
    $webkitStorageInfo: true
};
var hasAutomationEqualityBug = (function () {
    /* globals window */
    if (typeof window === 'undefined') { return false; }
    for (var k in window) {
        if (!blacklistedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
            try {
                equalsConstructorPrototype(window[k]);
            } catch (e) {
                return true;
            }
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

var isArguments = function isArguments(value) {
    var str = toStr(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
        isArgs = !isArray(value) &&
          value !== null &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          value.length >= 0 &&
          isCallable(value.callee);
    }
    return isArgs;
};

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
var originalKeys = $Object.keys;
defineProperties($Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(array_slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments);

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
if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    /* global Date: true */
    /* eslint-disable no-undef */
    Date = (function (NativeDate) {
    /* eslint-enable no-undef */
        // Date.length === 7
        var DateShim = function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            var date;
            if (this instanceof NativeDate) {
                date = length === 1 && $String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(DateShim.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
            } else {
                date = NativeDate.apply(this, arguments);
            }
            // Prevent mixups with unfixed Date object
            defineProperties(date, { constructor: DateShim }, true);
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
            return $Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
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
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
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
        f = f !== f ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = $Number(this);

        // Test for NaN
        if (x !== x) {
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
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            var splitLimit = typeof limit === 'undefined' ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                ES.ToUint32(limit);
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
        } else if (object.constructor) {
            return object.constructor.prototype;
        } else {
            return prototypeOfObject;
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
            /* eslint-disable no-proto */
            empty.__proto__ = null;
            /* eslint-enable no-proto */

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

ozpIwc.apiMap = {
    "data.api" : { 'address': 'data.api',
        'actions': ["get","set","delete","watch","unwatch","list","bulkGet","addChild","removeChild"]
    },
    "intents.api" : { 'address': 'intents.api',
        'actions': ["get","set","delete","watch","unwatch","list","bulkGet","register","invoke","broadcast"]
    },
    "names.api" : { 'address': 'names.api',
        'actions': ["get","set","delete","watch","unwatch","list","bulkGet"]
    },
    "system.api" : { 'address': 'system.api',
        'actions': ["get","set","delete","watch","unwatch","list","bulkGet","launch"]
    },
    "locks.api" : { 'address' : 'locks.api',
        'actions': ["get","watch","unwatch","list","lock","unlock"]
    }
};
/*
 * @method ozpIwc.ApiPromiseMixin
 * @static
 * Augments a participant or connection that supports basic IWC communications
 * functions for sending and receiving.
 * @uses ozpIwc.Events
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.ApiPromiseMixin=function(participant,autoConnect) {
    autoConnect = (typeof autoConnect === "undefined" || autoConnect);

    participant.address = participant.address || "$nobody";
    participant.connect = participant.connect ||  function(){
        participant.connectPromise = Promise.resolve();

        return participant.connectPromise;
    };

    if(!participant.events) {
        participant.events = new ozpIwc.Event();
        participant.events.mixinOnOff(participant);
    }

    var mixins = ozpIwc.ApiPromiseMixin.getCore();
    for(var i in mixins){
        participant[i] = mixins[i];
    }

    participant.readLaunchParams(window.name);
    participant.readLaunchParams(window.location.search);
    participant.readLaunchParams(window.location.hash);

    ozpIwc.ApiPromiseMixin.registerEvents(participant);

    participant.constructApiFunctions();

    if(autoConnect){
        participant.connect();
    }
};

/**
 * Registers event listeners for the participant.  Listens for the following events: disconnect.
 * @method registerEvents
 * @static
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.ApiPromiseMixin.registerEvents = function(participant){
    participant.on("disconnect",function(){
        participant.promiseCallbacks={};
        participant.registeredCallbacks={};
        window.removeEventListener("message",participant.postMessageHandler,false);
        participant.connectPromise = null;
    });
};

/**
 * A factory for the apiPromise functionality.
 *
 * @method getCore
 * @static
 * @returns {Object}
 */
ozpIwc.ApiPromiseMixin.getCore = function() {
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
        startTime: ozpIwc.util.now(),

        /**
         * A map of available apis and their actions.
         * @property apiMap
         * @type Object
         */
        apiMap: ozpIwc.apiMap || {},

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
         * @returns {Boolean}
         */
        isConnected: function(){
            return this.address !== "$nobody";
        },

        /**
         * Parses launch parameters based on the raw string input it receives.
         *
         * @method readLaunchParams
         * @param {String} rawString
         */
        readLaunchParams: function(rawString) {
            // of the form ozpIwc.VARIABLE=VALUE, where:
            //   VARIABLE is alphanumeric + "_"
            //   VALUE does not contain & or #
            var re=/ozpIwc.(\w+)=([^&#]+)/g;
            var m;
            while((m=re.exec(rawString)) !== null) {
                var params = decodeURIComponent(m[2]);
                try{
                    params = JSON.parse(params);
                } catch(e){
                    // ignore the errors and just pass through the string
                }
                this.launchParams[m[1]]=params;
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
         * @param {ozpIwc.TransportPacket} packetContext
         */
        receiveFromRouterImpl: function (packetContext) {
            var handled = false;

            // If no packet, it is likely a $transport packet.
            var packet = packetContext.packet || packetContext;
            //Try and handle this packet as a reply message
            if (packet.src ==="$transport" || packet.replyTo && this.promiseCallbacks[packet.replyTo]) {

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
            if(!handled){
                // Otherwise trigger "receive" for someone to handle it
                this.events.trigger("receive",packetContext);
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
         * Calls the names.api to gather the /api/* resources to gain knowledge of available api actions of the current bus.
         *
         * @method gatherApiInformation
         * @returns {Promise}
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
         * Handles intent invocation packets. Communicates back with the intents.api to operate the in flight intent state
         * machine.
         *
         * @method intentInvocationHandling
         * @param resource {String} The resource of the packet that sent the intent invocation
         * @param inFlightIntent {Object} The in flight intent, used internally to operate the in flight intent state machine
         * @param callback {Function} The intent handler's callback function
         * @returns {Promise}
         */
        intentInvocationHandling: function (packet, inFlightIntent, callback) {
            var self = this;
            var res;
            var promiseChain;
            callback = callback || function(){};
            inFlightIntent = inFlightIntent || {};
            if(inFlightIntent.entity) {
                promiseChain = Promise.resolve(inFlightIntent);
            } else {
                promiseChain = self.send({
                    dst: "intents.api",
                    action: "get",
                    resource: inFlightIntent.resource
                });
            }
            return promiseChain.then(function(inFlightIntentRes) {
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
            }).then(function(){
                // Run the intent handler. Wrapped in a promise chain in case the callback itself is async.
                return callback(res.entity);
            }).then(function (result) {

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
            })['catch'](function(e){
                ozpIwc.log.error("Error in handling intent: ", e, " -- Reporting error on in-flight intent node:",
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
         * @returns {Function} returns the wrapper call for the given api.
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
         * @returns {Function} returns the wrapper call for the given api.
         */
        updateApi: function (apiName) {

            /**
             * Function generator. Generates API functions given a messageBuilder function.
             * @method augment
             * @param messageBuilder
             * @param client
             * @returns {Function}
             */
            var augment = function (messageBuilder,client) {
                return function (resource, fragment, otherCallback) {
                    var message = messageBuilder(resource,fragment,otherCallback);
                    var packet = message.packet;


                    if (packet.dst === "intents.api" && packet.action === "register") {
                        for (var i in client.launchedIntents) {
                            var loadedResource = '/' + client.launchedIntents[i].entity.intent.type + '/' + client.launchedIntents[i].entity.intent.action;
                            if (resource === loadedResource) {
                                client.intentInvocationHandling(packet, client.launchedIntents[i].resource, message.callback);
                                delete client.launchedIntents[i];
                            }
                        }
                    }
                    return client.send(packet, message.callback);
                };
            };

            /**
             * Function generator. Generates API message formatting functions for a client-destination-action pairing.
             * These are generated for bulk sending capabilities, since the message needs to be formatted but not
             * transmitted until desired.
             *
             * @method messageBuilderAugment
             * @param dst
             * @param action
             * @param client
             * @returns {Function}
             */
            var messageBuilderAugment = function(dst, action, client) {
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
                    var resolve,reject;
                    var sendData = new Promise(function(res,rej){
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
                    wrapper[action] = augment(wrapper.messageBuilder[action],this);
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
         * @returns {Object}
         */
        fixPacket : function(fields){
            var packet = {
                ver: 1,
                src: fields.src || this.address,
                msgId: fields.msgId || "p:" + this.msgIdSequence++,
                time: fields.time || new Date().getTime()
            };

            for (var k in fields) {
                packet[k] = fields[k] || packet[k];
            }

            if(packet.src === "$nobody") {
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
        registerResponses: function(packet,callback,promiseRes,promiseRej){
            var self = this;
            if (callback) {
                this.registeredCallbacks[packet.msgId] = function (reply, done) {
                    // We've received a message that was a promise response but we've aready handled our promise response.
                    if (reply.src === "$transport" || /(ok).*/.test(reply.response) || /(bad|no).*/.test(reply.response)) {
                        // Do noting and let it get sent to the event handler
                        return false;
                    }else if (reply.entity && reply.entity.inFlightIntent) {
                        self.intentInvocationHandling(packet, reply.entity.inFlightIntent, callback);
                    } else {
                        callback(reply, done);
                    }
                    return true;
                };
            }

            //respondOn "all", "error", or no value (default all) will register a promise callback.
            if(packet.respondOn !== "none") {
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

            if(packet.action === "bulkSend"){
                packet.entity.forEach(function(message) {
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
         * @param {Function} callback The Callback for any replies. The callback will be persisted if it returns a truth-like
         * @param {Function} preexistingPromiseRes If this send already has a promise resolve registration, use it rather than make a new one.
         * @param {Function} preexistingPromiseRej If this send already has a promise reject registration, use it rather than make a new one.
         * value, canceled if it returns a false-like value.
         */
        send: function (fields, callback, preexistingPromiseRes, preexistingPromiseRej) {
            if(this.sendingBlocked) {
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
            this.registerResponses(packet,callback,promiseRes,promiseRej);
            this.sendImpl(packet);
            this.sentBytes += packet.length;
            this.sentPackets++;

            return promise;
        },

        /**
         * Generic handler for a bus connection to handle any queued messages & launch data after its connected.
         * @method afterConnected
         * @returns {Promise}
         */
        afterConnected: function(){
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
                // If there is an inflight intent that has not already been handled (i.e. page refresh driving to here)
                if (response && response.entity && response.entity.intent) {
                    self.launchedIntents.push(response);
                    var launchData = response.entity.entity || {};
                    if (response.response === 'ok') {
                        for (var k in launchData) {
                            self.launchParams[k] = launchData[k];
                        }
                    }
                    self.intents().set(self.launchParams.inFlightIntent, {
                        entity: {
                            state: "complete"
                        }
                    });
                }
                self.events.trigger("connected");
            })['catch'](function(e){
                ozpIwc.log.error(self.launchParams.inFlightIntent, " not handled, reason: ", e);
                self.events.trigger("connected");
            });
        }

    };
};
var ozpIwc=ozpIwc || {};
/**
 * Common classes used between both the Client and the Bus.
 * @module common
 */

/**
 * An Event emmitter/receiver class.
 * @class Event
 * @namespace ozpIwc
 */
ozpIwc.Event=function() {
    /**
     * A key value store of events.
     * @property events
     * @type Object
     * @default {}
     */
	this.events={};
};

/**
 * Registers a handler for the the event.
 *
 * @method on
 * @param {String} event The name of the event to trigger on.
 * @param {Function} callback Function to be invoked.
 * @param {Object} [self] Used as the this pointer when callback is invoked.
 *
 * @returns {Object} A handle that can be used to unregister the callback via
 * {{#crossLink "ozpIwc.Event/off:method"}}{{/crossLink}}
 */
ozpIwc.Event.prototype.on=function(event,callback,self) {
	var wrapped=callback;
	if(self) {
		wrapped=function() {
			callback.apply(self,arguments);
		};
		wrapped.ozpIwcDelegateFor=callback;
	}
	this.events[event]=this.events[event]||[];
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
ozpIwc.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter( function(h) {
		return h!==callback && h.ozpIwcDelegateFor !== callback;
	});
};

/**
 * Fires an event that will be received by all handlers.
 *
 * @method
 * @param {String} eventName Name of the event.
 * @param {Object} event Event object to pass to the handers.
 *
 * @returns {Object} The event after all handlers have processed it.
 */
ozpIwc.Event.prototype.trigger=function(eventName) {
	//if no event data push a new cancelable event
	var args = Array.prototype.slice.call(arguments,1);
	if(args.length < 1){
		args.push(new ozpIwc.CancelableEvent());
	}
	var handlers=this.events[eventName] || [];

	handlers.forEach(function(h) {
		h.apply(this,args);
	});
	return args[0];
};



/**
 * Adds an {{#crossLink "ozpIwc.Event/off:method"}}on(){{/crossLink}} and
 * {{#crossLink "ozpIwc.Event/off:method"}}off(){{/crossLink}} function to the target that delegate to this object.
 *
 * @method mixinOnOff
 * @param {Object} target Target to receive the on/off functions
 */
ozpIwc.Event.prototype.mixinOnOff=function(target) {
	var self=this;
	target.on=function() { return self.on.apply(self,arguments);};
	target.off=function() { return self.off.apply(self,arguments);};
};

/**
 * Convenient base for events that can be canceled.  Provides and manages
 * the properties canceled and cancelReason, as well as the member function
 * cancel().
 *
 * @class CancelableEvent
 * @namespace ozpIwc
 * @param {Object} data Data that will be copied into the event
 */
ozpIwc.CancelableEvent=function(data) {
	data = data || {};
	for(var k in data) {
		this[k]=data[k];
	}
	this.canceled=false;
	this.cancelReason=null;
};

/**
 * Marks the event as canceled.
 * @method cancel
 * @param {String} reason A text description of why the event was canceled.
 *
 * @returns {ozpIwc.CancelableEvent} Reference to self
 */
ozpIwc.CancelableEvent.prototype.cancel=function(reason) {
	reason= reason || "Unknown";
	this.canceled=true;
	this.cancelReason=reason;
	return this;
};

if(!(window.console && console.log)) {
    console = {
        log: function(){},
        debug: function(){},
        info: function(){},
        warn: function(){},
        error: function(){}
    };
}
/**
 * @submodule bus.util
 */
var getStackTrace = function() {
    var obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
};


/**
 * A logging wrapper for the ozpIwc namespace
 * @class log
 * @static
 * @namespace ozpIwc
 */
ozpIwc.log=ozpIwc.log || {
    // syslog levels
    NONE: { logLevel: true, severity: 0, name: "NONE"},
    DEFAULT: { logLevel: true, severity: 1, name: "DEFAULT"},
    ERROR: { logLevel: true, severity: 3, name: "ERROR"},
    INFO: { logLevel: true, severity: 6, name: "INFO"},
    DEBUG: { logLevel: true, severity: 7, name: "DEBUG"},
    ALL: { logLevel: true, severity: 10, name: "ALL"},
    
    threshold: 3,

    /**
     * Sets the threshold for the IWC's logger.
     * @method setThreshold
     * @param {Number|Object} level
     * @param {Number} [level.severity]
     */
    setThreshold: function(level) {
        if(typeof(level)==="number") {
            ozpIwc.log.threshold=level;
        } else if(typeof(level.severity) === "number") {
            ozpIwc.log.threshold=level.severity;
        } else {
            throw new TypeError("Threshold must be a number or one of the ozpIwc.log constants.  Instead got" + level);
        }
    },
    
    /**
     * A wrapper for log messages. Forwards to console.log if available.
     * @property log
     * @type Function
     */
	log: function(level) {
        if(level.logLevel === true && typeof(level.severity) === "number") {
            ozpIwc.log.logMsg(level,Array.prototype.slice.call(arguments, 1));
        } else {
            ozpIwc.log.logMsg(ozpIwc.log.DEFAULT,Array.prototype.slice.call(arguments, 0));
        }
	},

    /**
     * Logs the given message if the severity is above the threshold.
     * @method logMsg
     * @param {Number} level
     * @param {Arguments} args
     */
    logMsg: function(level,args) {
        if(level.severity > ozpIwc.log.threshold) {
            return;
        }

        // if no console, no logs.
        if(!console || !console.log){
            return;
        }
        
        var msg=args.reduce(function(acc, val) {
            if(val instanceof Error) {
                return acc + val.toString() + (val.stack?(" -- " +val.stack):""); //"[" + val.name + ":" + val.message;
            }else if(typeof(val) === "object") {
                return acc + JSON.stringify(val,null,2);
            }
            return acc + val;
        },"["+level.name+"] ");
        
        console.log(msg);
//        var original = console.log;
//        if(original.apply){
//            original.apply(console,["["+level.name+"] "].concat(args));
//        } else {
//            // IE does not have apply on console functions
//            var msg = ["["+level.name+"]"].concat(args).join(' ');
//            original(msg);
//        }
    },
    
    /**
     * A wrapper for error messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
	error: function() {
        ozpIwc.log.logMsg(ozpIwc.log.ERROR,Array.prototype.slice.call(arguments, 0));
	},

    /**
     * A wrapper for debug messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
    debug: function() {
        ozpIwc.log.logMsg(ozpIwc.log.DEBUG,Array.prototype.slice.call(arguments, 0));
//        window.console.log.apply(window.console,arguments);
    },
    /**
     * A wrapper for debug messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
    info: function() {
        ozpIwc.log.logMsg(ozpIwc.log.INFO,Array.prototype.slice.call(arguments, 0));
//        window.console.log.apply(window.console,arguments);
    }
};

ozpIwc.object={
    eachEntry: function(obj,fn,self) {
        var rv=[];
        for(var k in obj) {
            rv.push(fn.call(self,k,obj[k],obj.hasOwnProperty(k)));
        }
        return rv;
    },
    values:function(obj,filterFn) {
        filterFn=filterFn || function(key,value) {
            return true;
        };
        var rv=[];
        for(var k in obj) {
            if(filterFn(k,obj[k])) {
                rv.push(obj[k]);
            }
        }
        return rv;
    }
};

/**
 *
 * @class packetRouter
 * @namespace ozpIwc
 * @static
 */
ozpIwc.packetRouter = ozpIwc.packetRouter || {};

/**
 * Generates a template function to deserialize a uri string based on the RegExp pattern provided.
 *
 * @method uriTemplate
 * @static
 * @param {String} pattern
 * @returns {Function} If the uri does not meet the template criteria, null will be returned when the returned
 *                     function is invoked.
 */
ozpIwc.packetRouter.uriTemplate=function(pattern) {
  var fields=[];
  var modifiedPattern="^"+pattern.replace(/\{.+?\}|[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, function(match) {
      if(match.length===1) {
          return "\\"+match;
      }
      var colon=match.indexOf(":");
      
      if(colon > 0) {
          fields.push(match.slice(1,colon));
          return "("+match.slice(colon+1,-1)+")";
      } else {
        fields.push(match.slice(1,-1));
        return "([^\/]+)";
      }
  })+"$";
  var regex=new RegExp(modifiedPattern);
  
  return function(input) {
     var results=regex.exec(input);
     if(!results) {
         return null;
     }
     var obj={};
     for(var i=1;i<results.length;++i) {
         obj[fields[i-1]]=results[i];
     }
     return obj;
  };
    
};

/**
 * A routing module for packet controlling via template matching and filtering.
 * @class PacketRouter
 * @namespace ozpIwc
 */
ozpIwc.PacketRouter=function() {
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
    this.routes={};

    /**
     * The route that matches all packet handling requests. Should defined route be able to handle a packet, this route
     * is called. Can be changed using the declareDefaultRoute method.
     *
     * @property defaultRoute
     * @returns {*}
     */
    this.defaultRoute=function() { return false; };

    /**
     * The default scope of the router.
     * @type {PacketRouter}
     */
    this.defaultSelf=this;
};


/**
 * Assigns a route to the Packet Router for the specific action. This route is taken by a packet if its resource matches
 * the routes resource template, passes any assigned filters. Additionally, a packet may only take one route, if
 * multiple possible routes are possible, the route which was declared earliest will handle the packet.
 *
 * @method declareRoute
 * @param {Object} config
 * @param {String} config.action The action this route is defined to (ex. "get", "set", "list", ...)
 * @param {String} config.resource The serialized uri template definition pertaining to the route (ex. "/foo", "/{id:\\d+}", "/{param1}/{param2}")
 * @param {Array} config.filters Any filters that better isolate the packet routing based on the context and packet properties
 * @param {Function} handler The resulting action to be taken should this route handle a packet.
 * @param {Object}handlerSelf The scope of the handler, the PacketRouter object holds the default scope if none is provided.
 *
 * @returns {ozpIwc.PacketRouter}
 */
ozpIwc.PacketRouter.prototype.declareRoute=function(config,handler,handlerSelf) {
    if(!config || !config.action || !config.resource) {
        throw new Error("Bad route declaration: "+JSON.stringify(config,null,2));
    }
    config.handler=handler;
    config.filters=config.filters || [];
    config.handlerSelf=handlerSelf;
    config.uriTemplate=ozpIwc.packetRouter.uriTemplate(config.resource);
    
    // @TODO FIXME var actions=ozpIwc.util.ensureArray(config.action);
    var actions=ozpIwc.util.ensureArray(config.action);
    
    actions.forEach(function(a) {
        if(!this.routes.hasOwnProperty(a)) {
            this.routes[a]=[];
        }
    
        this.routes[a].push(config);
    },this);
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
 * @returns {Function|null} The handler function should all filters pass.
 */
ozpIwc.PacketRouter.prototype.filterChain=function(packet,context,pathParams,routeSpec,thisPointer,filters) {
  // if there's no more filters to call, just short-circuit the filter chain
  if(!filters.length) {
    return routeSpec.handler.call(thisPointer,packet,context,pathParams);
  }
  // otherwise, chop off the next filter in queue and return it.
  var currentFilter=filters.shift();
  var self=this;
  var filterCalled=false;
  var returnValue=currentFilter.call(thisPointer,packet,context,pathParams,function() {
      filterCalled=true;
      return self.filterChain(packet,context,pathParams,routeSpec,thisPointer,filters);
  });
  if(!filterCalled) {
      ozpIwc.log.debug("Filter did not call next() and did not throw an exception",currentFilter);
  } else {
      ozpIwc.log.debug("Filter returned ", returnValue);
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
 * @returns {*} The output of the route's handler. If the specified action does not have any routes false is
 *                    returned. If the specified action does not have a matching route the default route is applied
 */
ozpIwc.PacketRouter.prototype.routePacket=function(packet,context,thisPointer,routeOverrides) {
    routeOverrides = routeOverrides || {};    
    var action=routeOverrides.action || packet.action;
    var resource=routeOverrides.resource || packet.resource;
    
    if(!action || !resource) {
        context.defaultRouteCause="nonRoutablePacket";
        return this.defaultRoute.call(thisPointer,packet,context,{});                
    }
    
    context=context || {};
    thisPointer=thisPointer || this.defaultSelf;
    if(!this.routes.hasOwnProperty(action)) {
        context.defaultRouteCause="noAction";
        return this.defaultRoute.call(thisPointer,packet,context,{});
    }
    var actionRoutes=this.routes[action];
    for(var i=0;i<actionRoutes.length;++i) {
        var route=actionRoutes[i];
        if(!route) {
            continue;
        }
        var pathParams=route.uriTemplate(resource);
        if(pathParams) {
            thisPointer=route.handlerSelf || thisPointer;
            var filterList=route.filters.slice();
            return this.filterChain(packet,context,pathParams,route,thisPointer,filterList);
        }
    }
    // if we made it this far, then we know about the action, but there are no resources for it
    context.defaultRouteCause="noResource";
    return this.defaultRoute.call(thisPointer,packet,context,{});        
    
};

/**
 * Assigns the default route for the Packet Router
 *
 * @param {Function} handler
 */
ozpIwc.PacketRouter.prototype.declareDefaultRoute=function(handler) {
    this.defaultRoute=handler;
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
 *    ozpIwc.PacketRouter.mixin(MyClass);
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
 * @param {type} classToAugment
 * @returns {undefined}
 */
ozpIwc.PacketRouter.mixin=function(classToAugment) {
    var packetRouter=new ozpIwc.PacketRouter();
    
    var superClass=Object.getPrototypeOf(classToAugment.prototype);
    if(superClass && superClass.routePacket) {
        packetRouter.defaultRoute=function(packet,context) {
            return superClass.routePacket.apply(this,arguments);
        };
    } else {
        packetRouter.defaultRoute=function(packet,context) {
            if(this.defaultRoute) {
                return this.defaultRoute.apply(this,arguments);
            } else {
                return false;
            }
        };
    }
    classToAugment.declareRoute=function(config,handler) {
        packetRouter.declareRoute(config,handler);
    };
    
    classToAugment.prototype.routePacket=function(packet,context) {
        return packetRouter.routePacket(packet,context,this);  
    };
};
/**
 * @submodule common
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 *
 * @method now
 * @returns {Number}
 */
ozpIwc.util.now=function() {
    return new Date().getTime();
};

/**
 * Applies the template using the supplied object for values
 *
 * @method resolveUriTemplate
 * @param {string} template The template to use
 * @param {Object} obj The object to get template paramters from
 * @param {Object} fallback A secondary object for parameters not contained by the first
 * @returns {Number}
 */
ozpIwc.util.resolveUriTemplate=function(template,obj,fallback) {
	var converters={
		"+": function(a) { return a;},
		"": function(a) { return encodeURIComponent(a);}
	};
	var t=template.replace(/\{([\+\#\.\/\;\?\&]?)(.+?)\}/g,function(match,type,name) {
			return converters[type](obj[name] || fallback[name]);
		});
	// look for the :// of the protocol
	var protocolOffset=t.indexOf("://");
	// if we found it, set the offset to the end.  otherwise, leave it
	// at -1 so that a leading "//" will be replaced, below
	if(protocolOffset >0) { protocolOffset+=3; }
	
	// remove double // that show up after the protocolOffset
	return t.replace(/\/\//g,function(m,offset){
			// only swap it after the protocol
			if(offset > protocolOffset) {
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
ozpIwc.util.eventListeners={};

/**
 * Adds an event listener to the window and stores its listener in ozpIwc.util.eventListeners.
 *
 * @method addEventListener
 * @param {String} type the event to listen to
 * @param {Function} listener the callback to be used upon the event being emitted
 */
ozpIwc.util.addEventListener=function(type,listener) {
    var l=ozpIwc.util.eventListeners[type];
    if(!l) {
        l=ozpIwc.util.eventListeners[type]=[];
    }
    l.push(listener);
    window.addEventListener(type,listener);
};

/**
 * Removes an event listener from the window and from ozpIwc.util.eventListeners
 * @param {String} type the event to remove the listener from
 * @param {Function} listener the callback to unregister
 */
ozpIwc.util.removeEventListener=function(type,listener) {
    var l=ozpIwc.util.eventListeners[type];
    if(l) {
        ozpIwc.util.eventListeners[type]=l.filter(function(v) { return v!==listener;});
    }
    window.removeEventListener(type,listener);
};

/**
 * Removes all event listeners registered in ozpIwc.util.eventListeners
 * @param {String} type the event to remove the listener from
 * @param {Function} listener the callback to unregister
 * @param {Boolean} [useCapture] if true all events of the specified type will be dispatched to the registered listener
 *                             before being dispatched to any EventTarget beneath it in the DOM tree. Events which
 *                             are bubbling upward through the tree will not trigger a listener designated to use
 *                             capture.
 */
ozpIwc.util.purgeEventListeners=function() {
    ozpIwc.object.eachEntry(ozpIwc.util.eventListeners,function(type,listenerList) {
        listenerList.forEach(function(listener) {
            window.removeEventListener(type,listener);
        });
    });
    ozpIwc.util.eventListeners={};
};


/**
 * Create a class with the given parent in it's prototype chain.
 *
 * @method extend
 * @param {Function} baseClass The class being derived from.
 * @param {Function} newConstructor The new base class.
 *
 * @returns {Function} New Constructor with an augmented prototype.
 */
ozpIwc.util.extend=function(baseClass,newConstructor) {
    if(!baseClass || !baseClass.prototype) {
        ozpIwc.log.error("Cannot create a new class for ",newConstructor," due to invalid baseclass:",baseClass);
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
ozpIwc.util.safePostMessage = function(window,msg,origin) {
    try {
        var data = msg;
        if (!ozpIwc.util.structuredCloneSupport() && typeof data !== 'string') {
           data=JSON.stringify(msg);
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
 *
 * @method structuredCloneSupport
 *
 * @returns {Boolean} True if structured clones are supported, false otherwise.
 */
ozpIwc.util.structuredCloneSupport=function() {
    ozpIwc.util = ozpIwc.util || {};
    if (ozpIwc.util.structuredCloneSupportCache !== undefined) {
        return ozpIwc.util.structuredCloneSupportCache;
    }
    var cloneSupport = 'postMessage' in window;
    if(ozpIwc.legacySupport){
        cloneSupport = false;
    }
    //If the browser doesn't support structured clones, it will call toString() on the object passed to postMessage.
    try {
        window.postMessage({
            toString: function () {
                cloneSupport = false;
            }
        }, "*");
    } catch (e) {
        //exception expected: objects with methods can't be cloned
        //e.DATA_CLONE_ERR will exist only for browsers with structured clone support, which can be used as an additional check if needed
    }
    ozpIwc.util.structuredCloneSupportCache=cloneSupport;
    return ozpIwc.util.structuredCloneSupportCache;
};

/**
 * Does a deep clone of a serializable object.  Note that this will not
 * clone unserializable objects like DOM elements, Date, RegExp, etc.
 *
 * @method clone
 * @param {Array|Object} value The value to be cloned.
 * @returns {Array|Object}  a deep copy of the object
 */
ozpIwc.util.clone=function(value) {
	if(Array.isArray(value) || typeof(value) === 'object') {
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
ozpIwc.util.parseQueryParams=function(query) {
    query = query || window.location.search;
    var params={};
	var regex=/\??([^&=]+)=?([^&]*)/g;
	var match;
	while((match=regex.exec(query)) !== null) {
		params[match[1]]=decodeURIComponent(match[2]);
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
 * @returns {String}
 */
ozpIwc.util.addQueryParams=function(url,params){
    if(typeof url !== "string") { throw new Error("url should be a string."); }

    var formattedParams = {};
    switch(typeof params){
        case "object":
            // if in array form ["a=true","b=en_us",...]
            if(Array.isArray(params)){
                if(params.length === 0){
                    return url;
                }
                for(var i in params){
                    if(typeof params[i] === "string") {
                        var p = ozpIwc.util.parseQueryParams(params[i]);
                        for(var j in p){
                            formattedParams[j] = p[j];
                        }
                    }
                }
            } else {
                if(Object.keys(params).length === 0){
                    return url;
                }
                // if in object form {a:true, b:"en_us",...}
                formattedParams = params;
            }
            break;
        case "undefined":
            return url;

        default:
            if(params.length === 0) {
                return url;
            }
            // if in string form "?a=true&b=en_us&..."
            formattedParams = ozpIwc.util.parseQueryParams(params);
            break;
    }
    var hash = "";
    // Separate the hash temporarily (if exists)
    var hashSplit = url.split("#");
    if(hashSplit.length > 2){
        throw new Error("Invalid url.");
    } else {
        url = hashSplit[0];
        hash = hashSplit[1] || "";
    }

    //if the url has no query params  we append the initial "?"
    if(url.indexOf("?") === -1) {
        url += "?";
    } else {
        url += "&";
    }
    //skip on first iteration
    var ampersand = "";
    for(var k in formattedParams){
        url += ampersand + k +"=" + formattedParams[k];
        ampersand = "&";
    }

    if(hash.length > 0){
        url += "#" + hash;
    }

    return url;
};

/**
 * Determines the origin of a given url.  
 * @method determineOrigin
 * @param url
 * @returns {String}
 */
ozpIwc.util.protocolPorts={
    "http:" : "80",
    "https:" : "443",
    "ws:" : "80",
    "wss:" : "443"
};
ozpIwc.util.determineOrigin=function(url) {
    var a=document.createElement("a");
    a.href = url;
    if(a.origin) {
        return a.origin;
    }
    var origin=a.protocol + "//" + a.hostname;
    /* Internet Explorer adds the port to urls in <a> tags created by a script, even
     * if it wasn't there to start with.  Thanks, IE!
     * https://connect.microsoft.com/IE/feedback/details/817343/ie11-scripting-value-of-htmlanchorelement-host-differs-between-script-created-link-and-link-from-document
     * 
     * Other browsers seem to drop the port if it's the default, so we'll do the same.
    */
   
    if(a.port && ozpIwc.util.protocolPorts[a.protocol] !== a.port) {
        origin+= ":" + a.port;
    }
    return origin;
};

/**
 * Escapes regular expression characters in a string.
 * @method escapeRegex
 * @param {String} str
 * @returns {String}
 */
ozpIwc.util.escapeRegex=function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * 
 * @method parseOzpUrl
 * @param {type} url
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.util.parseOzpUrl=function(url) {
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
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean}
 */
ozpIwc.util.isIWCPacket=function(packet) {
    if(typeof packet.src !== "string" ||typeof packet.dst !== "string" ||
        typeof packet.ver !== "number" || typeof packet.msgId !== "string") {
        return false;
    } else {
        return true;
    }
};


/**
 * Returns the version of Internet Explorer or a -1
 * (indicating the use of another browser).
 * @returns {number}
 */
ozpIwc.util.getInternetExplorerVersion= function() {
    var rv = -1; // Return value assumes failure.
    var ua, re;
    if (navigator.appName === 'Microsoft Internet Explorer')
    {
        ua = navigator.userAgent;
        re  = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
        if (re.exec(ua) !== null) {
            rv = parseFloat(RegExp.$1);
        }
    }   else if (navigator.appName === 'Netscape')
    {
        ua = navigator.userAgent;
        re  = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/;
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
 * @returns {Promise}
 */
ozpIwc.util.prerender=function(){
    return new Promise(function(resolve,reject) {
        if (document.visibilityState === undefined || (document.visibilityState !== "prerender" &&
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
var ozpIwc=ozpIwc || {};
/**
 * @submodule metrics.statistics
 */

/**
 *
 * @class metricStats
 * @namespace ozpIwc
 */
ozpIwc.metricsStats=ozpIwc.metricsStats || {};

/**
 * @property DEFAULT_POOL_SIZE
 * @type {Number}
 * @default 1028
 */
ozpIwc.metricsStats.DEFAULT_POOL_SIZE=1028;

/**
 * @Class Sample
 * @namespace ozpIwc.metricsStats
 * @constructor
 */
ozpIwc.metricsStats.Sample = function(){
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
ozpIwc.metricsStats.Sample.prototype.update = function(val){ 
	this.values.push(val); 
};

/**
 * Clears the values.
 * @method clear
 */
ozpIwc.metricsStats.Sample.prototype.clear = function(){ 
	this.values = []; 
	this.count = 0; 
};

/**
 * Returns the number of the values.
 * @method size
 * @returns {Number}
 */
ozpIwc.metricsStats.Sample.prototype.size = function(){ 
	return this.values.length;
};

/**
 * Returns the array of values.
 * @method getValues
 * @returns {Array}
 */
ozpIwc.metricsStats.Sample.prototype.getValues = function(){ 
	return this.values; 
};


/**
 *  Take a uniform sample of size size for all values
 *  @class UniformSample
 *  @param {Number} [size=ozpIwc.metricsStats.DEFAULT_POOL_SIZE] - The size of the sample pool.
 */
ozpIwc.metricsStats.UniformSample=ozpIwc.util.extend(ozpIwc.metricsStats.Sample,function(size) {
	ozpIwc.metricsStats.Sample.apply(this);
  this.limit = size || ozpIwc.metricsStats.DEFAULT_POOL_SIZE;
});

ozpIwc.metricsStats.UniformSample.prototype.update = function(val) {
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

var ozpIwc=ozpIwc || {};

/**
 * Statistics classes for the ozpIwc Metrics
 * @module metrics
 * @submodule metrics.statistics
 */
/**
 * metricStats namespace
 * @class metricStats
 * @namespace ozpIwc
 * @static
 */
ozpIwc.metricsStats=ozpIwc.metricsStats || {};
/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. Originally from from http://eloquentjavascript.net/appendix2.html
 * <p>Licenced under CCv3.0
 *
 * @class BinaryHeap
 * @namespace ozpIwc.metricStats
 * @param {Function} scoreFunction
 * @returns {ozpiwc.metricStats.BinaryHeap}
 */
ozpIwc.metricsStats.BinaryHeap = function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
};

ozpIwc.metricsStats.BinaryHeap.prototype = {

  clone: function() {
    var heap = new ozpIwc.metricsStats.BinaryHeap(this.scoreFunction);
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
var ozpIwc=ozpIwc || {};
ozpIwc.metricsStats=ozpIwc.metricsStats || {};

/**
 * @submodule metrics.statistics
 */

//  Take an exponentially decaying sample of size size of all values
/**
 *
 * @class metricStats
 * @namespace ozpIwc
 */

/**
 * @property DEFAULT_RESCALE_THRESHOLD
 * @type {Number}
 * @default 3600000
 */
ozpIwc.metricsStats.DEFAULT_RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * @property DEFAULT_DECAY_ALPHA
 * @type {Number}
 * @default 0.015
 */
ozpIwc.metricsStats.DEFAULT_DECAY_ALPHA=0.015;

/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. 
 * @class ExponentiallyDecayingSample
 * @namespace ozpIwc.metricStats
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample=ozpIwc.util.extend(ozpIwc.metricsStats.Sample,function(size, alpha) {
	ozpIwc.metricsStats.Sample.apply(this);
  this.limit = size || ozpIwc.metricsStats.DEFAULT_POOL_SIZE;
  this.alpha = alpha || ozpIwc.metricsStats.DEFAULT_DECAY_ALPHA;
	this.rescaleThreshold = ozpIwc.metricsStats.DEFAULT_RESCALE_THRESHOLD;
});

// This is a relatively expensive operation
/**
 * @method getValues
 * @returns {Array}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.getValues = function() {
  var values = [];
  var heap = this.values.clone();
	var elt;
  while((elt = heap.pop()) !== undefined) {
    values.push(elt.val);
  }
  return values;
};

/**
 * @method size
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.size = function() {
  return this.values.size();
};

/**
 * @method newHeap
 * @returns {ozpIwc.metricsStats.BinaryHeap}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.newHeap = function() {
  return new ozpIwc.metricsStats.BinaryHeap(function(obj){return obj.priority;});
};

/**
 * @method now
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.now = function() {
  return ozpIwc.util.now();
};

/**
 * @method tick
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.tick = function() {
  return this.now() / 1000;
};

/**
 * @method clear
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.clear = function() {
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
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.update = function(val, timestamp) {
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
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.weight = function(time) {
  return Math.exp(this.alpha * time);
};

/**
 * @method rescale
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.rescale = function() {
  this.nextScaleTime = this.now() + this.rescaleThreshold;
  var oldContent = this.values.content;
  var newContent = [];
  var oldStartTime = this.startTime;
  this.startTime = this.tick();
  // Downscale every priority by the same factor. Order is unaffected, which is why we're avoiding the cost of popping.
  for(var i = 0; i < oldContent.length; i++) {
    newContent.push({val: oldContent[i].val, priority: oldContent[i].priority * Math.exp(-this.alpha * (this.startTime - oldStartTime))});
  }
  this.values.content = newContent;
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
var ozpIwc=ozpIwc || {};
ozpIwc.metricsStats=ozpIwc.metricsStats || {};
/**
 * @submodule metrics.statistics
 */

/**
 *
 * @class metricStats
 * @namespace ozpIwc
 */

/**
 * @property M1_ALPHA
 * @type {Number}
 * @default 1 - e^(-5/60)
 */
ozpIwc.metricsStats.M1_ALPHA = 1 - Math.exp(-5/60);

/**
 * @property M5_ALPHA
 * @type {Number}
 * @default 1 - e^(-5/60/5)
 */
ozpIwc.metricsStats.M5_ALPHA = 1 - Math.exp(-5/60/5);

/**
 * @property M15_ALPHA
 * @type {Number}
 * @default 1 - e^(-5/60/15)
 */
ozpIwc.metricsStats.M15_ALPHA = 1 - Math.exp(-5/60/15);

/**
 *  Exponentially weighted moving average.
 *  @method ExponentiallyWeightedMovingAverage
 *  @param {Number} alpha
 *  @param {Number} interval Time in milliseconds
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage=function(alpha, interval) {
  this.alpha = alpha;
  this.interval = interval || 5000;
  this.currentRate = null;
  this.uncounted = 0;
	this.lastTick=ozpIwc.util.now();
};

/**
 * @method update
 * @param n
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.update = function(n) {
  this.uncounted += (n || 1);
	this.tick();
};

/**
 * Update the rate measurements every interval
 *
 * @method tick
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.tick = function() {
 	var now=ozpIwc.util.now();
	var age=now-this.lastTick;
	if(age > this.interval) {
		this.lastTick=now - (age % this.interval);
		var requiredTicks=Math.floor(age / this.interval);
		for(var i=0; i < requiredTicks; ++i) {
			var instantRate = this.uncounted / this.interval;
			this.uncounted = 0;
			if(this.currentRate!==null) {
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
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.rate = function() {
  return this.currentRate * 1000;
};

var ozpIwc=ozpIwc || {};
/**
 * Metrics capabilities for the IWC.
 * @module metrics
 */
ozpIwc.metricTypes=ozpIwc.metricTypes || {};

/**
 * @Class BaseMetric
 * @namespace ozpIwc.metricTypes
 */
ozpIwc.metricTypes.BaseMetric=function() {
    /**
     * The value of the metric
     * @property value
     * @type Number
     * @default 0
     */
	this.value=0;

    /**
     * The name of the metric
     * @property name
     * @type String
     * @default ""
     */
    this.name="";

    /**
     * The unit name of the metric
     * @property unitName
     * @type String
     * @default ""
     */
    this.unitName="";
};

/**
 * Returns the metric value
 * @method get
 * @returns {Number}
 */
ozpIwc.metricTypes.BaseMetric.prototype.get=function() { 
	return this.value; 
};

/**
 * Sets the unit name if parameter provided. Returns the unit name if no parameter provided.
 * @method unit
 * @param {String} val
 * @returns {ozpIwc.metricTypes.BaseMetric|String}
 */
ozpIwc.metricTypes.BaseMetric.prototype.unit=function(val) { 
	if(val) {
		this.unitName=val;
		return this;
	}
	return this.unitName; 
};




/**
 * Types of metrics available.
 * @module metrics
 * @submodule metrics.types
 */


/**
 * A counter running total that can be adjusted up or down.
 * Where a meter is set to a known value at each update, a
 * counter is incremented up or down by a known change.
 *
 * @class Counter
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 */
ozpIwc.metricTypes.Counter=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.value=0;
});

/**
 * @method inc
 * @param {Number} [delta=1]  Increment by this value
 * @returns {Number} Value of the counter after increment
 */
ozpIwc.metricTypes.Counter.prototype.inc=function(delta) { 
	return this.value+=(delta?delta:1);
};

/**
 * @method dec
 * @param {Number} [delta=1]  Decrement by this value
 * @returns {Number} Value of the counter after decrement
 */
ozpIwc.metricTypes.Counter.prototype.dec=function(delta) { 
	return this.value-=(delta?delta:1);
};

ozpIwc.metricTypes=ozpIwc.metricTypes || {};
/**
 * @submodule metrics.types
 */

/**
 * @callback ozpIwc.metricTypes.Gauge~gaugeCallback
 * @returns {ozpIwc.metricTypes.MetricsTree} 
 */

/**
 * A gauge is an externally defined set of metrics returned by a callback function
 *
 * @class Gauge
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 * @param {ozpIwc.metricTypes.Gauge~gaugeCallback} metricsCallback
 */
ozpIwc.metricTypes.Gauge=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function(metricsCallback) {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.callback=metricsCallback;
});
/**
 * Set the metrics callback for this gauge.
 *
 * @method set
 * @param {ozpIwc.metricTypes.Gauge~gaugeCallback} metricsCallback
 *
 * @returns {ozpIwc.metricTypes.Gauge} this
 */
ozpIwc.metricTypes.Gauge.prototype.set=function(metricsCallback) { 
	this.callback=metricsCallback;
	return this;
};
/**
 * Executes the callback and returns a metrics tree.
 *
 * @method get
 *
 * @returns {ozpIwc.metricTypes.MetricsTree}
 */
ozpIwc.metricTypes.Gauge.prototype.get=function() {
    if (this.callback) {
        return this.callback();
    }
    return undefined;
};

/**
 * @submodule metrics.types
 */

/**
 * @class Histogram
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 */
ozpIwc.metricTypes.Histogram=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);

    /**
     * @property sample
     * @type {ozpIwc.metricsStats.ExponentiallyDecayingSample}
     */
	this.sample = new ozpIwc.metricsStats.ExponentiallyDecayingSample();
	this.clear();
});


/**
 * @method clear
 */
ozpIwc.metricTypes.Histogram.prototype.clear=function() {
	this.sample.clear();
	this.min=this.max=null;
	this.varianceMean=0;
	this.varianceM2=0;
	this.sum=0;
	this.count=0;	
};

/**
 * @method mark
 * @param {Number} val
 * @param {Number} timestamp Current time in milliseconds.
 * @returns {Number} Value of the counter after increment
 */
ozpIwc.metricTypes.Histogram.prototype.mark=function(val,timestamp) { 
	timestamp = timestamp || ozpIwc.util.now();
	
	this.sample.update(val,timestamp);
	
	this.max=(this.max===null?val:Math.max(this.max,val));
	this.min=(this.min===null?val:Math.min(this.min,val));
	this.sum+=val;
	this.count++;
	
	var delta=val - this.varianceMean;
	this.varianceMean += delta/this.count;
	this.varianceM2 += delta * (val - this.varianceMean);

	return this.count;
};

/**
 * @method get
 * @returns {{percentile10, percentile25, median, percentile75, percentile90, percentile95, percentile99,
 * percentile999, variance: null, mean: null, stdDev: null, count: *, sum: *, max: *, min: *}}
 */
ozpIwc.metricTypes.Histogram.prototype.get=function() { 
	var values=this.sample.getValues().map(function(v){
		return parseFloat(v);
	}).sort(function(a,b) { 
		return a-b;
	});
	var percentile=function(p) {
		var pos=p *(values.length);
		if(pos >= values.length) {
			return values[values.length-1];
		}
		pos=Math.max(0,pos);
		pos=Math.min(pos,values.length+1);
		var lower = values[Math.floor(pos)-1];
		var upper = values[Math.floor(pos)];
		return lower+(pos-Math.floor(pos))*(upper-lower);
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
		'variance' : this.count < 1 ? null : this.varianceM2 / (this.count -1),
		'mean' : this.count === 0 ? null : this.varianceMean,
		'stdDev' : this.count < 1 ? null : Math.sqrt(this.varianceM2 / (this.count -1)),
		'count' : this.count,
		'sum' : this.sum,
		'max' : this.max,
		'min' : this.min
	};
};


/**
 * @submodule metrics.types
 */

/**
 * @class Meter
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 */
ozpIwc.metricTypes.Meter=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
    /**
     * @property m1Rate
     * @type {ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage}
     */
	this.m1Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M1_ALPHA);
    /**
     * @property m5Rate
     * @type {ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage}
     */
	this.m5Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M5_ALPHA);
    /**
     * @property m15Rate
     * @type {ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage}
     */
	this.m15Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M15_ALPHA);
    /**
     * @property startTime
     * @type {Number}
     */
	this.startTime=ozpIwc.util.now();
    /**
     * @property value
     * @type {Number}
     * @default 0
     */
	this.value=0;
});

/**
 * @method mark
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
ozpIwc.metricTypes.Meter.prototype.mark=function(delta) { 
	delta=delta || 1;
	this.value+=delta;
	this.m1Rate.update(delta);
	this.m5Rate.update(delta);
	this.m15Rate.update(delta);
	
	return this.value;
};

/**
 * @method get
 * @returns {{rate1m: (Number), rate5m: (Number), rate15m: (Number), rateMean: number, count: (Number)}}
 */
ozpIwc.metricTypes.Meter.prototype.get=function() {
	return {
		'rate1m' : this.m1Rate.rate(),
		'rate5m' : this.m5Rate.rate(),
		'rate15m' : this.m15Rate.rate(),
		'rateMean' : this.value / (ozpIwc.util.now() - this.startTime) * 1000,
		'count' : this.value
	};
};

/**
 * @method tick
 */
ozpIwc.metricTypes.Meter.prototype.tick=function() { 
	this.m1Rate.tick();
	this.m5Rate.tick();
	this.m15Rate.tick();
};

/**
 * @submodule metrics.types
 */

/**
 * @class Timer
 * @namespace ozpIwc
 * @extends ozpIwc.metricTypes.BaseMetric
 * @type {Function}
 */
ozpIwc.metricTypes.Timer=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
    /**
     * @property meter
     * @type {ozpIwc.metricTypes.Meter}
     */
	this.meter=new ozpIwc.metricTypes.Meter();

    /**
     * @property histogram
     * @type {ozpIwc.metricTypes.Histogram}
     */
	this.histogram=new ozpIwc.metricTypes.Histogram();
});

/**
 * @method mark
 * @param {Number} val
 * @param {Number} timestamp Current time in milliseconds.
 */
ozpIwc.metricTypes.Timer.prototype.mark=function(val,time) {
	this.meter.mark();
	this.histogram.mark(val,time);
};

/**
 * Starts the timer
 *
 * @method start
 * @returns {Function}
 */
ozpIwc.metricTypes.Timer.prototype.start=function() {
	var self=this;
	var startTime=ozpIwc.util.now();
	return function() {
		var endTime=ozpIwc.util.now();
		self.mark(endTime-startTime,endTime);
	};
};

/**
 * Times the length of a function call.
 *
 * @method time
 * @param {Function}callback
 */
ozpIwc.metricTypes.Timer.prototype.time=function(callback) {
	var startTime=ozpIwc.util.now();
	try {
		callback();
	} finally {
		var endTime=ozpIwc.util.now();
		this.mark(endTime-startTime,endTime);
	}
};

/**
 * Returns a histogram of the timer metrics.
 *
 * @method get
 * @returns {Object}
 */
ozpIwc.metricTypes.Timer.prototype.get=function() {
	var val=this.histogram.get();
	var meterMetrics=this.meter.get();
	for(var k in meterMetrics) {
		val[k]=meterMetrics[k];
	}
	return val;
};
var ozpIwc=ozpIwc || {};
/**
 * Metrics capabilities for the IWC.
 * @module metrics
 */

/**
 * A repository of metrics
 * @class MetricsRegistry
 * @namespace ozpIwc
 */
ozpIwc.MetricsRegistry=function() {
    /**
     * Key value store of metrics
     * @property metrics
     * @type Object
     */
	this.metrics={};
    var self=this;
    this.gauge('registry.metrics.types').set(function() {
        return Object.keys(self.metrics).length;
    });

};

/**
 * Finds or creates the metric in the registry.
 * @method findOrCreateMetric
 * @private
 * @param {String} name Name of the metric.
 * @param {Function} type The constructor of the requested type for this metric.
 * @returns {ozpIwc.MetricType} Null if the metric already exists of a different type. Otherwise a reference to
 * the metric.
 */
ozpIwc.MetricsRegistry.prototype.findOrCreateMetric=function(name,Type) {
	var m= this.metrics[name];
    if(!m) {
        m = this.metrics[name] = new Type();
        m.name=name;
        return m;
    }
	if(m instanceof Type){
			return m;
	} else {
			return null;
	}			
};

/**
 * Joins the arguments together into a name.
 * @method makeName
 * @private
 * @param {String[]} args Array or the argument-like "arguments" value.
 * @returns {String} the name.
 */
ozpIwc.MetricsRegistry.prototype.makeName=function(args) {
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
 * @returns {ozpIwc.metricTypes.Counter}
 */
ozpIwc.MetricsRegistry.prototype.counter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Counter);
};

/**
 * Returns the meter instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method meter
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Meter}
 */
ozpIwc.MetricsRegistry.prototype.meter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Meter);
};

/**
 * Returns the gauge instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method gauge
 * @param {String} name Components of the name.
 * @returns {ozpIwc.metricTypes.Gauge}
 */
ozpIwc.MetricsRegistry.prototype.gauge=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Gauge);
};

/**
 * Returns the histogram instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method histogram
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Histogram}
 */
ozpIwc.MetricsRegistry.prototype.histogram=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Histogram);
};

/**
 * Returns the timer instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method timer
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Timer}
 */
ozpIwc.MetricsRegistry.prototype.timer=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Timer);
};

/**
 * Registers a metric to the metric registry
 *
 * @method register
 * @param {String} name Components of the name.
 * @param {ozpIwc.MetricType} metric
 *
 * @returns {ozpIwc.MetricType} The metric passed in.
 */
ozpIwc.MetricsRegistry.prototype.register=function(name,metric) {
	this.metrics[this.makeName(name)]=metric;
	
	return metric;
};

/**
 * Converts the metric registry to JSON.
 *
 * @method toJson
 * @returns {Object} JSON converted registry.
 */
ozpIwc.MetricsRegistry.prototype.toJson=function() {
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

/**
 * Returns an array of all metrics in the registry
 * @method allMetrics
 * @returns {ozpIwc.MetricType[]}
 */
ozpIwc.MetricsRegistry.prototype.allMetrics=function() {
    var rv=[];
    for(var k in this.metrics) {
        rv.push(this.metrics[k]);
    }
    return rv;
};

ozpIwc.metrics=new ozpIwc.MetricsRegistry();

/**
 * Utility methods used on the IWC bus.
 * @module bus
 * @submodule bus.util
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Sends an AJAX request. A promise is returned to handle the response.
 *
 * @method ajax
 * @static
 * @param {Object} config
 * @param {String} config.method
 * @param {String} config.href
 * @param [Object] config.headers
 * @param {String} config.headers.name
 * @param {String} config.headers.value
 * @param {boolean} config.withCredentials
 *
 * @returns {Promise}
 */
ozpIwc.util.ajax = function (config) {
    return new Promise(function(resolve,reject) {
        var writeMethods = ["PUT", "POST", "PATCH"];
        var request = new XMLHttpRequest();
        request.open(config.method, config.href, true);
        request.withCredentials = true;
        var setContentType = true;
        if (Array.isArray(config.headers)) {
            config.headers.forEach(function(header) {
                if(header.name ==="Content-Type"){
                    setContentType = false;
                }
                request.setRequestHeader(header.name, header.value);
            });
        }
        //IE9 does not default the Content-Type. Set it if it wasn't passed in.
        if(writeMethods.indexOf(config.method) >= 0 && setContentType){
            request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
        }

        /*
        /*
         * Setting username and password as params to open() (and setting request.withCredentials = true)
         * per the API does not work in FF. setting them explicitly in the Authorization header works
         * (but only for BASIC authentication as coded here). If the credentials are set in the open command,
         * FF will fail to make the request, even though the credentials are manually set in the Authorization header
         * */

        request.onload = function () {
            if(Math.floor(this.status/100) === 2) {
                var entity;
                try {
                    entity=JSON.parse(this.responseText);
                } catch(e) {
                        entity=this.reponseText || this.responseXML;
                }
                resolve({
                    "response": entity,
                    "header":  ozpIwc.util.ajaxResponseHeaderToJSON(this.getAllResponseHeaders())

                });
            } else {
                reject(this);
            }
        };

        request.onerror = function (e) {
            reject(this);
        };

        try {
            if ((config.method === "POST") || (config.method === "PUT")) {
                request.send(config.data);
            }
            else {
                request.send();
            }
        } catch (e) {
            reject(e);
        }
    });
};


/**
 * Takes the Javascript ajax response header (string) and converts it to JSON
 * @method ajaxResponseHeaderToJSON
 * @param {String} header
 *
 * @returns {Object}
 */
ozpIwc.util.ajaxResponseHeaderToJSON = function(header) {
    var obj = {};
    header.split("\n").forEach(function (property) {
        var kv = property.split(":");
        if (kv.length === 2) {
            obj[kv[0].trim()] = kv[1].trim();
        }
    });

    return obj;
};


/**
 * @class AjaxPersistenceQueue
 * @param {Object} config
 * @param {Number} config.poolSize
 * @constructor
 */
ozpIwc.AjaxPersistenceQueue=function(config) {
    config=config || {};
    this.poolSize=config.poolSize || 1;
    
    this.syncPool=[]; // The tail of the promise chain for each pool
    
    // populate the slots with resolved promises
    for(var i=0; i< this.poolSize; ++i) {
        this.syncPool.push(Promise.resolve());
    }

    // a counter that round-robins the requests to persist among the slots
    this.nextSlot=0;

    // maps the iwcUri to the promise that is saving it
    this.queuedSyncs={};
};

/**
 * @method doSync
 * param {String} iwcUri @TODO unused
 * @param {ozpIwc.ApiNode} node
 * @returns {*}
 */
ozpIwc.AjaxPersistenceQueue.prototype.doSync=function(iwcUri,node) {
		var uri=node.getSelfUri();
		if(!uri) {
			return Promise.resolve();
		}
    if(node.deleted) {
       return ozpIwc.util.ajax({
            href:  uri,
            method: 'DELETE'
        });        
    } else {
        var entity=node.serializedEntity();
        if(typeof(entity) !== "string") {
            entity=JSON.stringify(entity);
        }
        ozpIwc.log.debug("PUT " + uri,entity);
        return ozpIwc.util.ajax({
            href:  uri,
            method: 'PUT',
            data: entity,
            headers: [{
                name: "Content-Type",
                value: node.serializedContentType()
            }]
        }).then(function(result) {
            ozpIwc.log.debug("  saving to " + uri,result);
        },function(error) {
            ozpIwc.log.error("  FAILED saving to " + uri,error);
        });
    }
}; 

/**
 * FIXME: it's possible to have poolSize updates in flight for a rapidly changing node when the pool is lightly utilized.
 *    The duplicate call will occur when all of these conditions are met:
 *     * An ajax request for the node is still active.
 *     * queueNode(n) is called
 *     * the new sync promise reaches the head of its pool queue
 *   Example with poolSize=3 and node "n"
 *     queueNode(n) -> assigns n to pool 1
 *        pool 1 -> starts AJAX call and clears queuedSyncs[n]
 *     queueNode(n) -> n is not queued, so assigns n to pool 2
 *        pool 2 -> starts AJAX call and clears queuedSyncs[n]
 *     queueNode(n) -> n is not queued, so assigns n to pool 3
 *        pool 3 -> starts AJAX call and clears queuedSyncs[n]
 *
 *
 * @method queueNode
 * @param {String} iwcUri
 * @param {ozpIwc.ApiNode} node
 * @returns {*}
 */
ozpIwc.AjaxPersistenceQueue.prototype.queueNode=function(iwcUri,node) {
    var self=this;
    // the value of node is captured immediately before it is saved to the backend
    // only add it to the queue if it isn't already there
    if(!this.queuedSyncs[iwcUri]) {
        // round robin between slots
        this.nextSlot=(this.nextSlot+1) % this.poolSize;
        
        // chain off the syncPool, update the sync pool tail,
        // and save it for the iwcUri for this node        
        this.syncPool[this.nextSlot]= this.queuedSyncs[iwcUri]=
            this.syncPool[this.nextSlot].then(function() {
                // since doSync serializes the node, remove it from the queue now
                // to capture post-serialization changes
                delete self.queuedSyncs[iwcUri];
                return self.doSync(iwcUri,node);
            });
    }
    return this.queuedSyncs[iwcUri];
};
/**
 * @submodule bus.util
 */

/**
 * A deferred action, but not in the sense of the Javascript standard.
 * @class AsyncAction
 * @constructor
 * @namespace ozpIwc
 */
ozpIwc.AsyncAction=function() {
    /**
     * The result of the logic defered to.
     * @property resolution
     * @type string
     */
    /**
     * Key value store of the callbacks to the deferred action.
     * @property callbacks
     * @type Object
     */
	this.callbacks={};
};

/**
 * Registers the callback to be called when the resolution matches the state. If resolution matches the state before
 * registration, the callback is fired rather than registered.
 *
 * @method when
 * @param state
 * @param callback
 * @param self
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.when=function(state,callback,self) {
    self=self || this;
	
	if(this.resolution === state) {
		callback.apply(self,this.value);
	} else {
		this.callbacks[state]=function() { return callback.apply(self,arguments); };
	}
	return this;
};

/**
 * Sets the deferred action's resolution and calls any callbacks associated to that state.
 *
 * @method resolve
 * @param status
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.resolve=function(status) {
	if(this.resolution) {
		throw "Cannot resolve an already resolved AsyncAction";
	}
	var callback=this.callbacks[status];
	this.resolution=status;

    /**
     * @property value
     * @type Array
     */
	this.value=Array.prototype.slice.call(arguments,1);
	
	if(callback) {
		callback.apply(this,this.value);
	}
	return this;
};

/**
 * Gives implementation of an AsyncAction a chained success registration.
 * @method success
 * @param callback
 * @param self
 * @example
 * var a = new ozpIwc.AsyncAction().success(function(){...}, this).failure(function(){...}, this);
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.success=function(callback,self) {
	return this.when("success",callback,self);
};

/**
 * Gives implementation of an AsyncAction a chained failure registration.
 * @method success
 * @param callback
 * @param self
 * @example
 * var a = new ozpIwc.AsyncAction().success(function(){...}, this).failure(function(){...}, this);
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.failure=function(callback,self) {
	return this.when("failure",callback,self);
};

/**
 * Returns an async action that resolves when all async Actions are resolved with their resolved values (if applies).
 * @method all
 * @param asyncActions
 */
ozpIwc.AsyncAction.all = function(asyncActions) {
    var returnAction = new ozpIwc.AsyncAction();
    var count = asyncActions.length;
    var self = this;
    var results = [];


    //Register a callback for each action's "success"
    asyncActions.forEach(function(action,index){
        // If its not an asyncAction, pass it through as a result.
        if(!self.isAnAction(action)){
            results[index] = action;
            if(--count === 0) {
                returnAction.resolve('success',results);
            }
        }else {
            action
                .success(function (result) {
                    results[index] = result;
                    //once all actions resolved, intermediateAction resolve
                    if (--count === 0) {
                        returnAction.resolve('success', results);
                    }
                }, self)
                .failure(function (err) {
                    //fail the returnAction if any fail.
                    returnAction.resolve('failure', err);
                }, self);
        }
    });

    return returnAction;
};

/**
 * Returns true if the object is an AsyncAction, otherwise false.
 * @method isAnAction
 * @param {*} action
 * @returns {Boolean}
 */
ozpIwc.AsyncAction.isAnAction = function(action){
    return ozpIwc.AsyncAction.prototype.isPrototypeOf(action);
};
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));

/**
* @submodule bus.util
*/

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 *
 * @method generateId
 * @static
 *
 * @returns {String}
 */
ozpIwc.util.generateId=function() {
    return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Invokes the callback handler on another event loop as soon as possible.
 *
 * @method setImmediate
 * @static
*/
ozpIwc.util.setImmediate=function(f) {
//    window.setTimeout(f,0);
    window.setImmediate(f);
};

/**
 * Returns true if every needle is found in the haystack.
 *
 * @method arrayContainsAll
 * @static
 * @param {Array} haystack The array to search.
 * @param {Array} needles All of the values to search.
 * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
 *
 * @returns {Boolean}
 */
ozpIwc.util.arrayContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    return needles.every(function(needle) { 
        return haystack.some(function(hay) { 
            return equal(hay,needle);
        });
    });
};


/**
 * Returns true if the value every attribute in needs is equal to 
 * value of the same attribute in haystack.
 *
 * @method objectContainsAll
 * @static
 * @param {Array} haystack The object that must contain all attributes and values.
 * @param {Array} needles The reference object for the attributes and values.
 * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
 *
 * @returns {Boolean}
 */
ozpIwc.util.objectContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    
    for(var attribute in needles) {
        if(!equal(haystack[attribute],needles[attribute])) {
            return false;
        }
    }
    return true;
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
 *
 * @returns {undefined}
 */
ozpIwc.util.openWindow=function(url,windowName,features) {
    if(typeof windowName === "object") {
        var str="";
        for(var k in windowName) {
            str+=k+"="+encodeURIComponent(windowName[k]) +"&";
        }
        windowName=str;
    }
    try {
        window.open(url, windowName, features);
    } catch (e){
        //fallback for IE
        window.open(url + "?" + windowName,null,features);
    }
};


(function() {
    ozpIwc.BUS_ROOT=window.location.protocol + "//" +
            window.location.host +
            window.location.pathname.replace(/[^\/]+$/,"");

    ozpIwc.INTENT_CHOOSER_FEATURES = "width=330,height=500";
})();


/**
 * IWC alert handler.
 *
 * @method alert
 * @static
 * @param {String} message The string to display in the popup.
 * @param {Object} errorObject The object related to the alert to give as additional information
 * @todo fill with some form of modal popup regarding the alert.
 * @todo store a list of alerts to not notify if the user selects "don't show me this again" in the data.api
 *
 */
ozpIwc.util.alert = function (message, errorObject) {
    this.alerts = this.alerts || {};
    if(this.alerts[message]){
        this.alerts[message].error = errorObject;
    } else {
        this.alerts[message] = {
            error: errorObject,
            silence: false
        };
    }
    if(!this.alerts[message].silence){
        //TODO : trigger an angular/bootstrap modal alert to notify the user of the error.
        // on return of the alert:
            // set this.alerts[message].silence if the user silenced the alerts

        // Temporary placement: all alerts are silenced after first instance, but since this is not in data.api its on
        // a widget basis.
        this.alerts[message].silence = true;
        ozpIwc.log.log(message,errorObject);
    }
};

/**
 * Solves a common pattern to handle data from a function which may return a single object or an array of objects
 * If given an array, returns the array.
 * If given a single object, returns the object as a single element in a list.
 *
 * @method ensureArray
 * @static
 * @param {Object} obj The object may be an array or single object
 *
 * @returns {Array}
 */
ozpIwc.util.ensureArray=function(obj) {
	return Array.isArray(obj)?obj:[obj];
};

ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * A security attribute constructor for policyAuth use. Structured to be common to both bus-internal and api needs.
 * @class SecurityAttribute
 * @namespace ozpIwc.policyAuth
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.SecurityAttribute = function(config){
    config = config || {};
    this.attributes =  config.attributes ||  {};
    this.comparator = config.comparator || this.comparator;
};

/**
 * Adds a value to the security attribute if it does not already exist. Constructs the attribute object if it does not
 * exist
 *
 * @method pushIfNotExist
 * @param id
 * @param val
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.pushIfNotExist = function(id, val, comp) {
    comp = comp || this.comparator;
    if(!val){
        return;
    }
    var value = ozpIwc.util.ensureArray(val);
    if (!this.attributes[id]) {
        this.attributes[id] = [];
        this.attributes[id] = this.attributes[id].concat(value);
    } else {
        for (var j in value) {
            var add = true;
            for (var i in this.attributes[id]) {
                if (comp(this.attributes[id][i], value[j])) {
                    add = false;
                    break;
                }
            }
            if(add){
                this.attributes[id].push(value[j]);
            }
        }
    }
};

/**
 * Clears the attributes given to an id.
 * @param id
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.clear = function(id){
    delete this.attributes[id];
};

/**
 * Clears all attributes.
 * @method clear
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.clearAll = function(){
    this.attributes = {};
};

/**
 * Returns an object containing all of the attributes.
 * @returns {Object}
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.getAll = function(){
    return this.attributes;
};

/**
 *
 * Determines the equality of an object against a securityAttribute value.
 * @method comparator
 * @param a
 * @param b
 * @returns {boolean}
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.comparator = function(a, b) {
    return a === b;
};
ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * System entity that evaluates applicable policy and renders an authorization decision.
 * @class PDP
 * @namespace ozpIwc.policyAuth
 *
 * @param {Object} config
 * @param {ozpIwc.policyAuth.PRP} config.prp Policy Repository Point for the PDP to gather policies from.
 * @param {ozpIwc.policyAuth.PIP} config.pip Policy Information Point for the PDP to gather attributes from.
 * @constructor
 */
ozpIwc.policyAuth.PDP = function(config){
    config=config || {};

    /**
     * Policy Repository Point
     * @property prp
     * @type {ozpIwc.policyAuth.PRP}
     * @default new ozpIwc.policyAuth.PRP()
     */
    this.prp = config.prp ||  new ozpIwc.policyAuth.PRP();


    /**
     * Policy Information Point
     * @property pip
     * @type {ozpIwc.policyAuth.PIP}
     * @default new ozpIwc.policyAuth.PIP()
     */
    this.pip = config.pip || new ozpIwc.policyAuth.PIP();

    this.policySets = config.policySets ||
    {
        'connectSet': ["policy://ozpIwc/connect"],
        'apiSet': ["policy://policy/apiNode"],
        'readSet': ["policy://policy/read"],
        'receiveAsSet': ["policy://policy/receiveAs"],
        'sendAsSet': ["policy://policy/sendAs"]
    };
};


/**
 * @method isPermitted(request)
 * @param {Object | String} [request.subject]       The subject attributes or id performing the action.
 * @param {Object | String} [request.resource]      The resource attributes or id that is being acted upon.
 * @param {Object | String} [request.action]        The action attributes.  A string should be interpreted as the
 *                                                  value of the “action-id” attribute.
 * @param {Array<String>} [request.policies]        A list of URIs applicable to this decision.
 * @param {String} [request. combiningAlgorithm]    Only supports “deny-overrides”
 * @param {Object} [contextHolder]                  An object that holds 'securityAttribute' attributes to populate the
 *                                                  PIP cache with for request/policy use.
 * @returns {ozpIwc.AsyncAction} will resolve with 'success' if the policy gives a "Permit".
 *                                    rejects else wise. the async success will receive:
 * ```{
 *      'result': <String>,
 *      'request': <Object> // a copy of the request passed in,
 *      'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
 *    }```
 */
ozpIwc.policyAuth.PDP.prototype.isPermitted = function(request){
    var asyncAction = new ozpIwc.AsyncAction();

    var self = this;
    //If there is no request information, its a trivial "Permit"
    if(!request){
        return asyncAction.resolve('success',{
                'result':"Permit"
            });
    }


    var onError = function(err){
        asyncAction.resolve('failure',err);
    };
    //Format the request
    this.formatRequest(request)
        .success(function(formattedRequest){

            // Get the policies from the PRP
            self.prp.getPolicies(formattedRequest.policies)
                .success(function(policies){

                    var result = ozpIwc.policyAuth.PolicyCombining[formattedRequest.combiningAlgorithm](policies,formattedRequest.category);
                    var response = {
                        'result':result,
                        'request': request,
                        'formattedRequest': formattedRequest
                    };
                    if(result === "Permit"){
                       asyncAction.resolve('success',response);
                    } else {
                        onError(response);
                    }
                }).failure(onError);
        }).failure(onError);
    return asyncAction;
};


ozpIwc.policyAuth.PDP.prototype.formatAttributes = function(attributes,pip){
    attributes = ozpIwc.util.ensureArray(attributes);
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    var asyncs = [];
    for(var i in attributes){
        asyncs.push(this.formatAttribute(attributes[i],pip));
    }
    ozpIwc.AsyncAction.all(asyncs).success(function(attrs){
        var retObj = {};
        for(var i in attrs){
            if(Object.keys(attrs[i]).length > 0) {
                for (var j in attrs[i]) {
                    retObj[j] = attrs[i][j];
                }
            }
        }
        asyncAction.resolve("success",retObj);
    });
    return asyncAction;
};




    /**
 * Takes a URN, array of urns, object, array of objects, or array of any combination and fetches/formats to the
 * necessary structure to be used by a request of policy's category object.
 *
 * @method formatAttribute
 * @param {String|Object|Array<String|Object>}attribute The attribute to format
 * @param {ozpIwc.policyAuth.PIP} [pip] Policy information point, uses ozpIwc.authorization.pip by default.
 * @returns {ozpIwc.AsyncAction} returns an async action that will resolve with an object of the formatted attributes.
 *                               each attribute is ID indexed in the object, such that the formatting of id
 *                               `ozp:iwc:node` which has attributes `a` and `b`would resolve as follows:
 *                  ```
 *                  {
 *                      'ozp:iwc:node': {
 *                          'attributeValues': ['a','b']
 *                       }
 *                  }
 *                  ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatAttribute = function(attribute,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    if(!attribute){
        return asyncAction.resolve('success');
    }


    if(!attribute){
        //do nothing and return an empty object.
        asyncAction.resolve('success', {});

    }else if(typeof attribute === "string") {
        // If its a string, use it as a key and fetch its attrs from PIP
        pip.getAttributes(attribute)
            .success(function(attr){
                //TODO check if is an array or string (APPLY RECURSION!)
                asyncAction.resolve("success",attr);
            });

    } else if(Array.isArray(attribute)){
        // If its an array, its multiple actions. Wrap as needed
        return this.formatAttributes(attribute,pip);

    } else if(typeof attribute === "object"){
        // If its an object, make sure each key's value is an array.
        var keys = Object.keys(attribute);
        for (var i in keys) {
            var tmp = attribute[keys[i]];
            if (['string', 'number', 'boolean'].indexOf(typeof attribute[keys[i]]) >= 0) {
                attribute[keys[i]] =  [tmp];
            }
            attribute[keys[i]] = attribute[keys[i]] || [];
        }
        asyncAction.resolve("success",attribute);
    }
    return asyncAction;
};



/**
 * Formats an action to be used by a request or policy. Actions are not gathered from the Policy Information Point.
 * Rather they are string values explaining the operation to be permitted. To comply with XACML, these strings are
 * wrapped in objects for easier comparison
 *
 * @method formatAction
 * @param {String|Object|Array<String|Object>} action
 * @returns {Object} An object of formatted actions indexed by the ozp action id `ozp:action:id`.
 *                   An example output for actions ['read','write'] is as follows:
 *      ```
 *      {
 *          'ozp:iwc:action': {
 *              'attributeValue': ['read', 'write']
 *          }
 *      }
 *      ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatAction = function(action){

    var formatted =  [];

    var objectHandler = function(object,formatted){
        var values;
        // We only care about attributeValues
        if(object['ozp:iwc:action']){
            values = object['ozp:iwc:action'];
        }
        if(Array.isArray(values)) {
                return arrayHandler(values,formatted);
        } else if(['string', 'number', 'boolean'].indexOf(typeof values) >= 0){
            if(formatted.indexOf(values) < 0){
                formatted.push(values);
            }
        }
    };
    var arrayHandler = function(array,formatted){
        for(var i in array){
            if(typeof array[i] === 'string') {
                if (formatted.indexOf(array[i]) < 0) {
                    formatted.push(array[i]);
                }
            } else if(Array.isArray(array[i])){
                arrayHandler(array[i],formatted);
            } else if(typeof array[i] === 'object') {
                objectHandler(array[i],formatted);
            }
        }
    };

    if(!action){
        //do nothing and return an empty array
    }else if(typeof action === "string"){
        // If its a string, its a single action.
        formatted.push(action);
    } else if(Array.isArray(action)){
        arrayHandler(action,formatted);
    } else if(typeof action === 'object'){
        objectHandler(action,formatted);
    }

    return {'ozp:iwc:action': formatted};
};

/**
 * Takes a request object and applies any context needed from the PIP.
 *
 * @method formatRequest
 * @param {Object}          request
 * @param {String|Array<String>|Object}    request.subject URN(s) of attribute to gather, or formatted subject object
 * @param {String|Array<String>Object}     request.resource URN(s) of attribute to gather, or formatted resource object
 * @param {String|Array<String>Object}     request.action URN(s) of attribute to gather, or formatted action object
 * @param {String}                         request.combiningAlgorithm URN of combining algorithm
 * @param {Array<String|ozpIwc.policyAuth.Policy>}   request.policies either a URN or a formatted policy
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {ozpIwc.AsyncAction}  will resolve when all attribute formatting completes.
 *                    The resolution will pass a formatted
 *                      structured as so:
 *                    ```{
 *                      'category':{
 *                          "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": {
 *                              <AttributeId>: {
 *                                  "attributeValues": Array<Primitive>
 *                              }
 *                          },
 *                          "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": {
 *                              <AttributeId>: {
 *                                  "attributeValues": Array<Primitive>
 *                              }
 *                          },
 *                          "urn:oasis:names:tc:xacml:3.0:attribute-category:action": {
 *                              "ozp:iwc:action": {
 *                                  "attributeValues": Array<String>
 *                              }
 *                          }
 *                       },
 *                      'combiningAlgorithm': request.combiningAlgorithm,
 *                      'policies': request.policies
 *                     }```
 */
ozpIwc.policyAuth.PDP.prototype.formatRequest = function(request,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    request = request || {};
    request.subject = request.subject || {};
    request.resource = request.resource || {};
    request.action = request.action || {};
    request.combiningAlgorithm = request.combiningAlgorithm || this.defaultCombiningAlgorithm;
    var asyncs = [];

    var subjectAsync = this.formatAttribute(request.subject,pip);
    var resourceAsync = this.formatAttribute(request.resource,pip);
    var actions = this.formatAction(request.action);

    asyncs.push(subjectAsync,resourceAsync,actions);

    ozpIwc.AsyncAction.all(asyncs)
        .success(function(gatheredAttributes){
            var sub = gatheredAttributes[0];
            var res = gatheredAttributes[1];
            var act = gatheredAttributes[2];
            asyncAction.resolve('success',{
                'category':{
                    "subject": sub,
                    "resource": res,
                    "action": act
                },
                'combiningAlgorithm': request.combiningAlgorithm,
                'policies': request.policies
            });
        }).failure(function(err){
            asyncAction.resolve('failure',err);
        });
    return asyncAction;
};

/**
 * The URN of the default combining algorithm to use when basing a decision on multiple policies.
 * @property defaultCombiningAlgorithm
 * @type {String}
 * @default "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides"
 */
ozpIwc.policyAuth.PDP.prototype.defaultCombiningAlgorithm = "deny-overrides";

/**
 * Formats a category object. If needed the attribute data is gathered from the PIP.
 *
 * @method formatCategory
 * @param {String|Array<String>|Object} category the category (subject,resource,action) to format
 * @param {String} categoryId the category name used to map to its corresponding attributeId (see PDP.mappedID)
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {ozpIwc.AsyncAction}  will resolve with a category object formatted as so:
 *      ```
 *      {
 *          <AttributeId>: {
 *              'attributeValue': {Array<Primative>}
 *          }
 *      }
 *      ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatCategory = function(category,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    if(!category){
        return asyncAction.resolve('success');
    }

    pip = pip || this.pip;

    this.formatAttribute(category,pip)
        .success(function(attributes){
            for(var i in attributes['ozp:iwc:permissions']){
                attributes[i] = attributes['ozp:iwc:permissions'][i];
            }
            delete attributes['ozp:iwc:permissions'];
            asyncAction.resolve('success',attributes);
        }).failure(function(err){
            asyncAction.resolve('failure',err);
        });
    return asyncAction;
};

/**
 *
 * Category context handling for policy objects.
 * Takes object key-indexed categories for a policy
 * and returns an object key-indexed listing of formatted. Each category is keyed by its XACML URN. currently only
 * subject,resource, and action categories are supported.
 *
 * @method formatCategories
 * @param {Object} categoryObj An object of categories to format.
 * @param {Object|String|Array<String|Object>}[categoryObj[<categoryId>]] A category to format
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {ozpIwc.AsyncAction} will resolve an object of categories be structured as so:
 * ```
 * {
 *   '<categoryId>' : {
 *      <AttributeId>:{
 *          'attributeValue' : Array<Primitive>
 *      },
 *      <AttributeId>:{
 *          'attributeValue' : Array<Primitive>
 *      }
 *   },
 *   '<categoryId>': {...},
 *   ...
 * }
 * ```
 */
ozpIwc.policyAuth.PDP.prototype.formatCategories = function(categoryObj,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    var categoryAsyncs = [];
    var categoryIndexing = {};
    for(var i in categoryObj){
        categoryAsyncs.push(this.formatCategory(categoryObj[i],pip));
        categoryIndexing[i] = categoryAsyncs.length - 1;
    }
    ozpIwc.AsyncAction.all(categoryAsyncs)
        .success(function(categories){
            var map = {};
            var keys = Object.keys(categoryIndexing);
            for(var i in keys){
                map[keys[i]] = categories[categoryIndexing[keys[i]]] || {};
            }
            asyncAction.resolve('success',map);
        }).failure(function(err){
            asyncAction.resolve('failure',err);
        });
    return asyncAction;
};

ozpIwc = ozpIwc || {};


ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * Policy Information Point
 *
 * @param config
 * @param {Object} config.attributes
 * @constructor
 */
ozpIwc.policyAuth.PIP = ozpIwc.util.extend(ozpIwc.policyAuth.SecurityAttribute,function(config) {
    ozpIwc.policyAuth.SecurityAttribute.apply(this,arguments);
});


/**
 * Returns an asyncAction that will resolve with the attributes stored at the given URN.
 *
 * @method getAttributes(id)
 * @param {String} [subjectId] – The authenticated identity to get attributes for.
 * @returns {ozpIwc.AsyncAction} – Resolves an object of the attributes of the subject.
 * @example URN "ozp:storage:myAttrs" may contain "ozp:iwc:loginTime" and "ozp:iwc:name".
 * getAttributes("ozp:storage:myAttrs") would resolve with the following:
 * ```
 * {
 *      'ozp:iwc:loginTime' : {
 *         'attributeValue': Array<Primative>
 *     },
 *      'ozp:iwc:name' : {
 *         'attributeValue': Array<Primative>
 *     }
 * }
 * ```
 */
ozpIwc.policyAuth.PIP.prototype.getAttributes = function(id){
    var asyncAction = new ozpIwc.AsyncAction();
    var self = this;

    if(this.attributes[id]) {
        return asyncAction.resolve('success', self.attributes[id]);
    } else {
        ozpIwc.util.ajax({
            href: id,
            method: "GET"
        }).then(function(data){
            if(typeof data !== "object") {
                return asyncAction.resolve('failure',"Invalid data loaded from the remote PIP");
            }
            self.attributes[id] = {};
            for(var i in data){
                self.attributes[id][i] =ozpIwc.util.ensureArray(data[i]);
            }
            asyncAction.resolve('success', self.attributes[id]);
        })['catch'](function(err){
            asyncAction.resolve('failure',err);
        });
        return asyncAction;
    }

};
/**
 * Sets the desired attributes in the cache at the specified URN.
 *
 * @method grantAttributes(subjectId,attributes)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {object} [attributes] – The attributes to grant (replacing previous values, if applicable)
 */
ozpIwc.policyAuth.PIP.prototype.grantAttributes = function(subjectId,attributes){
    var attrs = {};
    for(var i in attributes){
        attrs[i] =ozpIwc.util.ensureArray(attributes[i]);
    }
    this.attributes[subjectId] = attrs;
};

/**
 * Merges the attributes stored at the parentId urn into the given subject. All merge conflicts take the parent
 * attribute. Will resolve with the subject when completed.
 *
 * @method grantParent(subjectId,parentSubjectId)
 * @param {String} [subjectId] – The recipient of attributes.
 * @param {String} [parentSubjectId] – The subject to inherit attributes from.
 * @returns {ozpIwc.AsyncAction} resolves with the subject and its granted attributes merged in.
 */
ozpIwc.policyAuth.PIP.prototype.grantParent = function (subjectId,parentId){
    var asyncAction = new ozpIwc.AsyncAction();
    this.attributes[subjectId] = this.attributes[subjectId] || {};
    var self = this;

    if(self.attributes[parentId]){
        for(var i in self.attributes[parentId]){
            self.attributes[subjectId][i] = self.attributes[subjectId][i] || [];
            for(var j in self.attributes[parentId][i]) {
                if (self.attributes[subjectId][i].indexOf(self.attributes[parentId][i][j]) < 0) {
                    self.attributes[subjectId][i].push(self.attributes[parentId][i][j]);
                }
            }
        }
        return asyncAction.resolve('success',self.attributes[subjectId]);

    } else {
        self.getAttributes(parentId)
            .success(function(attributes){
                for(var i in attributes){
                    if(self.attributes[subjectId].indexOf(attributes[i]) < 0) {
                        self.attributes[subjectId].push(attributes[i]);
                    }
                }
                asyncAction.resolve('success',self.attributes[subjectId]);
            }).failure(function(err){
                asyncAction.resolve('failure',err);
            });
        return asyncAction;
    }
};

/**
 * For the given attribute name, figure out what the value of that attribute should be 
 * given the two values.
 * @TODO Currently, this just promotes the two scalars to a bag
 *
 * @method combineAttributeValues
 * @param {type} attributeName
 * @param {type} value1
 * @param {type} value2
 * @returns {Array}
 */
ozpIwc.policyAuth.PIP.prototype.combineAttributeValues=function(attributeName,value1,value2) {
    return [value1,value2];
};

/**
 * Creates an attribute set that's the union of the two given attribute sets
 *
 * @method attributeUnion
 * @param {object} attr1
 * @param {object} attr2
 * @returns {object}
 */
ozpIwc.policyAuth.PIP.prototype.attributeUnion=function(attr1,attr2) {
    var rv={};
    ozpIwc.object.eachEntry(attr1,function(key,value) {
        if(Array.isArray(value)) {
            rv[key]=value.slice();
        } else {
            rv[key]=value;
        }
    });
    ozpIwc.object.eachEntry(attr2,function(key,value) {
        if(!(key in rv)) {
            rv[key]=value;
        } else if(Array.isArray(rv[key])) {
            rv[key]=rv[key].concat(value);
        } else {
            rv[key]=this.combineAttributeValues(rv[key],value);
        }
    },this);
    return rv;
};

/**
 * Classes related to security aspects of the IWC.
 * @module bus
 * @submodule bus.security
 */

/**
 * Attribute Based Access Control policies.
 * @class ozpIwcPolicies
 * @static
 */
ozpIwc.ozpIwcPolicies={};

/**
 * Returns `permit` when the request's object exists and is empty.
 *
 * @static
 * @method permitWhenObjectHasNoAttributes
 * @param request
 *
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.permitWhenObjectHasNoAttributes=function(request) {
    if(request.object && Object.keys(request.object).length===0) {
        return "Permit";
    }
    return "Undetermined";
};
/**
 * Returns `permit` when the request's subject contains all of the request's object.
 *
 * @static
 * @method subjectHasAllObjectAttributes
 * @param request
 *
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.subjectHasAllObjectAttributes=function(request) {
    // if no object permissions, then it's trivially true
    if(!request.object) {
        return "Permit";
    }
    var subject = request.subject || {};
    if(ozpIwc.util.objectContainsAll(subject,request.object,this.implies)) {
        return "Permit";
    }
    return "Deny";
};

/**
 * Returns `permit` for any scenario.
 *
 * @static
 * @method permitAll
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.permitAll=function() {
    return "Permit";
};


/**
 * Returns `Deny` for any scenario.
 *
 * @static
 * @method denyAll
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.denyAll=function() {
    return "Deny";
};



/**
 * Applies trivial logic to determing a subject's containing of object values
 * @static
 * @method implies
 * @param {Array} subjectVal
 * @param {Array} objectVal
 *
 * @returns {Boolean}
 */
ozpIwc.ozpIwcPolicies.implies=function(subjectVal,objectVal) {
    // no object value is trivially true
    if(objectVal===undefined || objectVal === null) {
        return true;
    }
    // no subject value when there is an object value is trivially false
    if(subjectVal===undefined || subjectVal === null) {
        return false;
    }

    // convert both to arrays, if necessary
    subjectVal=ozpIwc.util.ensureArray(subjectVal);
    objectVal=ozpIwc.util.ensureArray(objectVal);

    // confirm that every element in objectVal is also in subjectVal
    return ozpIwc.util.arrayContainsAll(subjectVal,objectVal);
};

/**
 * Determines if a request should be permitted by comparing its action to the requested policies action. Then testing
 * if the request subject passes all of the request resources.
 * @method defaultPolicy
 * @param request
 * @param action
 * @returns {string} NotApplicable, Deny, or Permit
 */
ozpIwc.ozpIwcPolicies.defaultPolicy = function(request,action){
    action = ozpIwc.util.ensureArray(action);
    if(!ozpIwc.util.arrayContainsAll(action,request.action['ozp:iwc:action'])) {
        return "NotApplicable";
    } else if(!ozpIwc.util.objectContainsAll(request.subject,request.resource,ozpIwc.ozpIwcPolicies.implies)) {
        return "Deny";
    } else {
        return "Permit";
    }
};

ozpIwc.ozpIwcPolicies.defaultPolicies = {};

/**
 * Allows origins to connect that are included in the hard coded whitelist.
 * @method '/policy/connect'
 * @param request
 * @returns {string}
 */
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/connect'] = function(request){
    var policyActions = ['connect'];

    if(!ozpIwc.util.arrayContainsAll(policyActions,request.action['ozp:iwc:action'])){
        return "NotApplicable";
    } else {
        return "Permit";
    }
};

/**
 * Applies the sendAs policy requirements to a default policy. The given request must have an action of 'sendAs'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/sendAs'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'sendAs');
};

/**
 * Applies the receiveAs policy requirements to a default policy. The given request must have an action of 'receiveAs'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/receiveAs'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'receiveAs');
};

/**
 * Applies the read policy requirements to a default policy. The given request must have an action of 'read'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/read'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'read');
};

/**
 * Applies the api access policy requirements to a default policy. The given request must have an action of 'access'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/apiNode'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'access');
};

ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.PolicyCombining = ozpIwc.policyAuth.PolicyCombining || {};


/**
 *
 *
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides
 */
ozpIwc.policyAuth.PolicyCombining['deny-overrides'] =
        function(policies,request){
    var atLeastOneErrorD,
        atLeastOneErrorP,
        atLeastOneErrorDP,
        atLeastOnePermit = false;

    for(var i in policies){
        var decision = policies[i](request);
        switch(decision){
            case "Deny":
                return "Deny";
            case "Permit":
                atLeastOnePermit = true;
                break;
            case "NotApplicable":
                continue;
            case "Indeterminate{D}":
                atLeastOneErrorD = true;
                break;
            case "Indeterminate{P}":
                atLeastOneErrorP = true;
                break;
            case "Indeterminate{DP}":
                atLeastOneErrorDP = true;
                break;
            default:
                continue;
        }
    }

    if(atLeastOneErrorDP){
        return "Indeterminate{DP}";
    } else if(atLeastOneErrorD && (atLeastOneErrorP || atLeastOnePermit)){
        return "Indeterminate{DP}";
    } else if(atLeastOneErrorD){
        return "Indeterminate{D}";
    } else if(atLeastOnePermit) {
        return "Permit";
    } else if(atLeastOneErrorP){
        return "Indeterminate{P}";
    }

    return "NotApplicable";

};


/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:permit-overrides
 */
ozpIwc.policyAuth.PolicyCombining['permit-overrides'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:1.0:policy-combining-algorithm:first-applicable
 */
ozpIwc.policyAuth.PolicyCombining['first-applicable'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:1.0:policy-combining-algorithm:only-one-applicable
 */
ozpIwc.policyAuth.PolicyCombining['only-one-applicable'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:ordered-deny-overrides
 */
ozpIwc.policyAuth.PolicyCombining['ordered-deny-overrides'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:ordered-permit-overrides
 */
ozpIwc.policyAuth.PolicyCombining['ordered-permit-overrides'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-unless-permit
 */
ozpIwc.policyAuth.PolicyCombining['deny-unless-permit'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:permit-unless-deny
 */
ozpIwc.policyAuth.PolicyCombining['permit-unless-deny'] =
        function(){

};
ozpIwc = ozpIwc || {};


ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * Policy Repository Point
 *
 * @param config
 * @param {Object} config.policyCache
 * @constructor
 */
ozpIwc.policyAuth.PRP = function(config){
    config = config || {};

    this.persistentPolicies = config.persistentPolicies || [];
    this.policyCache = config.policyCache || ozpIwc.ozpIwcPolicies.defaultPolicies;


};


/**
 * Gathers policies by their URN. These policies may need formatting by the formatPolicies function to gather any
 * attribute data needed for the policy evaluation.
 * If a policy cannot be found, it is labeled as a "denyAll" policy and placed in the cache. Thus, making any permission
 * check using said policy always deny.
 *
 * @method getPolicy(policyURIs)
 * @param {String | Array<String> } [policyURIs] The subject attributes or id performing the action.
 * @param {String} [combiningAlgorithm] Defaults to “deny-overrides”.
 * @return {ozpIwc.AsyncAction} will resolve with an array of policy data.
 */
ozpIwc.policyAuth.PRP.prototype.getPolicies = function(policyURIs){
    var asyncAction = new ozpIwc.AsyncAction();
    policyURIs = policyURIs || [];
    policyURIs = ozpIwc.util.ensureArray(policyURIs);
    var policies = [];

    var policiesToGather = this.persistentPolicies.concat(policyURIs);
    for(var i in policiesToGather){
        if(this.policyCache[policiesToGather[i]]){
            policies.push(ozpIwc.util.clone(this.policyCache[policiesToGather[i]]));
        } else {
            var async = this.fetchPolicy(policiesToGather[i]);

            //Push the policy fetch to the array, when it resolves its value (policy) will be part of the array
            policies.push(async);
        }
    }

    // If there are no policies to check against, assume trivial and permit
    if(policies.length === 0){
        return asyncAction.resolve('success',[ozpIwc.ozpIwcPolicies.permitAll]);
    }

    return ozpIwc.AsyncAction.all(policies);
};



/**
 * The URN of the default combining algorithm to use when basing a decision on multiple rules in a policy.
 * @TODO not used.
 * @property defaultCombiningAlgorithm
 * @type {String}
 * @default 'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides'
 */
ozpIwc.policyAuth.PRP.prototype.defaultCombiningAlgorithm =
    'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides';

/**
 * Fetches the requested policy and stores a copy of it in the cache. Returns a denyAll if policy is unobtainable.
 * @method fetchPolicy
 * @param {String} policyURI the uri to gather the policy from
 * @returns {AsyncAction} will resolve with the gathered policy constructed as an ozpIwc.policyAuth.Policy.
 */
ozpIwc.policyAuth.PRP.prototype.fetchPolicy = function(policyURI){
    var asyncAction = new ozpIwc.AsyncAction();
    var self = this;
    ozpIwc.util.ajax({
        'method': "GET",
        'href': policyURI
    }).then(function(data){
        self.policyCache[policyURI] = self.formatPolicy(data.response);
        asyncAction.resolve('success',ozpIwc.util.clone(self.policyCache[policyURI]));
    })['catch'](function(e){
        //Note: failure resolves success because we force a denyAll policy.
        asyncAction.resolve('success',self.getDenyall(policyURI));
    });
    return asyncAction;
};

/**
 * Turns JSON data in to ozpIwc.policyAuth.Policy
 * @method formatPolicy
 * @param data
 * @returns {ozpIwc.policyAuth.Policy}
 */
ozpIwc.policyAuth.PRP.prototype.formatPolicy = function(data){
    return new ozpIwc.policyAuth.Policy(data);
};

/**
 * Returns a policy that will always deny any request. Said policy is stored in the cache under the given URN
 * @param urn
 * @returns {ozpIwc.policyAuth.Policy} a denyAll policy
 */
ozpIwc.policyAuth.PRP.prototype.getDenyall = function(urn){
    if(this.policyCache[urn]){
        return this.policyCache[urn];
    } else {
        this.policyCache[urn] = ozpIwc.ozpIwcPolicies.denyAll;
        return this.policyCache[urn];
    }
};

/** @namespace **/

/**
 * Classes related to security aspects of the IWC.
 * @module bus
 * @submodule bus.network
 */

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of
 * the localStorageLink that bypasses most of the garbage collection issues.
 *
 * <p> When a packet is sent, this link turns it to a string, creates a key with that value, and
 * immediately deletes it.  This still sends the storage event containing the packet as the key.
 * This completely eliminates the need to garbage collect the localstorage space, with the associated
 * mutex contention and full-buffer issues.
 *
 * @todo Compress the key
 *
 * @class KeyBroadcastLocalStorageLink
 * @namespace ozpIwc
 * @constructor
 *
 * @param {Object} [config] Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] The peer to connect to.
 * @param {String} [config.prefix='ozpIwc'] Namespace for communicating, must be the same for all peers on the same network.
 * @param {String} [config.selfId] Unique name within the peer network.  Defaults to the peer id.
 * @param {Number} [config.maxRetries] Number of times packet transmission will retry if failed. Defaults to 6.
 * @param {Number} [config.queueSize] Number of packets allowed to be queued at one time. Defaults to 1024.
 * @param {Number} [config.fragmentSize] Size in bytes of which any TransportPacket exceeds will be sent in FragmentPackets.
 * @param {Number} [config.fragmentTime] Time in milliseconds after a fragment is received and additional expected
 * fragments are not received that the message is dropped.
 */
ozpIwc.KeyBroadcastLocalStorageLink = function (config) {
    config = config || {};

    /**
     * Namespace for communicating, must be the same for all peers on the same network.
     * @property prefix
     * @type String
     * @default "ozpIwc"
     */
    this.prefix = config.prefix || 'ozpIwc';

    /**
     * The peer this link will connect to.
     * @property peer
     * @type ozpIwc.Peer
     * @default ozpIwc.defaultPeer
     */
    this.peer = config.peer || ozpIwc.defaultPeer;

    /**
     * Unique name within the peer network.  Defaults to the peer id.
     * @property selfId
     * @type String
     * @default ozpIwc.defaultPeer.selfId
     */
    this.selfId = config.selfId || this.peer.selfId;

    this.metricsPrefix="keyBroadcastLocalStorageLink."+this.selfId;
    this.droppedFragmentsCounter=ozpIwc.metrics.counter(this.metricsPrefix,'fragmentsDropped');
    this.fragmentsReceivedCounter=ozpIwc.metrics.counter(this.metricsPrefix,'fragmentsReceived');

    this.packetsSentCounter=ozpIwc.metrics.counter(this.metricsPrefix,'packetsSent');
    this.packetsReceivedCounter=ozpIwc.metrics.counter(this.metricsPrefix,'packetsReceived');
    this.packetParseErrorCounter=ozpIwc.metrics.counter(this.metricsPrefix,'packetsParseError');
    this.packetsFailedCounter=ozpIwc.metrics.counter(this.metricsPrefix,'packetsFailed');
    
    this.latencyInTimer=ozpIwc.metrics.timer(this.metricsPrefix,'latencyIn');
    this.latencyOutTimer=ozpIwc.metrics.timer(this.metricsPrefix,'latencyOut');
    /**
     * Milliseconds to wait before deleting this link's keys
     * @todo UNUSUED
     * @property myKeysTimeout
     * @type Number
     * @default 5000
     */
    this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds

    /**
     * Milliseconds to wait before deleting other link's keys
     * @todo UNUSUED
     * @property otherKeysTimeout
     * @type Number
     * @default 120000
     */
    this.otherKeysTimeout = config.otherKeysTimeout || 2 * 60000; // 2 minutes


    /**
     * The maximum number of retries the link will take to send a package. A timeout of
     * max(1, 2^( <retry count> -1) - 1) milliseconds occurs between send attempts.
     * @property maxRetries
     * @type Number
     * @default 6
     */
    this.maxRetries = config.maxRetries || 6;

    /**
     * Maximum number of packets that can be in the send queue at any given time.
     * @property queueSize
     * @type Number
     * @default 1024
     */
    this.queueSize = config.queueSize || 1024;

    /**
     * A queue for outgoing packets. If this queue is full further packets will not be added.
     * @property sendQueue
     * @type Array[]
     * @default []
     */
    this.sendQueue = this.sendQueue || [];

    /**
     * An array of temporarily held received packet fragments indexed by their message key.
     * @type Array[]
     * @default []
     */
    this.fragments = this.fragments || [];

    /**
     * Minimum size in bytes that a packet will broken into fragments.
     * @property fragmentSize
     * @type Number
     * @default 1310720
     */
    this.fragmentSize = config.fragmentSize || (5 * 1024 * 1024) / 2 / 2; //50% of 5mb, divide by 2 for utf-16 characters

    /**
     * The amount of time allotted to the Link to wait between expected fragment packets. If an expected fragment
     * is not received within this timeout the packet is dropped.
     * @property fragmentTimeout
     * @type Number
     * @default 1000
     */
    this.fragmentTimeout = config.fragmentTimeout || 1000; // 1 second

    //Add fragmenting capabilities
    String.prototype.chunk = function (size) {
        var res = [];
        for (var i = 0; i < this.length; i += size) {
            res.push(this.slice(i, i + size));
        }
        return res;
    };

    // Hook into the system
    var self = this;
    var packet;
    var receiveStorageEvent = function (event) {
        if(event.newValue) {
            try {
                packet = JSON.parse(event.newValue);
            } catch (e) {
                ozpIwc.log.error("Parse error on " + event.newValue);
                self.packetParseErrorCounter.inc();
                return;
            }
            if (packet.data.fragment) {
                self.handleFragment(packet);
            } else {
                self.forwardToPeer(packet);
            }
        }
    };
    if(ozpIwc.util.getInternetExplorerVersion() >= 0) {
        // IE can keep storage events between refreshes.  If we give it a second, it'll
        // dump all of them on the floor
        window.setTimeout(function () {
            ozpIwc.util.addEventListener('storage', receiveStorageEvent);
        }, 500);
    } else {
        ozpIwc.util.addEventListener('storage', receiveStorageEvent);
    }

    this.peer.on("send", function (event) {
        self.send(event.packet);
    });

    this.peer.on("beforeShutdown", function () {
        ozpIwc.util.removeEventListener('storage', receiveStorageEvent);
    }, this);

};

ozpIwc.KeyBroadcastLocalStorageLink.prototype.forwardToPeer=function(packet) {
    this.peer.receive(this.linkId, packet);
    this.packetsReceivedCounter.inc();
    if(packet.data.time) {
        this.latencyInTimer.mark(ozpIwc.util.now() - packet.data.time);
    }
};

/**
 * Handles fragmented packets received from the router. When all fragments of a message have been received,
 * the resulting packet will be passed on to the
 * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/peer:property"}}registered peer{{/crossLink}}.
 *
 * @method handleFragment
 * @param {ozpIwc.NetworkPacket} packet NetworkPacket containing an ozpIwc.FragmentPacket as its data property
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.handleFragment = function (packet) {
    // Check to make sure the packet is a fragment and we haven't seen it
    if (this.peer.haveSeen(packet)) {
        return;
    }

    var key = packet.data.msgId;

    this.storeFragment(packet);

    var defragmentedPacket = this.defragmentPacket(this.fragments[key]);

    if (defragmentedPacket) {

        // clear the fragment timeout
        window.clearTimeout(this.fragments[key].fragmentTimer);

        // Remove the last sequence from the known packets to reuse it for the defragmented packet
        var packetIndex = this.peer.packetsSeen[defragmentedPacket.srcPeer].indexOf(defragmentedPacket.sequence);
        delete this.peer.packetsSeen[defragmentedPacket.srcPeer][packetIndex];

        this.forwardToPeer(defragmentedPacket);

        delete this.fragments[key];
    }
};

/**
 *  Stores a received fragment. When the first fragment of a message is received, a timer is set to destroy the storage
 *  of the message fragments should not all messages be received.
 *
 * @method storeFragment
 * @param {ozpIwc.NetworkPacket} packet NetworkPacket containing an {{#crossLink "ozpIwc.FragmentPacket"}}{{/crossLink}} as its data property
 *
 * @returns {Boolean} result true if successful.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.storeFragment = function (packet) {
    if (!packet.data.fragment) {
        return null;
    }

    // NetworkPacket properties
    var sequence = packet.sequence;
    var srcPeer = packet.srcPeer;
    // FragmentPacket Properties
    var key = packet.data.msgId;
    var id = packet.data.id;
    var chunk = packet.data.chunk;
    var total = packet.data.total;

    if (key === undefined || id === undefined) {
        return null;
    }

    // If this is the first fragment of a message, add the storage object
    if (!this.fragments[key]) {
        this.fragments[key] = {};
        this.fragments[key].chunks = [];

        var self = this;
        self.key = key;
        self.total = total ;

        // Add a timeout to destroy the fragment should the whole message not be received.
        this.fragments[key].timeoutFunc = function () {
            self.droppedFragmentsCounter.inc(self.total);
            delete self.fragments[self.key];
        };
    }

    // Restart the fragment drop countdown
    window.clearTimeout(this.fragments[key].fragmentTimer);
    this.fragments[key].fragmentTimer = window.setTimeout(this.fragments[key].timeoutFunc, this.fragmentTimeout);

    // keep a copy of properties needed for defragmenting, the last sequence & srcPeer received will be
    // reused in the defragmented packet
    this.fragments[key].total = total || this.fragments[key].total ;
    this.fragments[key].sequence = (sequence !== undefined) ? sequence : this.fragments[key].sequence;
    this.fragments[key].srcPeer = srcPeer || this.fragments[key].srcPeer;
    this.fragments[key].chunks[id] = chunk;

    // If the necessary properties for defragmenting aren't set the storage fails
    if (this.fragments[key].total === undefined || this.fragments[key].sequence === undefined ||
        this.fragments[key].srcPeer === undefined) {
        return null;
    } else {
        this.fragmentsReceivedCounter.inc();
        return true;
    }
};

/**
 * Rebuilds the original packet sent across the keyBroadcastLocalStorageLink from the fragments it was broken up into.
 *
 * @method defragmentPacket
 * @param {ozpIwc.FragmentStore} fragments the grouping of fragments to reconstruct
 *
 * @returns {ozpIwc.NetworkPacket} result the reconstructed NetworkPacket with TransportPacket as its data property.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.defragmentPacket = function (fragments) {
    if (fragments.total !== fragments.chunks.length) {
        return null;
    }
    try {
        var result = JSON.parse(fragments.chunks.join(''));
        return {
            defragmented: true,
            sequence: fragments.sequence,
            srcPeer: fragments.srcPeer,
            data: result
        };
    } catch (e) {
        return null;
    }
};

/**
 * Publishes a packet to other peers. If the sendQueue is full the send will not occur. If the TransportPacket is larger
 * than the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/fragmentSize:property"}}{{/crossLink}}, an
 * {{#crossLink "ozpIwc.FragmentPacket"}}{{/crossLink}} will be sent instead.
 *
 * @method send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.send = function (packet) {
    var str;
    try {
       str = JSON.stringify(packet.data);
    } catch (e){
        this.packetsFailedCounter.inc();
        var msgId = packet.msgId || "unknown";
        ozpIwc.log.error("Failed to write packet(msgId=" + msgId+ "):" + e.message);
        return;
    }

    if (str.length < this.fragmentSize) {
        this.queueSend(packet);
    } else {
        var fragments = str.chunk(this.fragmentSize);

        // Use the original packet as a template, delete the data and
        // generate new packets.
        var self = this;
        self.data= packet.data;
        delete packet.data;

        var fragmentGen = function (chunk, template) {

            template.sequence = self.peer.sequenceCounter++;
            template.data = {
                fragment: true,
                msgId: self.data.msgId,
                id: i,
                total: fragments.length,
                chunk: chunk
            };
            return template;
        };

        // Generate & queue the fragments
        for (var i = 0; i < fragments.length; i++) {
            this.queueSend(fragmentGen(fragments[i], packet));
        }
    }
};

/**
 * Places a packet in the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/sendQueue:property"}}{{/crossLink}}
 * if it does not already hold {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/queueSize:property"}}{{/crossLink}}
 * amount of packets.
 *
 * @method queueSend
 * @param packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.queueSend = function (packet) {
    if (this.sendQueue.length < this.queueSize) {
        this.sendQueue = this.sendQueue.concat(packet);
        while (this.sendQueue.length > 0) {
            this.attemptSend(this.sendQueue.shift());
        }
    } else {
        this.packetsFailedCounter.inc();
        ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + " Send queue full.");
    }
};

/**
 * Recursively tries sending the packet
 * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/maxRetries:property"}}{{/crossLink}} times.
 * The packet is dropped and the send fails after reaching max attempts.
 *
 * @method attemptSend
 * @param {ozpIwc.NetworkPacket} packet
 * @param {Number} [attemptCount] number of times attempted to send packet.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.attemptSend = function (packet, retryCount) {

    var sendStatus = this.sendImpl(packet);
    if (sendStatus) {
        var self = this;
        retryCount = retryCount || 0;
        var timeOut = Math.max(1, Math.pow(2, (retryCount - 1))) - 1;

        if (retryCount < self.maxRetries) {
            retryCount++;
            // Call again but back off for an exponential amount of time.
            window.setTimeout(function () {
                self.attemptSend(packet, retryCount);
            }, timeOut);
        } else {
            this.packetsFailedCounter.inc();
            ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + sendStatus);
            return sendStatus;
        }
    }
};

/**
 * Implementation of publishing packets to peers through localStorage. If the localStorage is full or a write collision
 * occurs, the send will not occur. Returns status of localStorage write, null if success.
 *
 * @todo move counter.inc() out of the impl and handle in attemptSend?
 * @method sendImpl
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.sendImpl = function (packet) {
    var sendStatus;
    try {
        var p = JSON.stringify(packet);
        localStorage.setItem("x", p);
        this.packetsSentCounter.inc();
        if(packet.data.time) {
            this.latencyOutTimer.mark(ozpIwc.util.now() - packet.data.time);
        }
        localStorage.removeItem("x");
        sendStatus = null;
    }
    catch (e) {
        if(e.message === "localStorage is null"){
            // Firefox about:config dom.storage.enabled = false : no mitigation with current links
            ozpIwc.util.alert("Cannot locate localStorage. Contact your system administrator.", e);
        } else if(e.code === 18){
            // cookies disabled : no mitigation with current links
            ozpIwc.util.alert("Ozone requires your browser to accept cookies. Contact your system administrator.", e);
        } else {
            // If the error can't be mitigated, bubble it up
            sendStatus = e;
        }
    }
    finally {
        return sendStatus;
    }
};


/**
 * The peer handles low-level broadcast communications between multiple browser contexts.
 * Links do the actual work of moving the packet to other browser contexts.  The links
 * call {{#crossLink "ozpIwc.Peer/receive:method"}}{{/crossLink}} when they need to deliver a packet to this peer and
 * hook the {{#crossLink "ozpIwc.Peer/send:method"}}{{/crossLink}} event in order to send packets.
 * @class Peer
 * @namespace ozpIwc
 * @constructor
 * @mixin ozpIwc.Events
 */
ozpIwc.Peer=function() {


    /**
     * A generated random 4 byte id
     * @property selfId
     * @type String
     * @default {{#crossLink "ozpIwc.util/generateId:method"}}{{/crossLink}}
     */
    this.selfId=ozpIwc.util.generateId();

    this.metricPrefix="peer."+this.selfId;

    /**
     * @TODO (DOC)
     * @property sequenceCounter
     * @type Number
     * @default 0
     */
    this.sequenceCounter=0;

    /**
     * A history of packets seen from each peer. Each key is a peer name, each value is an array of the last 50 packet
     * ids seen.
     * @property packetsSeen
     * @type Object
     * @default {}
     */
    this.packetsSeen={};

    /**
     * @property knownPeers
     * @type Object
     * @default {}
     */
    this.knownPeers={};

    /**
     * Eventing module for the Peer.
     * @property events
     * @type ozpIwc.Event
     * @default ozpIwc.Event
     */
    this.events=new ozpIwc.Event();
    this.events.mixinOnOff(this);

    var self=this;

    // Shutdown handling
    this.unloadListener=function() {
        self.shutdown();
    };
    ozpIwc.util.addEventListener('beforeunload',this.unloadListener);

};

/**
 * The peer has received a packet from other peers.
 * @event #receive
 *
 * @param {ozpIwc.NetworkPacket} packet
 * @param {String} linkId
 */


/**
 * A cancelable event that allows listeners to override the forwarding of
 * a given packet to other peers.
 * @event #preSend
 * @extends ozpIwc.CancelableEvent
 *
 * @param {ozpIwc.NetworkPacket} packet
 */

/**
 * Notifies that a packet is being sent to other peers.  Links should use this
 * event to forward packets to other peers.
 * @event #send
 *
 * @param {ozpIwc.NetworkPacket} packet
 */

/**
 * Fires when the peer is being explicitly or implicitly shut down.
 * @event #beforeShutdown
 */

/**
 * Number of sequence Id's held in an entry of {{#crossLink "ozpIwc.Peer/packetsSeen:property"}}{{/crossLink}}
 * @property maxSeqIdPerSource
 * @static
 * @type Number
 * @default 500
 */
ozpIwc.Peer.maxSeqIdPerSource=500;

/**
 * Determine if the peer has already seen the packet in question.
 *
 * @method haveSeen
 * @param {ozpIwc.NetworkPacket} packet
 *
 * @returns {Boolean}
 */
ozpIwc.Peer.prototype.haveSeen=function(packet) {
    // don't forward our own packets
    if (packet.srcPeer === this.selfId) {
        ozpIwc.metrics.counter(this.metricPrefix,'droppedOwnPacket').inc();
        return true;
    }
    var seen = this.packetsSeen[packet.srcPeer];
    if (!seen) {
        seen = this.packetsSeen[packet.srcPeer] = [];
    }

    // abort if we've seen the packet before
    if (seen.indexOf(packet.sequence) >= 0) {
        return true;
    }

    //remove oldest array members when truncate needed
    seen.unshift(packet.sequence);
    if (seen.length >= ozpIwc.Peer.maxSeqIdPerSource) {
        seen.length = ozpIwc.Peer.maxSeqIdPerSource;
    }
    return false;
};

/**
 * Used by routers to broadcast a packet to network.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Peer/#preSend:event"}}{{/crossLink}}
 *   - {{#crossLink "ozpIwc.Peer/#send:event"}}{{/crossLink}}
 *
 * @method send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.Peer.prototype.send= function(packet) {
    var networkPacket={
        srcPeer: this.selfId,
        sequence: this.sequenceCounter++,
        data: packet
    };

    var preSendEvent=new ozpIwc.CancelableEvent({'packet': networkPacket});

    this.events.trigger("preSend",preSendEvent);
    if(!preSendEvent.canceled) {
        ozpIwc.metrics.counter(this.metricPrefix,'sent').inc();
        if(packet.time) {
            ozpIwc.metrics.timer(this.metricPrefix,'latencyOut').mark(ozpIwc.util.now() - packet.time);
        }
        this.events.trigger("send",{'packet':networkPacket});
    } else {
        ozpIwc.metrics.counter(this.metricPrefix,'sendRejected').inc();
    }
};

/**
 * Called by the links when a new packet is received.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Peer/#receive:event"}}{{/crossLink}}
 *
 * @method receive
 * @param {String} linkId
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.Peer.prototype.receive=function(linkId,packet) {
    // drop it if we've seen it before
    if(this.haveSeen(packet)) {
        ozpIwc.metrics.counter(this.metricPrefix,'dropped').inc();
        return;
    }
    ozpIwc.metrics.counter(this.metricPrefix,'received').inc();
    if(packet.data.time) {
        ozpIwc.metrics.timer(this.metricPrefix,'latencyIn').mark(ozpIwc.util.now() - packet.data.time);
    }

    this.events.trigger("receive",{'packet':packet,'linkId': linkId});
};

/**
 * Explicitly shuts down the peer.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Peer/#receive:event"}}{{/crossLink}}
 *
 * @method shutdown
 */
ozpIwc.Peer.prototype.shutdown=function() {
    this.events.trigger("beforeShutdown");
    ozpIwc.util.removeEventListener('beforeunload',this.unloadListener);
};


/**
 * Various packet definitions for the network aspects of the IWC. These are not instantiable, rather guidelines for
 * conforming to classes that use them.
 * @module bus.network
 * @submodule bus.network.packets
 */

/**
 * Network Packets
 * @class NetworkPacket
 * @namespace ozpIwc
 */

/**
 * The id of the peer who broadcast this packet.
 * @property srcPeer
 * @type String
 */

/**
 * A monotonically increasing, unique identifier for this packet.
 * @property sequence
 * @type String
 */

/**
 * The payload of this packet.
 * @property data
 * @type Object
 */


/**
 * Packet format for the data property of ozpIwc.NetworkPacket when working with fragmented packets.
 * @class FragmentPacket
 * @namespace ozpIwc
 */

/**
 * Flag for knowing this is a fragment packet. Should be true.
 * @property fragment
 * @type boolean
 */

/**
 * The msgId from the TransportPacket broken up into fragments.
 * @property msgId
 * @type Number
 */

/**
 * The position amongst other fragments of the TransportPacket.
 * @property id
 * @type Number
 */

/**
 * Total number of fragments of the TransportPacket expected.
 * @property total
 * @type Number
 */

/**
 * A segment of the TransportPacket in string form.
 * @property chunk
 * @type String
 */

/**
 * Storage for Fragment Packets
 * @class ozpIwc.FragmentStore
 */

/**
 *  The sequence of the latest fragment received.
 * @property sequence
 * @type Number
 */

/**
 * The total number of fragments expected.
 * @property total
 * @type Number
 */

/**
 * The srcPeer of the fragments expected.
 * @property srcPeer
 * @type String
 */

/**
 * String segments of the TransportPacket.
 * @property chunks
 * @type Array[String]
 */

/**
 * @submodule bus.transport
 */

/**
 * @class Participant
 * @namespace ozpIwc
 * @constructor
 * @mixes ozpIwc.security.Actor
 * @property {String} address The assigned address to this address.
 * @property {ozpIwc.policyAuth.SecurityAttribute} permissions The security attributes for this participant.
 */
ozpIwc.Participant=function() {


    /**
     * An events module for the participant.
     * @property events
     * @type Event
     */
    this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);

    /**
     * A key value store of the security attributes assigned to the participant.
     * @property permissions
     * @type Object
     * @default {}
     */
	this.permissions= new ozpIwc.policyAuth.SecurityAttribute();

    /**
     * The message id assigned to the next packet if a packet msgId is not specified.
     * @property msgId
     * @type {Number}
     */
    this.msgId=0;

    /**
     * A Metrics meter for packets sent from the participant.
     * @property sentPacketsmeter
     * @type ozpIwc.metricTypes.Meter
     */
    this.sentPacketsMeter=new ozpIwc.metricTypes.Meter();

    /**
     * A Metrics meter for packets received by the participant.
     * @property receivedPacketMeter
     * @type ozpIwc.metricTypes.Meter
     */
    this.receivedPacketsMeter=new ozpIwc.metricTypes.Meter();

    /**
     * A Metrics meter for packets sent to the participant that did not pass authorization.
     * @property forbiddenPacketMeter
     * @type ozpIwc.metricTypes.Meter
     */
    this.forbiddenPacketsMeter=new ozpIwc.metricTypes.Meter();
    this.latencyInTimer=new ozpIwc.metricTypes.Meter();
    this.latencyOutTimer=new ozpIwc.metricTypes.Meter();

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     */
    this.participantType=this.constructor.name;

    /**
     * Content type for the Participant's heartbeat status packets.
     * @property heartBeatContentType
     * @type String
     * @default "application/vnd.ozp-iwc-address-v1+json"
     */
    this.heartBeatContentType="application/vnd.ozp-iwc-address-v1+json";

    /**
     * The heartbeat status packet of the participant.
     * @property heartBeatStatus
     * @type Object
     */
    this.heartBeatStatus={
        name: this.name,
        type: this.participantType || this.constructor.name
    };

    this.replyCallbacks = {};

    // Handle leaving Event Channel
    var self=this;
    ozpIwc.util.addEventListener("beforeunload",function() {
        // Unload events can't use setTimeout's. Therefore make all sending happen with normal execution
        self.send = function(originalPacket,callback) {
            var packet=this.fixPacket(originalPacket);
            if(callback) {
                self.replyCallbacks[packet.msgId]=callback;
            }
            ozpIwc.Participant.prototype.send.call(self,packet);

            return packet;
        };
        self.leaveEventChannel();
    });
};

/**
 * Processes packets sent from the router to the participant. If a packet does not pass authorization it is marked
 * forbidden.
 *
 * @method receiveFromRouter
 * @param {ozpIwc.PacketContext} packetContext
 * @returns {Boolean} true if this packet could have additional recipients
 */
ozpIwc.Participant.prototype.receiveFromRouter=function(packetContext) {
    var self = this;

    var request = {
        'subject': this.permissions.getAll(),
        'resource': {'ozp:iwc:receiveAs': packetContext.packet.dst},
        'action': {'ozp:iwc:action': 'receiveAs'},
        'policies': ozpIwc.authorization.policySets.receiveAsSet
    };

    var onError = function(err){
        self.forbiddenPacketsMeter.mark();
        /** @todo do we send a "denied" message to the destination?  drop?  who knows? */
        ozpIwc.metrics.counter("transport.packets.forbidden").inc();
        console.error("failure",err);
    };

    ozpIwc.authorization.isPermitted(request,this)
        .success(function() {
            ozpIwc.authorization.formatCategory(packetContext.packet.permissions)
                .success(function(permissions) {
                    var request = {
                        'subject': self.permissions.getAll(),
                        'resource':permissions || {},
                        'action': {'ozp:iwc:action': 'read'},
                        'policies': ozpIwc.authorization.policySets.readSet
                    };

                    ozpIwc.authorization.isPermitted(request, self)
                        .success(function (resolution) {
                            self.receivedPacketsMeter.mark();
                            if(packetContext.packet.time) {
                                self.latencyInTimer.mark(ozpIwc.util.now() - packetContext.packet.time);
                            }

                            self.receiveFromRouterImpl(packetContext);
                        }).failure(onError);
                }).failure(onError);
        }).failure(onError);
};

/**
 * Overridden by inherited Participants.
 *
 * @override
 * @method receiveFromRouterImple
 * @param packetContext
 * @returns {Boolean}
 */
ozpIwc.Participant.prototype.receiveFromRouterImpl = function (packetContext) {
    // doesn't really do anything other than return a bool and prevent "unused param" warnings
    return !packetContext;
};

/**
 * Connects the participant to a given router.
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Participant/#connectedToRouter:event"}}{{/crossLink}}
 *
 * @method connectToRouter
 * @param {ozpIwc.Router} router The router to connect to
 * @param {String} address The address to assign to the participant.
 */
ozpIwc.Participant.prototype.connectToRouter=function(router,address) {
    this.address=address;
    this.router=router;
    this.msgId=0;
    if(this.name) {
        this.metricRoot="participants."+ this.name +"." + this.address.split(".").reverse().join(".");
    } else {
        this.metricRoot="participants."+ this.address.split(".").reverse().join(".");
    }
    this.sentPacketsMeter=ozpIwc.metrics.meter(this.metricRoot,"sentPackets").unit("packets");
    this.receivedPacketsMeter=ozpIwc.metrics.meter(this.metricRoot,"receivedPackets").unit("packets");
    this.forbiddenPacketsMeter=ozpIwc.metrics.meter(this.metricRoot,"forbiddenPackets").unit("packets");
    this.latencyInTimer=ozpIwc.metrics.timer(this.metricRoot,"latencyIn").unit("packets");
    this.latencyOutTimer=ozpIwc.metrics.timer(this.metricRoot,"latencyOut").unit("packets");
    
    this.namesResource="/address/"+this.address;
    this.heartBeatStatus.address=this.address;
    this.heartBeatStatus.name=this.name;
    this.heartBeatStatus.type=this.participantType || this.constructor.name;

    this.events.trigger("connectedToRouter");
    this.joinEventChannel();
};

/**
 * Populates fields relevant to this packet if they aren't already set:
 * src, ver, msgId, and time.
 *
 * @method fixPacket
 * @param {ozpIwc.TransportPacket} packet
 *
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.fixPacket=function(packet) {
    // clean up the packet a bit on behalf of the sender
    packet.src=packet.src || this.address;
    packet.ver = packet.ver || 1;

    // if the packet doesn't have a msgId, generate one
    packet.msgId = packet.msgId || this.generateMsgId();

    // might as well be helpful and set the time, too
    packet.time = packet.time || ozpIwc.util.now();
    return packet;
};

/**
 * Sends a packet to this participants router.  Calls fixPacket
 * before doing so.
 *
 * @method send
 * @param {ozpIwc.TransportPacket} packet
 *
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.send=function(packet) {
    var self = this;
    var request = {
        'subject': this.permissions.getAll(),
        'resource': {'ozp:iwc:sendAs': packet.src},
        'action': {'ozp:iwc:action': 'sendAs'},
        'policies': ozpIwc.authorization.policySets.sendAsSet
    };
    packet = self.fixPacket(packet);
    ozpIwc.authorization.isPermitted(request,self)
        .success(function(resolution) {
            self.sentPacketsMeter.mark();
            if(packet.time) {
                self.latencyOutTimer.mark(ozpIwc.util.now() - packet.time);
            }
            self.router.send(packet, self);
        }).failure(function(e){
            console.error("Participant " + self.address + " failed to send a packet:",e,packet);
        });
    return packet;
};

/**
 * Creates a message id for a packet by iterating {{#crossLink "ozpIwc.Participant.msgId"}}{{/crossLink}}
 *
 * @method generateMsgId
 * @returns {string}
 */
ozpIwc.Participant.prototype.generateMsgId=function() {
    return "i:" + this.msgId++;
};

/**
 * Sends a heartbeat packet to Participant's router.
 *
 * @method heartbeat
 */
ozpIwc.Participant.prototype.heartbeat=function() {
    if(this.router) {
        var entity = this.heartBeatStatus;
        entity.time = ozpIwc.util.now();

        return this.fixPacket({
            'dst': "names.api",
            'resource': this.namesResource,
            'action' : "set",
            'entity' : entity,
            'contentType' : this.heartBeatContentType,
            'respondOn': "none"
        });
    }
};

/**
 * Adds this participant to the $bus.multicast multicast group.
 *
 * @method joinEventChannel
 * @returns {boolean}
 */
ozpIwc.Participant.prototype.joinEventChannel = function() {
    if(this.router) {
        this.router.registerMulticast(this, ["$bus.multicast"]);
        this.send({
            dst: "$bus.multicast",
            action: "connect",
            entity: {
                address: this.address,
                participantType: this.participantType
            }
        });
        return true;
    } else {
        return false;
    }
};

/**
 * Remove this participant from the $bus.multicast multicast group.
 *
 * @method leaveEventChannel
 */
ozpIwc.Participant.prototype.leaveEventChannel = function() {
    if(this.router) {
        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.address,
                participantType: this.participantType,
                namesResource: this.namesResource
            }
        });
        //TODO not implemented
//        this.router.unregisterMulticast(this, ["$bus.multicast"]);
        return true;
    } else {
        return false;
    }

};
/**
 * @submodule bus.transport
 */

/**
 * @class InternalParticipant
 * @namespace ozpIwc
 * @constructor
 * @extends ozpIwc.Participant
 * @param {Object} config
 * @param {String} config.name The name of the participant.
 */
ozpIwc.InternalParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
    config=config || {};
	ozpIwc.Participant.apply(this,arguments);
    /**
     * @property replyCallbacks
     * @type {Object}
     */
	this.replyCallbacks={};

    /**
     * The type of the participant.
     * @property participantType
     * @type {String}
     * @default "internal"
     */
	this.participantType="internal";

    /**
     * The name of the participant.
     * @property name
     * @type {String}
     * @default ""
     */
	this.name=config.name;

    var self = this;
    this.on("connectedToRouter",function() {
        self.permissions.pushIfNotExist('ozp:iwc:address', self.address);
        self.permissions.pushIfNotExist('ozp:iwc:sendAs',self.address);
        self.permissions.pushIfNotExist('ozp:iwc:receiveAs', self.address);

        ozpIwc.metrics.gauge(self.metricRoot,"registeredCallbacks").set(function() {
            return self.getCallbackCount();
        });
    });
});

/**
 * Gets the count of the registered reply callbacks.
 *
 * @method getCallbackCount
 * @returns {Number} The number of registered callbacks.
 */
ozpIwc.InternalParticipant.prototype.getCallbackCount=function() {
    if (!this.replyCallbacks || !Object.keys(this.replyCallbacks)) {
        return 0;
    }
    return Object.keys(this.replyCallbacks).length;
};

/**
 * Handles packets received from the {{#crossLink "ozpIwc.Router"}}{{/crossLink}} the participant is registered to.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Participant/#receive:event"}}{{/crossLink}}
 *
 * @method receiveFromRouterImpl
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.InternalParticipant.prototype.receiveFromRouterImpl=function(packetContext) {
	var packet=packetContext.packet;
	if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
        var cancel = false;
        var done=function() {
            cancel = true;
        };
        this.replyCallbacks[packet.replyTo](packet,done);
		if (cancel) {
            this.cancelCallback(packet.replyTo);
        }
	} else {
		this.events.trigger("receive",packetContext);
	}
};

/**
 * Sends a packet to this participants router. Uses setImmediate to force messages out in queue order.
 *
 * @method send
 * @param originalPacket
 * @param callback
 *
 * @returns {ozpIwc.TransportPacket|*}
 */
ozpIwc.InternalParticipant.prototype.send=function(originalPacket,callback) {
    var packet=this.fixPacket(originalPacket);
	if(callback) {
		this.replyCallbacks[packet.msgId]=callback;
	}
    var self=this;
    var send = ozpIwc.Participant.prototype.send;
	ozpIwc.util.setImmediate(function() {
        send.call(self,packet);
    });

	return packet;
};

/**
 * Cancels the callback corresponding to the given msgId.
 *
 * @method cancelCallback
 * @param {Number} msgId
 *
 * @returns {Boolean} returns true if successful.
 */
ozpIwc.InternalParticipant.prototype.cancelCallback=function(msgId) {
    var success=false;
    if (msgId) {
        delete this.replyCallbacks[msgId];
        success=true;
    }
    return success;
};

/**
 * @submodule bus.transport
 */

/**
 * @class ozpIwc.TransportPacket
 */

/**
 * The participant address that sent this packet.
 * @property src
 * @type String
 */

/**
 * The intended recipient of this packet.
 * @property dst
 * @type String
 */

/**
 * Protocol Version.  Should be 1.
 * @property ver
 * @type Number
 */

/**
 * A unique id for this packet.
 * @property msgId
 * @type Number
 */

/**
 * The payload of this packet.
 * @property entity
 * @type Object
 */

/**
 * Permissions required to see the payload of this packet.
 * @property [permissions]
 * @type Object
 */

/**
 * The time in milliseconds since epoch that this packet was created.
 * @property [time]
 * @type Number
 */

/**
 * Reference to the msgId that this is in reply to.
 * @property [replyTo]
 * @type Number
 */

/**
 * Action to be performed.
 * @property [action]
 * @type String
 */

/**
 * Resource to perform the action upon.
 * @property [resource]
 * @type String
 */

/**
 * Marker for test packets.
 * @property [test]
 * @type Boolean
*/

/**
 * @class TransportPacketContext
 * @namespace ozpIwc
 * @param {Object} config
 * @param {ozpIwc.TransportPacket} config.packet
 * @param {ozpIwc.Router} config.router
 * @param {ozpIwc.Participant} [config.srcParticpant]
 * @param {ozpIwc.Participant} [config.dstParticpant]
 */
ozpIwc.TransportPacketContext=function(config) {
    /**
     * @property packet
     * @type ozpIwc.TransportPacket
     */

    /**
     * @property router
     * @type ozpIwc.Router
     */

    /**
     * @property [srcParticipant]
     * @type ozpIwc.Participant
     */

    /**
     * @property [dstParticipant]
     * @type ozpIwc.Participant
     */
    for(var i in config) {
        this[i]=config[i];
    }
};

/**
 * Formats a response packet,
 *
 * @method makeReplyTo
 * @param {Object} response
 * @param {Number} [response.ver]
 * @param {Number} [response.time]
 * @param {String} [response.replyTo]
 * @param {String} [response.src]
 * @param {String} [response.dst]
 * @returns {Object}
 */
ozpIwc.TransportPacketContext.prototype.makeReplyTo=function(response){
    var now=new Date().getTime();
    response.ver = response.ver || 1;
    response.time = response.time || now;
    response.replyTo=response.replyTo || this.packet.msgId;
    response.src=response.src || this.packet.dst;
    response.dst=response.dst || this.packet.src;
    return response;
};

/**
 * Sends the given response to the sender of this context if the packet respondOn criteria is met.
 *
 * @method replyTo
 * @param {ozpIwc.TransportPacket} response
 * @returns {ozpIwc.TransportPacket} the packet that was sent
 */
ozpIwc.TransportPacketContext.prototype.replyTo=function(response) {

    if(this.shouldReply(response)) {
        response=this.makeReplyTo(response);

        if (this.dstParticipant) {
            this.dstParticipant.send(response);
        } else {
            response.msgId = response.msgId || ozpIwc.util.now();
            this.router.send(response);
        }
        return response;
    }
};

/**
 * Returns true if this packet be replied to based on its respondOn.
 *
 * @method shouldReply
 * @param {Object} response
 * @returns {Boolean}
 */
ozpIwc.TransportPacketContext.prototype.shouldReply=function(response){
    this.packet = this.packet || {};
    this.packet.respondOn = this.packet.respondOn || "all";

    switch(this.packet.respondOn){
        case "none":
            return false;
        case "error":
            return /(bad|no).*/.test(response.response);
        default: // "all"
            return true;
    }
};

/**
 * @class Router
 * @namespace ozpIwc
 * @constructor
 * @param {Object} [config]
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer]
 */
/**
 * @event ozpIwc.Router#preRegisterParticipant
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} [packet] - The packet to be delivered
 * @param {object} registration - Information provided by the participant about it's registration
 * @param {ozpIwc.Participant} participant - The participant that will receive the packet
 */

/**
 * @event ozpIwc.Router#preSend
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} packet - The packet to be sent
 * @param {ozpIwc.Participant} participant - The participant that sent the packet
 */

/**
 * @event ozpIwc.Router#preDeliver
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} packet - The packet to be delivered
 * @param {ozpIwc.Participant} participant - The participant that will receive the packet
 */

/**
 * @event ozpIwc.Router#send
 * @param {ozpIwc.TransportPacket} packet - The packet to be delivered
 */

/**
 * @event ozpIwc.Router#prePeerReceive
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} packet
 * @param {ozpIwc.NetworkPacket} rawPacket
 */

ozpIwc.Router=function(config) {
    config=config || {};

    /**
     * @property peer
     * @type ozpIwc.Peer
     */
    this.peer=config.peer || ozpIwc.defaultPeer;

//	this.nobodyAddress="$nobody";
//	this.routerControlAddress='$transport';
	var self=this;

    /**
     * @property selfId
     * @type String
     */
	this.selfId=ozpIwc.util.generateId();
	
    /**
     * A key value store of all participants local to the router.
     * @property participants
     * @type Object
     * @default {}
     */
	this.participants={};
	
	ozpIwc.metrics.gauge("transport.participants").set(function() {
		return Object.keys(self.participants).length;
	});


    /**
     * Eventing module for the router.
     * @property events
     * @type ozpIwc.Event
     * @default ozpIwc.Event
     */
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
	
	// Wire up to the peer
	this.peer.on("receive",function(event) {
		self.receiveFromPeer(event.packet);
	});
	
	var checkFormat=function(event) {
		var message=event.packet;
		if(message.ver !== 1) {
			event.cancel("badVersion");
		}
		if(!message.src) {
			event.cancel("nullSource");
		}
		if(!message.dst) {
			event.cancel("nullDestination");
		}
		if(event.canceled) {
			ozpIwc.metrics.counter("transport.packets.invalidFormat").inc();
		}
	};
	this.events.on("preSend",checkFormat);

    if(!config.disableBus){
        this.participants["$bus.multicast"]=new ozpIwc.MulticastParticipant("$bus.multicast");
    }
    /**
     * @property watchdog
     * @type ozpIwc.RouterWatchdog
     */
	this.watchdog=new ozpIwc.RouterWatchdog({
        router: this,
        heartbeatFrequency: config.heartbeatFrequency,
        autoConnect: false
    });
	this.registerParticipant(this.watchdog);
    this.recursionDepth=0;
    ozpIwc.metrics.gauge('transport.router.participants').set(function() {
        return self.getParticipantCount();
    });
};

/**
 * Gets the count of participants who have registered with the router.
 * @method getParticipantCount
 *
 * @returns {Number} the number of registered participants
 */
ozpIwc.Router.prototype.getParticipantCount=function() {
    if (!this.participants || !Object.keys(this.participants)) {
        return 0;
    }
    return Object.keys(this.participants).length;

};

/**
 * @method shutdown
 */
ozpIwc.Router.prototype.shutdown=function() {
    this.watchdog.shutdown();
};

/**
 * Allows a listener to add a new participant.
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Router/#registerParticipant:event"}}{{/crossLink}}
 *
 * @method registerParticipant
 * @param {Object} participant the participant object that contains a send() function.
 * @param {Object} packet The handshake requesting registration.
 *
 * @returns {String} returns participant id
 */
ozpIwc.Router.prototype.registerParticipant=function(participant,packet) {
    packet = packet || {};
    var address;
    do {
        address=ozpIwc.util.generateId()+"."+this.selfId;
    } while(this.participants.hasOwnProperty(address));

    var registerEvent=new ozpIwc.CancelableEvent({
        'packet': packet,
        'registration': packet.entity,
        'participant': participant
    });
    this.events.trigger("preRegisterParticipant",registerEvent);

    if(registerEvent.canceled){
        // someone vetoed this participant
        ozpIwc.log.info("registeredParticipant[DENIED] origin:"+participant.origin+
            " because " + registerEvent.cancelReason);
        return null;
    }

    this.participants[address] = participant;
    participant.connectToRouter(this,address);
    this.send(participant.heartbeat(),participant);
    var registeredEvent=new ozpIwc.CancelableEvent({
        'packet': packet,
        'participant': participant
    });
    this.events.trigger("registeredParticipant",registeredEvent);

//	ozpIwc.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
    return address;
};

/**
 * Fires:
 *     - {{#crossLink "ozpIwc.Router/#preDeliver:event"}}{{/crossLink}}
 *
 * @method deliverLocal
 * @param {ozpIwc.TransportPacket} packet
 * @param {ozpIwc.Participant} sendingParticipant
 */
ozpIwc.Router.prototype.deliverLocal=function(packet,sendingParticipant) {
    if(!packet) {
        throw "Cannot deliver a null packet!";
    }
    var localParticipant=this.participants[packet.dst];
    if(!localParticipant) {
        return;
    }
    this.recursionDepth++;
    if(this.recursionDepth > 10) {
        console.log("Recursing more than 10 levels deep on ",packet);
    }
    try {
        var packetContext=new ozpIwc.TransportPacketContext({
            'packet':packet,
            'router': this,
            'srcParticipant': sendingParticipant,
            'dstParticipant': localParticipant
        });
        
        var preDeliverEvent=new ozpIwc.CancelableEvent({
            'packet': packet,
            'dstParticipant': localParticipant,
            'srcParticipant': sendingParticipant
        });

        if(this.events.trigger("preDeliver",preDeliverEvent).canceled) {
            ozpIwc.metrics.counter("transport.packets.rejected").inc();
            return;
        }
        ozpIwc.metrics.counter("transport.packets.delivered").inc();
        localParticipant.receiveFromRouter(packetContext);
    } finally {
        this.recursionDepth--;
    }
};


/**
 * Registers a participant for a multicast group
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Router/#registerMulticast:event"}}{{/crossLink}}
 *
 * @method registerMulticast
 * @param {ozpIwc.Participant} participant
 * @param {String[]} multicastGroups
 */
ozpIwc.Router.prototype.registerMulticast=function(participant,multicastGroups) {
    var self=this;
    multicastGroups.forEach(function(groupName) {
        var g=self.participants[groupName];
        if(!g) {
            g=self.participants[groupName]=new ozpIwc.MulticastParticipant(groupName);
        }
        g.addMember(participant);
        if (participant.address) {
            var registeredEvent = new ozpIwc.CancelableEvent({
                'entity': {'group': groupName, 'address': participant.address}
            });
            participant.permissions.pushIfNotExist('ozp:iwc:sendAs', groupName);
            participant.permissions.pushIfNotExist('ozp:iwc:receiveAs', groupName);

            self.events.trigger("registeredMulticast", registeredEvent);
        } else {
            ozpIwc.log.info("no address for " + participant.participantType + " " + participant.name + "with address " +
                participant.address + " for group " + groupName);
        }
        //ozpIwc.log.log("registered " + participant.participantType + " " + participant.name + "with address " + participant.address + " for group " + groupName);
    });
    return multicastGroups;
};

/**
 * Used by participant listeners to route a message to other participants.
 *
 * Fires:
 *     -{{#crossLink "ozpIwc.Router/#preSend:event"}}{{/crossLink}}
 *     -{{#crossLink "ozpIwc.Router/#send:event"}}{{/crossLink}}
 *
 * @method send
 * @param {ozpIwc.TransportPacket} packet The packet to route.
 * @param {ozpIwc.Participant} sendingParticipant Information about the participant that is attempting to send
 * the packet.
 */
ozpIwc.Router.prototype.send=function(packet,sendingParticipant) {

    var preSendEvent=new ozpIwc.CancelableEvent({
        'packet': packet,
        'participant': sendingParticipant
    });
    this.events.trigger("preSend",preSendEvent);

    if(preSendEvent.canceled) {
        ozpIwc.metrics.counter("transport.packets.sendCanceled");
        return;
    }
    ozpIwc.metrics.counter("transport.packets.sent").inc();
    this.deliverLocal(packet,sendingParticipant);
    this.events.trigger("send",{'packet': packet});
    this.peer.send(packet);
};

/**
 * Receive a packet from the peer.
 *
 * Fires:
 *     -{{#crossLink "ozpIwc.Router/#prePeerReceive:event"}}{{/crossLink}}
 *
 * @param packet {ozpIwc.TransportPacket} the packet to receive
 */
ozpIwc.Router.prototype.receiveFromPeer=function(packet) {
    ozpIwc.metrics.counter("transport.packets.receivedFromPeer").inc();
    var now = Date.now();
    ozpIwc.metrics.histogram("transport.packets.latency").mark(now-packet.data.time,now);
    var peerReceiveEvent=new ozpIwc.CancelableEvent({
        'packet' : packet.data,
        'rawPacket' : packet
    });
    this.events.trigger("prePeerReceive",peerReceiveEvent);

    if(!peerReceiveEvent.canceled){
        this.deliverLocal(packet.data);
    }
};


/**
 * Classes related to transport aspects of the IWC.
 * @module bus
 * @submodule bus.transport
 */

/**
 * A participant for the client's communication needs.
 * @class ClientParticipant
 * @namespace ozpIwc
 *
 * @constructor
 * @extends ozpIwc.Participant
 * @uses ozpIwc.ClientMixin
 * @param {Object} config
 * @param {String} config.name The name of the participant.
 */
ozpIwc.ClientParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
    config=config || {};
    ozpIwc.Participant.apply(this,arguments);
    /**
     * The type of the participant.
     * @property participantType
     * @type {String}
     * @default "internal"
     */
    this.participantType="internalClient";

    /**
     * Notes if this is a client participant internal to the bus.
     * @property internal
     * @type {Boolean}
     * @default false
     */
    this.internal = config.internal || false;
    /**
     * The name of the participant.
     * @property name
     * @type {String}
     * @default ""
     */
    this.name=config.name;

    /**
     * The router to connect to.
     * @property router
     * @type {*|ozpIwc.defaultRouter}
     */
    this.router=config.router || ozpIwc.defaultRouter;
    var self = this;
    this.on("connectedToRouter",function() {
        self.permissions.pushIfNotExist('ozp:iwc:address', self.address);
        self.permissions.pushIfNotExist('ozp:iwc:sendAs',self.address);
        self.permissions.pushIfNotExist('ozp:iwc:receiveAs', self.address);

        ozpIwc.metrics.gauge(self.metricRoot,"registeredCallbacks").set(function() {
            if (!self.replyCallbacks || !Object.keys(self.replyCallbacks)) {
                return 0;
            }
            return Object.keys(self.replyCallbacks).length;
        });
    });

    ozpIwc.ApiPromiseMixin(this,config.autoConnect);
});


/**
 * Connects the client from the IWC bus.
 * Fires:
 *     - {{#crossLink "ozpIwc.Client/#connected"}}{{/crossLink}}
 *
 * @method connect
 */
ozpIwc.ClientParticipant.prototype.connect = function(){

    if(!this.connectPromise) {
        var self = this;
        /**
         * Promise to chain off of for client connection asynchronous actions.
         * @property connectPromise
         *
         * @type Promise
         */
        this.connectPromise = new Promise(function(resolve,reject){
            resolve(self.router.registerParticipant(self));
        }).then(function(addr){
            return self.afterConnected(addr);
        });
    }

    return this.connectPromise;
};
/**
 * Send functionality for the clientParticipant type Participant.
 *
 * @method sendImpl
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.ClientParticipant.prototype.sendImpl=ozpIwc.Participant.prototype.send;
/**
 * @submodule bus.consensus
 */

ozpIwc.consensus = ozpIwc.consensus || {};

/**
 * A base-class for consensus modules.
 * 
 * @class BaseConsensus
 * @namespace ozpIwc.consensus
 * @param {Object}config
 * @constructor
 */
ozpIwc.consensus.BaseConsensus = function(config){
    config = config || {};
    var self = this;
    if(!config.name) { throw "Consensus module expects a name.";}
    /**
     * name of the consensus module
     * @property name
     * @type {String}
     */
    this.name = config.name;

    /**
     * The communication module of this consensus module.
     * @property participant
     * @tyope {Object}
     */
    this.participant = config.participant ||  new ozpIwc.ClientParticipant(config);

    /**
     * The messaging address common among all matching modules.
     * @property consensusAddress
     * @type {String}
     */
    this.consensusAddress = config.consensusAddress || this.name + ".consensus";

    /**
     * The router for which this modules participant communicates over
     * @property router
     */
    this.router = config.router || ozpIwc.defaultRouter;

    /**
     * An eventing module.
     * @property events
     * @type {ozpIwc.Event}
     */
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);

    /**
     * The state of the module. (coordinator/member)
     * @property state
     * @type {string}
     */
    this.state = "unknown";
    this.participant.on("connectedToRouter",function() {
        self.participant.permissions.pushIfNotExist('ozp:iwc:address', [self.participant.address,self.consensusAddress]);
        self.participant.permissions.pushIfNotExist('ozp:iwc:sendAs',[self.participant.address,self.consensusAddress]);
        self.participant.permissions.pushIfNotExist('ozp:iwc:receiveAs',[self.participant.address,self.consensusAddress]);
    });

    this.routePacket = config.routePacket || this.routePacket;

    this.router.registerMulticast(this.participant,[this.consensusAddress]);
    this.participant.on("receive",this.routePacket,this);
};

/**
 * Packet routing functionality of the consensus module. Expected to be overridden by subclass.
 * 
 * @method routePacket
 * @param {Object} packetContext
 */
ozpIwc.consensus.BaseConsensus.prototype.routePacket= function(packetContext){
   throw "routePacket is to be overridden by consensus implementation";
};


/**
 * Module becoming coordinator handler for the consensus module. Expected to be overridden by subclass.
 *
 * @method onBecomeCoordinator
 */
ozpIwc.consensus.BaseConsensus.prototype.onBecomeCoordinator = function(){
    throw "onBecomeCoordinator is to be overridden by consensus implementation";
};


/**
 * Module becoming member handler for the consensus module. Expected to be overridden by subclass.
 *
 * @method onBecomeMember
 */
ozpIwc.consensus.BaseConsensus.prototype.onBecomeMember = function(){
    throw "onBecomeMember is to be overridden by consensus implementation";
};

/**
 * Changes state of the consensus module. Triggers "changedState" event.
 *
 * @method changeState
 */
ozpIwc.consensus.BaseConsensus.prototype.changeState = function(state){
    if (this.state !== state){
        this.state = state;
        this.events.trigger("changedState",this.state);
    }
};
/**
 * @submodule bus.consensus
 */
ozpIwc.consensus = ozpIwc.consensus || {};

/**
 * An implementation of the Bully Algorithm as a consensus module for the IWC.
 * Acknowledge(OK) message is not used in current implementation, rather a victory message is sent out on an interval
 * to notify other consensus modules whom the coordinator is.
 *
 * The consensusId is a negative reference to the time at which the bully was created. This means the oldest bully
 * module leads.
 *
 * @class Bully
 * @namespace ozpIwc.consensus
 * @extends BaseConsensus
 * @type {Function}
 */
ozpIwc.consensus.Bully = ozpIwc.util.extend(ozpIwc.consensus.BaseConsensus,function(config) {
    ozpIwc.consensus.BaseConsensus.apply(this, arguments);
    /**
     * Election rank of this module. Seniority rules.
     * @property consensusId
     * @type {Number}
     */
    this.consensusId = config.consensusId || -ozpIwc.util.now();

    /**
     * How long this module waits before assuming the coordinator is down.
     * @property coordinatorTimeoutHeartbeat
     * @type {Number}
     */
    this.coordinatorTimeoutHeartbeat = config.heartbeat || ozpIwc.ELECTION_TIMEOUT;

    /**
     * How often this module broadcasts being the coordinator (if coordinator).
     * @property coordinatorTimeoutHeartbeat
     * @type {Number}
     */
    this.coordinatorIntervalHeartbeat = this.coordinatorTimeoutHeartbeat / 2;

    /**
     * Data passing functionality for those who use this module. Data passed into gatherLogs will be shared with other
     * matching modules if this module is the coordinator.
     *
     * @method gatherLogs
     * @type {Function}
     */
    this.gatherLogs = config.gatherLogs || function(){};

    //Give some arbitrary time for the query to respond before kicking off an election
    this.restartCoordinatorTimeout(1000);
    this.sendQueryMessage();
});

/**
 * Routes packets for the bully module. Packets with the following actions are accepted:
 *  - election
 *  - acknowledge
 *  - query
 *  - victory
 *
 * @method routePacket
 * @override
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.consensus.Bully.prototype.routePacket = function(packetContext){
    var packet = packetContext.packet || {};

    //Accept packets sent out to this consensus module
    if(packet.dst === this.consensusAddress){
        //But ignore own packets
        if(packet.src !== this.participant.address){
            switch(packet.action){
                case "election":
                    this.onElectionMessage(packet);
                    break;
                case "acknowledge":
                    this.onAckMessage(packet);
                    break;
                case "victory":
                    this.onVictoryMessage(packet);
                    break;
                case "query":
                    this.onQueryMessage(packet);
                    break;
                default:
                    break;
            }
        }
    }

};


//==================================================================
// Consensus message sending
//==================================================================
/**
 * Sends an election message to other Bully Modules to determine a coordinator.
 *
 * @method sendElectionMessage
 */
ozpIwc.consensus.Bully.prototype.sendElectionMessage = function(){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "election",
        'entity': {
            'consensusId': this.consensusId
        }
    });
};

/**
 * @TODO: Unused, a modified bully algorithm was implemented.
 * Sends an acknowledge message to the consensusId that sent an election message to inform them that this module out
 * ranks them.
 *
 * @method sendAckMessage
 * @param {String}consensusSender
 */
ozpIwc.consensus.Bully.prototype.sendAckMessage = function(consensusSender){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "acknowledge",
        'entity': {
            'consensusId': this.consensusId,
            'replyTo':{
                'consensusId': consensusSender
            }
        }
    });
};

/**
 * Sends a victory message to other bully modules informing them of this modules role as Coordinator.
 *
 * @method sendVictoryMessage
 */
ozpIwc.consensus.Bully.prototype.sendVictoryMessage = function(){
    var logs = this.gatherLogs();
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "victory",
        'entity': {
            'consensusId': this.consensusId,
            'logs': logs
        }
    });
};

/**
 * Sends a query message to other bully modules. The Coordinator will hear this message and respond immediately with
 * a victory message to inform Coordinator status.
 *
 * @method sendQueryMessage
 */
ozpIwc.consensus.Bully.prototype.sendQueryMessage = function(){
    this.participant.send({
        'dst': this.consensusAddress,
        'action': "query",
        'entity': {
            'consensusId': this.consensusId
        }
    });
};


//==================================================================
// Consensus message handling
//==================================================================
/**
 * Handler function for receiving election messages. If the message sender is of lower rank than this module, this
 * module joins the election.
 *
 * @method onElectionMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onElectionMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId ){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // Ignore it if they out rank us.
    if(consensusId > this.consensusId){
        this.cancelElection();
        window.clearTimeout(this.coordinatorTimeout);
        window.clearInterval(this.coordinatorInterval);
        return;
    }

    // Let them know that we out rank them.
    //this.sendAckMessage(consensusId);
    this.cancelElection();
    this.startElection();
};

/**
 * Handler function for receiving acknowledge messages. If the acknowledge message is directed at this bully module, it
 * will cancel its election as a higher ranking module exists.
 *
 * @method onAckMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onAckMessage = function(packet){
    var entity = packet.entity;
    var replyTo = entity.replyTo || {};
    if (!replyTo.consensusId){ throw "Non-formatted acknowledge message received.";}
    var consensusId = replyTo.consensusId;

    // Ignore if it wasn't sent directly to me.
    if(consensusId !== this.consensusId){
        return;
    }

    //what do we do on ack?
    //cancel election timeout
    this.cancelElection();
};

/**
 * Handler function for receiving victory messages. If the sender out ranks this module, the module will act as a
 * member of the module group and start a watchdog to start a new election if the coordinator goes silent.
 *
 * @method onAckMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onVictoryMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId){ throw "Non-formatted election message received.";}
    var consensusId = entity.consensusId;

    // Ignore it if they out rank us.
    if(consensusId > this.consensusId){
        this.cancelElection();
        if(entity.logs){
            this.events.trigger("receivedLogs",entity.logs);
        }
        this.restartCoordinatorTimeout();
        return;
    }

    //Rebel if needed.
    this.startElection();

};


/**
 * Handler function for receiving query messages. If this module is the coordinator it will respond with a victory
 * message to inform sender that this module is the coordinator.
 *
 * @method onAckMessage
 * @param {Object} packet
 */
ozpIwc.consensus.Bully.prototype.onQueryMessage = function(packet){
    var entity = packet.entity;
    if (!entity.consensusId){ throw "Non-formatted election message received.";}

    // If this Bully is pumping out victory messages its the leader, otherwise don't respond
    if(this.coordinatorInterval){
        this.sendVictoryMessage();
        return;
    }
};


//==================================================================
// Consensus Coordinator timeout
//==================================================================
/**
 * Restarts the watchdog for which the coordinator must respond before ending otherwise this module will start an
 * election.
 *
 * @method restartCoordinatorTimeout
 * @param {Number}[timeout]
 */
ozpIwc.consensus.Bully.prototype.restartCoordinatorTimeout = function(timeout){
    timeout = timeout || this.coordinatorTimeoutHeartbeat;
    var self = this;
    window.clearTimeout(this.coordinatorTimeout);
    this.changeState("member");

    this.coordinatorTimeout = window.setTimeout(function(){
        self.onCoordinatorTimeout(timeout);
    },timeout);
};

/**
 * Handler function for when no response was made by the coordinator and its watchdog times out.
 *
 * @method onCoordinatorTimeout
 * @param timeout
 */
ozpIwc.consensus.Bully.prototype.onCoordinatorTimeout = function(timeout){
    this.startElection(timeout);
};



//==================================================================
// Coordinator functionality
//==================================================================
/**
 * Handler function for when this module becomes coordinator of all active matching bully modules.
 *
 * @override
 * @method onBecomeCoordinator
 */
ozpIwc.consensus.Bully.prototype.onBecomeCoordinator = function() {
    var self = this;
    window.clearInterval(this.coordinatorInterval);

    this.sendVictoryMessage(self.lastElection);
    this.changeState("coordinator");
    this.coordinatorInterval = window.setInterval(function(){
        self.sendVictoryMessage(self.lastElection);
    },this.coordinatorIntervalHeartbeat);
};

//==================================================================
// Election control
//==================================================================
/**
 * Makes this bully module start an election for the coordinator role.
 *
 * @method startElection
 * @param {Number} [timeout]
 */
ozpIwc.consensus.Bully.prototype.startElection = function(timeout){
    timeout = timeout || this.coordinatorTimeoutHeartbeat;
    var self = this;
    window.clearTimeout(this.electionTimeout);

    this.electionTimeout = window.setTimeout(function(){
            self.onBecomeCoordinator();
    },timeout);

    self.sendElectionMessage();
};

/**
 * Cancels this modules participation in the current election.
 *
 * @method cancelElection
 */
ozpIwc.consensus.Bully.prototype.cancelElection = function(){
    window.clearTimeout(this.electionTimeout);
};




/**
 * @submodule bus.transport
 */

/**
 * A participant to handle multicast communication on the IWC.
 *
 * @class MulticastParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.Participant
 * @constructor
 *
 * @param {String} name The name of the participant.
 */
ozpIwc.MulticastParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(name) {

    /**
     * The address of the participant.
     * @property address
     * @type String
     */
	this.address = name;

    /**
     * The name of the participant.
     * @property name
     * @type String
     */
    this.name=name;

    /**
     * The type of the participant
     * @property participantType
     * @type String
     * @default "multicast"
     */
	this.participantType="multicast";

    ozpIwc.Participant.apply(this,arguments);

    /**
     * Array of Participants that are part of the multicast group.
     * @property members
     * @type ozpIwc.Participant[]
     * @default []
     */
	this.members=[];

    /**
     * The participants resource path for the Names API.
     * @property namesResource
     * @type String
     * @default "/multicast/"
     */
    this.namesResource="/multicast/"+this.name;

    /**
     * Content type for the Participant's heartbeat status packets.
     * @property heartBeatContentType
     * @type String
     * @default "application/vnd.ozp-iwc-multicast-address-v1+json"
     */
    this.heartBeatContentType="application/vnd.ozp-iwc-multicast-address-v1+json";

    /**
     *
     * @property heartBeatStatus.members
     * @type Array
     * @default []
     */
    this.heartBeatStatus.members=[];

    /**
     * Fires when the participant has connected to its router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter",function() {
        this.namesResource="/multicast/" + this.name;
    },this);

    //At creation the multicast participant knows what it can sendAs/receiveAs
    this.permissions.pushIfNotExist('ozp:iwc:address', name);
    this.permissions.pushIfNotExist('ozp:iwc:sendAs', name);
    this.permissions.pushIfNotExist('ozp:iwc:receiveAs', name);
});

/**
 * Receives a packet on behalf of the multicast group.
 *
 * @method receiveFromRouterImpl
 *
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean} always false.
 */
ozpIwc.MulticastParticipant.prototype.receiveFromRouterImpl=function(packet) {

    this.receivedPacketsMeter.mark();
	this.members.forEach(function(m) {
        // as we send to each member, update the context to make it believe that it's the only recipient
        packet.dstParticipant=m;
        m.receiveFromRouter(packet);
    });
	return false;
};

/**
 * Adds a member to the multicast group.
 *
 * @method addMember
 *
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
    this.heartBeatStatus.members.push(participant.address);
};
/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.transport
 */

/**
 * @class PostMessageParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.Participant
 *
 * @param {Object} config
 * @param {String} config.origin
 * @param {Object} config.sourceWindow
 * @param {Object} config.credentials
 */
ozpIwc.PostMessageParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
	ozpIwc.Participant.apply(this,arguments);

    /**
     * The origin of the Participant.
     * @property origin
     */
    /**
     * The name of the Participant.
     * @property name
     */
	this.origin=this.name=config.origin;

    /**
     * The window of the Participant.
     * @property sourceWindow
     * @type Window
     */
	this.sourceWindow=config.sourceWindow;

    /**
     * @property credentials
     * @type {Object}
     */
    this.credentials=config.credentials;

    /**
     * @property readyPromise
     * @type {Promise}
     */
    this.readyPromise = config.ready || Promise.resolve();
    /**
     * The type of the participant.
     * @property participantType
     * @type  String
     * @default "postMessageProxy"
     */
	this.participantType="postMessageProxy";

    /**
     * @property permissions.attributes['ozp:iwc:origin']
     * @type String
     */
    this.permissions.pushIfNotExist("ozp:iwc:origin",this.origin);

    this.on("connectedToRouter",function() {
        this.permissions.pushIfNotExist('ozp:iwc:address', this.address);
        this.permissions.pushIfNotExist('ozp:iwc:sendAs', this.address);
        this.permissions.pushIfNotExist('ozp:iwc:receiveAs', this.address);
    },this);
    /**
     * @property heartBeatStatus.origin
     * @type String
     */
    this.heartBeatStatus.origin=this.origin;
});

/**
 * Receives a packet on behalf of this participant and forwards it via PostMessage.
 *
 * @method receiveFromRouterImpl
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.PostMessageParticipant.prototype.receiveFromRouterImpl=function(packetContext) {
    this.sendToRecipient(packetContext.packet);
};

/**
 * Sends a message to the other end of our connection.  Wraps any string mangling
 * necessary by the postMessage implementation of the browser.
 *
 * @method sendToParticipant
 * @param {ozpIwc.TransportPacket} packet
 * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
 */
ozpIwc.PostMessageParticipant.prototype.sendToRecipient=function(packet) {
	ozpIwc.util.safePostMessage(this.sourceWindow,packet,this.origin);
};

/**
 * The participant hijacks anything addressed to "$transport" and serves it
 * directly.  This isolates basic connection checking from the router, itself.
 *
 * @method handleTransportpacket
 * @param {Object} packet
 */
ozpIwc.PostMessageParticipant.prototype.handleTransportPacket=function(packet) {
	var reply={
		'ver': 1,
		'dst': this.address,
		'src': '$transport',
		'replyTo': packet.msgId,
		'msgId': this.generateMsgId(),
		'entity': {
			"address": this.address
		}
	};
    var self = this;
    this.readyPromise.then(function(){
        self.sendToRecipient(reply);
    });
};


/**
 * Sends a packet received via PostMessage to the Participant's router.
 *
 * @method forwardFromPostMessage
 * @todo track the last used timestamp and make sure we don't send a duplicate messageId
 * @param {ozpIwc.TransportPacket} packet
 * @param {type} event
 */
ozpIwc.PostMessageParticipant.prototype.forwardFromPostMessage=function(packet,event) {
	if(typeof(packet) !== "object") {
		ozpIwc.log.error("Unknown packet received: " + JSON.stringify(packet));
		return;
	}
	if(event.origin !== this.origin) {
		/** @todo participant changing origins should set off more alarms, probably */
		ozpIwc.metrics.counter("transport."+this.address+".invalidSenderOrigin").inc();
		return;
	}

	packet=this.fixPacket(packet);

	// if it's addressed to $transport, hijack it
	if(packet.dst === "$transport") {
		this.handleTransportPacket(packet);
	} else {
		this.router.send(packet,this);
	}
};

/**
 * @TODO (DOC)
 * Listens for PostMessage messages and forwards them to the respected Participant.
 *
 * @class PostMessageParticipantListener
 * @param {Object} config
 * @param {ozpIwc.Router} config.router
 * @param {Promise} config.ready
 */
ozpIwc.PostMessageParticipantListener=function(config) {
	config = config || {};

    /**
     * @property Participants
     * @type ozpiwc.PostMessageParticipant[]
     */
	this.participants=[];

    /**
     * @property router
     * @type ozpIwc.Router
     */
	this.router=config.router || ozpIwc.defaultRouter;

    /**
     * @property readyPromise
     * @type {Promise}
     */
    this.readyPromise = config.ready || Promise.resolve();

	var self=this;

	ozpIwc.util.addEventListener("message", function(event) {
		self.receiveFromPostMessage(event);
	});

    ozpIwc.metrics.gauge('transport.postMessageListener.participants').set(function() {
        return self.getParticipantCount();
    });
};

/**
 * Gets the count of known participants
 *
 * @method getParticipantCount
 *
 * @returns {Number} the number of known participants
 */
ozpIwc.PostMessageParticipantListener.prototype.getParticipantCount=function() {
    if (!this.participants) {
        return 0;
    }
    return this.participants.length;
};

/**
 * Finds the participant associated with the given window.  Unfortunately, this is an
 * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
 * compare windows other than equality.
 *
 * @method findParticipant
 * @param {Object} sourceWindow - the participant window handle from message's event.source
 */
ozpIwc.PostMessageParticipantListener.prototype.findParticipant=function(sourceWindow) {
	for(var i=0; i< this.participants.length; ++i) {
		if(this.participants[i].sourceWindow === sourceWindow) {
			return this.participants[i];
		}
	}
};

/**
 * Process a post message that is received from a peer
 *
 * @method receiveFromPostMessage
 * @param {Object} event - The event received from the "message" event handler
 * @param {String} event.origin
 * @param {Object} event.source
 * @param {ozpIwc.TransportPacket} event.data
 */
ozpIwc.PostMessageParticipantListener.prototype.receiveFromPostMessage=function(event) {
	var participant=this.findParticipant(event.source);
    var packet=event.data;
    if(event.source === window) {
        // the IE profiler seems to make the window receive it's own postMessages
        // ... don't ask.  I don't know why
        return;
    }
	if(typeof(event.data)==="string") {
		try {
            packet=JSON.parse(event.data);
        } catch(e) {
            // assume that it's some other library using the bus and let it go
            return;
        }
	}

    var isPacket = function(packet){
        if (ozpIwc.util.isIWCPacket(packet)) {
            participant.forwardFromPostMessage(packet, event);
        } else {
            ozpIwc.log.debug("Packet does not meet IWC Packet criteria, dropping.", packet);
        }
    };

	// if this is a window who hasn't talked to us before, sign them up
	if(!participant) {

        var self = this;
        var request = {
            'subject': {'ozp:iwc:origin': event.origin},
            'action': {'ozp:iwc:action': 'connect'},
            'policies': ozpIwc.authorization.policySets.connectSet
        };
        ozpIwc.authorization.isPermitted(request)
            .success(function () {
                participant = new ozpIwc.PostMessageParticipant({
                    'origin': event.origin,
                    'sourceWindow': event.source,
                    'credentials': packet.entity,
                    'ready': self.readyPromise
                });
                self.router.registerParticipant(participant, packet);
                self.participants.push(participant);
                isPacket(packet);

            }).failure(function (err) {
                console.error("Failed to connect. Could not authorize:", err);
            });
	} else{
        isPacket(packet);
    }

};

/**
 * @submodule bus.transport
 */

/**
 * @class RouterWatchdog
 * @extends ozpIwc.InternalParticipant
 * @namespace ozpIwc
 */
ozpIwc.RouterWatchdog = ozpIwc.util.extend(ozpIwc.ClientParticipant, function(config) {
    ozpIwc.ClientParticipant.apply(this, arguments);
    this.internal = true;

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     */
    this.participantType = "routerWatchdog";

    /**
     * Frequency of heartbeats
     * @property heartbeatFrequency
     * @type Number
     * @defualt 10000
     */
    this.heartbeatFrequency = config.heartbeatFrequency || 10000;

    /**
     * Fired when connected to the router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter", this.setupWatches, this);


});

/**
 * Removes this participant from the $bus.multicast multicast group.
 *
 * @method leaveEventChannel
 */
ozpIwc.RouterWatchdog.prototype.leaveEventChannel = function() {
    // handle anything before leaving.
    if(this.router) {

        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.address,
                participantType: this.participantType,
                namesResource: this.namesResource
            }
        });

        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.router.selfId,
                namesResource: "/router/"+this.router.selfId
            }
        });
        //TODO not implemented
//        this.router.unregisterMulticast(this, ["$bus.multicast"]);
        return true;
    } else {
        return false;
    }

};
/**
 * Sets up the watchdog for all participants connected to the router. Reports heartbeats based on
 * {{#crossLink "ozpIwc.RouterWatchdogParticipant/heartbeatFrequency:property"}}{{/crossLink}}
 * @method setupWatches
 */
ozpIwc.RouterWatchdog.prototype.setupWatches = function() {
    this.name = this.router.selfId;
    var self=this;
    var heartbeat=function() {
        var packets = [];
        var p = self.names().messageBuilder.set("/router/" + self.router.selfId,{
            contentType: "application/vnd.ozp-iwc-router-v1+json",
            entity: {
                'address': self.router.selfId,
                'participants': self.router.getParticipantCount(),
                'time': ozpIwc.util.now()
            },
            respondOn: "none"
        });
        packets.push(p);

        for (var k in self.router.participants) {
            var participant=self.router.participants[k];
            participant.heartBeatStatus.time = ozpIwc.util.now();
            if(participant instanceof ozpIwc.MulticastParticipant) {
                /*jshint loopfunc:true*/
                participant.members.forEach(function(member){
                    p = self.names().messageBuilder.set(participant.namesResource + "/"+ member.address, {
                        'entity' : member.heartBeatStatus,
                        'contentType' : participant.heartBeatContentType,
                        'respondOn': "none"
                    });
                    packets.push(p);
                });
            } else {

                packets.push({
                    packet: participant.heartbeat(),
                    callback: undefined,
                    res: function(){},
                    rej: function(){}
                });
            }            
        }

        // Send all heartbeats at once
        self.names().bulkSend(packets);

    };

    /**
     * The timer for the heartBeat
     * @property timer
     * @type window.setInterval
     */
    this.timer = window.setInterval(heartbeat, this.heartbeatFrequency);
};

/**
 * Removes the watchdog.
 * @method shutdown
 */
ozpIwc.RouterWatchdog.prototype.shutdown = function() {
    window.clearInterval(this.timer);
};




/**
 * Service API classes of the bus.
 * @module bus.service
 * @submodule bus.service.Type
 */

/**
 * The base class for APIs. Use {{#crossLink "ozpIwc.createApi"}}{{/crossLink}} to subclass
 * this.
 * 
 * Leader State Management
 * =======================
 * The base API uses locks.api to always have a single leader at a time.  An api instance goes
 * through a linear series of states:  member -> loading -> leader
 * * __member__ does not service requests
 * * __loading__ is a transitory state between acquiring the leader lock and being ready to serve requests
 * * __leader__ actively serves requests and broadcasts a death scream upon shutdown
 *
 * The member state has two substates-- ready and dormant
 *  * __ready__ queues requests in case it has to become leader.  switches back to dormant on discovering a leader
 *  * __dormant__ silently drops requests.  Upon hearing a deathScream, it switches to ready.

 * @class ApiBase
 * @module ozpIwc
 * @namespace ozpIwc
 * @constructor
 * @param {Object} config
 * @param {String} config.name The api address (e.g. "names.api")
 * @param {ozpIwc.ClientMixin} [config.participant] The connection to use for communication
 * @param {ozpIwc.Router} [config.router=ozpIwc.defaultRouter] The router to connect to
 */
ozpIwc.ApiBase=function(config) {
	if(!config.name) {
        throw Error("API must be configured with a name");
    }
    this.participant=config.participant || new ozpIwc.ClientParticipant({internal:true});

    this.name=config.name;
    this.coordinationAddress="coord." + this.name;
    
    
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);

    this.endpoints=[];
    this.data={};
    this.watchers={};
    this.collectors=[];
    this.changeList={};
    this.leaderState="member";

    
    this.router=config.router || ozpIwc.defaultRouter;
    this.router.registerMulticast(this.participant,[this.name,this.coordinationAddress]);

    var self=this;
    this.participant.on("receive",function(packetContext) {
        self.receivePacketContext(packetContext);
    });


    this.logPrefix="[" + this.name + "/" + this.participant.address +"] ";

    ozpIwc.util.addEventListener("beforeunload",function(){ self.shutdown(); });

    this.transitionToMemberReady();
    this.queueForCoordination(config.leaderPromise);

};

ozpIwc.ApiBase.prototype.queueForCoordination=function(promise){
    var self = this;
    this.participant.send({
        dst: "locks.api",
        resource: "/mutex/" + this.name,
        action: "watch"
    },function(reply){
        self.handleLockChange(reply);
    });



    this.leaderPromise= promise || this.participant.send({
            dst: "locks.api",
            resource: "/mutex/"+this.name,
            action: "lock"
        });

    this.leaderPromise.then(function(pkt) {
        ozpIwc.log.info("["+self.name+"]["+self.participant.address+"] Now operating");
        var resolve;

        // Delay loading for deathScreams to flow in.
        var delayed = new Promise(function(res,rej){
            resolve = res;
        });

        window.setTimeout(function(){
            resolve();
        },1000);

        return delayed;
    }).then(function(){
        self.transitionToLoading();
    });

    this.leaderPromise.catch(function(e) {
        console.error("Error registering for leader mutex [address="+self.participant.address+",api="+self.name+"]",e);
    });

};

ozpIwc.ApiBase.prototype.handleLockChange=function(response,done){
    response = response || {};
    response.entity = response.entity || {};
    response.entity.oldValue = response.entity.oldValue || {};
    response.entity.newValue = response.entity.newValue || {};
    var prevOwner = response.entity.oldValue.owner || {};
    var newOwner = response.entity.newValue.owner || {};

    // If we are no longer the holder of the API lock get back in line to own it. This case only applies if the API
    // instance was pushed out. If the instance closes this code is not reached.
    if(prevOwner.src === this.participant.address && newOwner.src !== this.participant.address){
        this.broadcastDeathScream(this.createDeathScream());
        this.leaderState = "member";
        this.transitionToMemberReady();
        this.queueForCoordination();
        done();
    }
};

/**
 * Generates a unique key with the given prefix.
 * @param {String} prefix
 * @returns {String}
 */
ozpIwc.ApiBase.prototype.createKey = function(prefix) {
    prefix = prefix || "";
    var key;
    do {
        key = prefix + ozpIwc.util.generateId();
    } while (key in this.data);
    return key;
};

/**
 * A handler function for when a node is created. Can be overridden by inherited APIs.
 * @method createdHandler
 * @param node
 */
ozpIwc.ApiBase.prototype.createdHandler=function(node){
    //Whenever a node is created update the collector's lists.
    this.updateCollections();
};

/**
 * A handler function called after a node is changed but before it's watchers are notified.
 * @method changedHandler
 * @param {Object} node
 * @param {Object} entity
 * @param {Object} packetContext
 */
ozpIwc.ApiBase.prototype.changedHandler =function(node,entity,packetContext) {
    //var culprit = packetContext.src;
    var lifespanFns = ozpIwc.Lifespan.getLifespanFunctionality(node.lifespan);
    if(lifespanFns.shouldPersist()) {
        this.persistenceQueue.queueNode(this.name + "/" + node.resource, node);
    }
};

/**
 * A handler function called when an instance of this API has disconnected from the bus.
 * @method disconnectHandler
 * @param {String} address
 */
ozpIwc.ApiBase.prototype.disconnectHandler =function(address) {
    var self = this;
    ozpIwc.object.eachEntry(self.data,function(resource,node) {
        var lifespanFns = ozpIwc.Lifespan.getLifespanFunctionality(node.lifespan);
        if(lifespanFns.shouldDelete(node.lifespan,address)){
            self.markForChange(node);
            node.markAsDeleted();
        }
    });
    self.resolveChangedNodes();
};
//===============================================================
// Default methods that can be overridden by subclasses
//===============================================================
/**
 * Create the data that needs to be handed off to the new leader.
 *
 * __Intended to be overridden by subclasses__
 * 
 * Subsclasses can override this if they need to add additional
 * handoff data.  This MUST be a synchronous call that returns immediately.
 *
 * @method createDeathScream
 * @return {Object} the data that will be passed to the new leader
 */
ozpIwc.ApiBase.prototype.createDeathScream=function() {
    return {
        watchers: this.watchers,
        collectors: this.collectors,
        data: ozpIwc.object.eachEntry(this.data,function(k,v) {
            return v.serializeLive();
        }),
        timestamp: ozpIwc.util.now()
    };
};

/**
 * Gathers the desired preference from the data API.
 * @method getPreference
 * @param {String} prefName
 * @returns {Promise}
 */
ozpIwc.ApiBase.prototype.getPreference=function(prefName) {
    return this.participant.send({
        dst: "data.api",
        resource: "/ozp/iwc/"+this.name+"/"+prefName,
        action: "get"
    }).then(function(reply) {
        return reply.entity;
    });
};

/**
 * Called when the API has become the leader, but before it starts
 * serving data.  Receives the deathScream of the previous leader
 * if available, otherwise undefined.
 * 
 * __Intended to be overridden by subclasses__
 * 
 * Subsclasses can override this to load data from the server.
 *  
 * @method initializeData
 * @param {object} deathScream
 * @return {Promise} a promise that resolves when all data is loaded.
 */
ozpIwc.ApiBase.prototype.initializeData=function(deathScream) {
    deathScream=deathScream || { watchers: {}, collectors: [], data: []};
    this.watchers=deathScream.watchers;
    this.collectors = deathScream.collectors;
    deathScream.data.forEach(function(packet) {
        this.createNode({resource: packet.resource}).deserializeLive(packet);
    },this);

    this.updateCollections();
    if(this.endpoints) {
        var self=this;
        return Promise.all(this.endpoints.map(function(u) {
          var e=ozpIwc.endpoint(u.link) ;
          return self.loadFromEndpoint(e,u.headers).catch(function(e) {
              ozpIwc.log.error(self.logPrefix,"load from endpoint ",e," failed: ",e);
          });
        }));
    } else {
        return Promise.resolve();
    }
};

/**
 * Creates a node appropriate for the given config, puts it into this.data,
 * and fires off the right events.
 *  
 * @method createNode
 * @param {Object} config The ApiNode configuration.
 * @return {ozpIwc.ApiNode}
 */
ozpIwc.ApiBase.prototype.createNode=function(config,NodeType) {
    var n=this.createNodeObject(config,NodeType);
		this.data[n.resource]=n;
		this.events.trigger("createdNode",n);
		return n;
};



/**
 * Creates a node appropriate for the given config.  This does
 * NOT add the node to this.data.  Default implementation returns
 * a plain ozpIwc.ApiNode.
 * 
 * __Intended to be overridden by subclasses__
 * 
 * Subsclasses can override this for custom node types that may vary
 * from resource to resource.
 * 
 * @method createNodeObject
 * @param {Object} config The ApiNode configuration.
 * @param {Function} NodeType The contructor call for the given node type to be created.
 * @return {ozpIwc.ApiNode}
 */
ozpIwc.ApiBase.prototype.createNodeObject=function(config,NodeType) {
    if(NodeType) {
        return new NodeType(config);
    } else {
        return new ozpIwc.ApiNode(config);
    }
};

//===============================================================
// Leader state management
//===============================================================

/**
 * @method transitionToLoading
 * @private
 * @return {Promise} a promise that resolves when all data is loaded.
 */
ozpIwc.ApiBase.prototype.transitionToLoading=function() {
    var self=this;
    if(this.leaderState !== "member") {
				ozpIwc.log.error(this.logPrefix+"transition to loading called in an invalide state:",this.leaderState);
        return Promise.reject(this.logPrefix+"transition to loading called in an invalide state:",this.leaderState);
    }
		ozpIwc.log.debug(this.logPrefix+"transitioning to loading");
    this.leaderState="loading";
    return this.initializeData(this.deathScream)
        .then(function() {
             self.transitionToLeader();
        },function(e) {
            ozpIwc.log.error(self.logPrefix+"Failed to load data due to ",e);
            self.shutdown();
        });
};

/**
 * @method transitionToLeader
 * @private
 */
ozpIwc.ApiBase.prototype.transitionToLeader=function() {
    if(this.leaderState !== "loading") {
            ozpIwc.log.error(this.logPrefix+"transition to leader called in an invalid state:",this.leaderState);
            return;
    }
    ozpIwc.log.debug(this.logPrefix+"transitioning to leader");
    this.leaderState = "leader";
    this.broadcastLeaderReady();
    this.deliverRequestQueue();

    this.on("createdNode",this.createdHandler,this);
    this.on("changed",this.changedHandler,this);
    this.on("addressDisconnects",this.disconnectHandler,this);
};

/**
 * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
 * @method shutdown
 * @return 
 */
ozpIwc.ApiBase.prototype.shutdown=function() {
    if(this.leaderState === "leader") {
        this.broadcastDeathScream(this.createDeathScream());
    }
    
    this.participant.send({
        dst: "locks.api",
        resource: "/mutex/"+this.name,
        action: "unlock"
    });
};

/**
 * @method transitionToMemberReady
 * @private
 * @param {Object} deathScream
 * @return {Promise}
 */
ozpIwc.ApiBase.prototype.transitionToMemberReady=function(deathScream) {
    if(this.leaderState !== "member") {
        return;
    }
    this.deathScream=deathScream;
    this.off("createdNode",this.createdHandler);
    this.off("changed",this.changedHandler);
    this.off("addressDisconnects",this.disconnectHandler);
    this.enableRequestQueue();
    return Promise.resolve();
};

/**
 * @method transitionToMemberDormant
 * @private
 * @return {Promise}
 */
ozpIwc.ApiBase.prototype.transitionToMemberDormant=function() {
    if(this.leaderState !== "member") {
        return;
    }
    this.deathScream=null;
    this.flushRequestQueue();
    return Promise.resolve();
};

//===============================================================
// Data Management
//===============================================================

/**
 * Authorize the request for the given node.
 *  
 * @method checkAuthorization
 * @param {ozpIwc.ApiNode} node
 * @param {Object} context
 * @param {ozpIwc.TransportPacket} packet
 * @param {String} action
 * @return {undefined}
 */
ozpIwc.ApiBase.prototype.checkAuthorization=function(node,context,packet,action) {
    //@TODO: actually implement checking the authorization...
    return true;
};

/**
 * Returns a list of nodes that start with the given prefix.
 *  
 * @method matchingNodes
 * @param {String} prefix
 * @return {ozpIwc.ApiNode[]} a promise that resolves when all data is loaded.
 */
ozpIwc.ApiBase.prototype.matchingNodes=function(prefix) {
    return ozpIwc.object.values(this.data, function(k,node) { 
        return node.resource.indexOf(prefix) ===0 && !node.deleted;
    });
};


//===============================================================
// Watches
//===============================================================

/**
 * Marks that a node has changed and that change notices may need to 
 * be sent out after the request completes.
 *  
 * @method markForChange
 * @param {ApiNode} nodes...
 */
ozpIwc.ApiBase.prototype.markForChange=function(/*varargs*/) {
    for(var i=0;i<arguments.length;++i) {
        if(Array.isArray(arguments[i])) {
            this.markForChange(arguments[i]);
        } else {
            var resource=arguments[i].resource || ""+arguments[i];
            // if it's already marked, skip it
            if(this.changeList.hasOwnProperty(resource)) {
                continue;
            }
            
            var n=this.data[resource];

            this.changeList[resource]=n?n.snapshot():{};
        }
    }
};

/**
 * Marks that a node has changed and that change notices may need to
 * be sent out after the request completes.
 *
 * @method addWatcher
 * @param {String} resource name of the resource to watch
 * @param {Object} watcher
 * @param {String} watcher.resource name of the resource to watch
 * @param {String} watcher.src Address of the watcher
 * @param {String | Number} watcher.replyTo The conversation id that change notices will go to
 */
ozpIwc.ApiBase.prototype.addWatcher=function(resource,watcher) {
    var watchList=this.watchers[resource];
    if(!Array.isArray(watchList)) {
        watchList=this.watchers[resource]=[];
    }

    watchList.push(watcher);
};

/**
 * Removes mark that a node has changed and that change notices may need to
 * be sent out after the request completes.
 *
 * @method removeWatcher
 * @param {String} resource name of the resource to unwatch
 * @param {Object} watcher
 * @param {String} watcher.src Address of the watcher
 * @param {String | Number} watcher.replyTo The conversation id that change notices will go to
 */
ozpIwc.ApiBase.prototype.removeWatcher=function(resource,watcher) {
    var watchList=this.watchers[resource];
    if(watchList) {
        this.watchers[resource]=watchList.filter(function(watch) {
            return watch.src === watcher.src && watch.replyTo === watcher.msgId;
        });
    }
};


/**
 * Adds the given node to the collector list. It's collection list will be updated on api data changes.
 * @method addCollector
 * @param {Object} node
 */
ozpIwc.ApiBase.prototype.addCollector=function(resource){
    var index = this.collectors.indexOf(resource);
    if(index < 0) {
        this.collectors.push(resource);
    }
    var node = this.data[resource];
    if(node) {
        this.updateCollectionNode(node);
    }
};


/**
 * Removes the given node from the collector list. It's collection list will no longer be updated on api data changes.
 * @method removeCollector
 * @param {Object} node
 */
ozpIwc.ApiBase.prototype.removeCollector=function(node){
    var index = this.collectors.indexOf(node.resource);
    if(index > -1) {
        this.collectors.splice(index, 1);
    }
};

/**
 * Notifies watchers of changes of the resource since the given snapshot.
 * @method resolveChangedNode
 * @param {String} resource
 * @param {Object} snapshot
 * @param {Object} packetContext
 */
ozpIwc.ApiBase.prototype.resolveChangedNode=function(resource,snapshot,packetContext) {
    var node=this.data[resource];
    var watcherList=this.watchers[resource] || [];

    if(!node) {
        return;
    }

    var changes=node.changesSince(snapshot);
    if(!changes) {
        return;
    }

    var permissions=ozpIwc.authorization.pip.attributeUnion(
        changes.oldValue.permissions,
        changes.newValue.permissions
    );

    var entity={
        oldValue: changes.oldValue.entity,
        newValue: changes.newValue.entity,
        oldCollection: changes.oldValue.collection,
        newCollection: changes.newValue.collection,
        deleted: node.deleted
    };

    this.events.trigger("changed",node,entity,packetContext);

    watcherList.forEach(function(watcher) {
        // @TODO allow watchers to changes notifications if they have permission to either the old or new, not just both
        this.participant.send({
            'src'   : this.participant.name,
            'dst'   : watcher.src,
            'replyTo' : watcher.replyTo,
            'response': 'changed',
            'resource': node.resource,
            'permissions': permissions,
            'contentType': node.contentType,
            'entity': entity
        });
    },this);
};

/**
 * Called after the request is complete to send out change notices.
 *  
 * @method resolveChangedNodes
 * @param {Object} packetContext the packet that caused this change.
 * @private
 */
ozpIwc.ApiBase.prototype.resolveChangedNodes=function(packetContext) {
    this.updateCollections();
    ozpIwc.object.eachEntry(this.changeList,function(resource,snapshot){
        this.resolveChangedNode(resource,snapshot,packetContext);
    },this);
    this.changeList={};
};

/**
 * Itterates over all collectors of the API for updates
 * @method updateCollections
 */
ozpIwc.ApiBase.prototype.updateCollections = function(){
    for(var i in this.collectors){
        var collectorNode = this.data[this.collectors[i]];
        this.updateCollectionNode(collectorNode);
    }
};

/**
 * Removes the collector node resource from the collectors list if deleted. Removes references to nodes in the given
 * collectors collection property if said referenced node is deleted. Adds newly created nodes to the collection
 * property if said node's resource matches the collection nodes pattern property.
 *
 * @method updateCollectionNode
 * @param {Object} cNode the collector node to update
 */
ozpIwc.ApiBase.prototype.updateCollectionNode = function(cNode){
    if(!cNode) {
        return;
    }
    //If the collection node is deleted, stop collecting for it.
    if(cNode.deleted){
        this.removeCollector(cNode.resource);
        return;
    }


    var updatedCollection = this.matchingNodes(cNode.pattern).filter(function(node){
        return !node.deleted;
    }).map(function(node) {
        return node.resource;
    });

    cNode.collection = cNode.collection || [];
    if(!ozpIwc.util.arrayContainsAll(cNode.collection,updatedCollection) || !ozpIwc.util.arrayContainsAll(updatedCollection,cNode.collection)) {
        this.markForChange(cNode);
        cNode.collection = updatedCollection;
        cNode.version++;
    }
};

//===============================================================
// Packet Routing
//===============================================================
/**
 * Sends packets of data from this API to other parts of the IWC bus.
 *
 * @param {Object} fragment
 * @returns {Promise}
 */
ozpIwc.ApiBase.prototype.send=function(fragment) {
    fragment.src=this.name;
    return this.participant.send(fragment);
};

/**
 * Routes a packet received from the participant.
 *  
 * @method receivePacketContext
 * @property {Object} packetContext
 * @private
 */
ozpIwc.ApiBase.prototype.receivePacketContext=function(packetContext) {
    if(packetContext.packet.src===this.participant.address) {
        // drop our own packets
        return Promise.resolve();
    }

    if(packetContext.packet.dst===this.coordinationAddress) {
        return this.receiveCoordinationPacket(packetContext);
    } else if (packetContext.packet.dst === "$bus.multicast"){
        return this.receiveBusPacket(packetContext);
    } else {
        return this.receiveRequestPacket(packetContext);
    }
};

/**
 * Handles packets received with a destination of "$bus.multicast".
 *
 * @method receiveBusPacket
 * @param {Object} packetContext
 * @returns {*}
 */
ozpIwc.ApiBase.prototype.receiveBusPacket=function(packetContext) {
    var packet=packetContext.packet;
    switch(packet.action) {
        case "connect":
            this.events.trigger("addressConnects",packet.entity.address,packet);
            break;
        case "disconnect":
            this.removeDeadWatchers(packet.entity.address);
            this.events.trigger("addressDisconnects",packet.entity.address,packet);
            break;
    }
    return Promise.resolve();
};

/**
 * If the the given address is watching a resource, it will be removed from the watch list. Router addresses will
 * remove all of its participants watch registrations.
 *
 * @method removeDeadWatchers
 * @param {String} address
 */
ozpIwc.ApiBase.prototype.removeDeadWatchers = function(address){
    var len=address.length;
    ozpIwc.object.eachEntry(this.watchers,function(resource,array) {
        for(var i in array) {
            if (array[i].src.substr(-len) === address) {
                array.splice(i, 1);
            }
        }
    });
};

//===============================================================
// API Request Handling
//===============================================================

/**
 * Routes a request to the proper handler and takes care of overhead
 * such as change requests.
 *  
 * @method receivePacketContext
 * @property {Object} packetContext
 * @private
 */
ozpIwc.ApiBase.prototype.receiveRequestPacket=function(packetContext) {
    var packet=packetContext.packet;

    if(this.isRequestQueueing) {
        this.requestQueue.push(packetContext);
        return Promise.resolve();
    }
    if(this.leaderState !== "leader"){
        return Promise.resolve();
    }
    
    var self=this;
    return new Promise(function(resolve,reject) {
        try {
            packetContext.node=self.data[packet.resource];
            resolve(self.routePacket(packet,packetContext));
        } catch(e) {
            reject(e);
        }
    }).then(function(packetFragment) {
        if(packetFragment) {
            packetFragment.response = packetFragment.response || "ok";
            packetContext.replyTo(packetFragment);
        }
        self.resolveChangedNodes(packetContext);
    },function(e) {
        if(!e || !e.errorAction) {
            ozpIwc.log.error(self.logPrefix,"Unexpected error: ",e," packet= ",packet);
        }
        var packetFragment={
            'src': self.name,
            'response': e.errorAction || "errorUnknown",
            'entity': e.message
        };
        packetContext.replyTo(packetFragment);
    });

};

/**
 * Any request packet that does not match a route ends up here.  By default,
 * it replies with BadAction, BadResource, or BadRequest, as appropriate.
 *  
 * @method receivePacketContext
 * @param {ozpIwc.TransportPacket} packet
 * @param {ozpIwc.TransportPacketContext} context
 */
ozpIwc.ApiBase.prototype.defaultRoute=function(packet,context) {
    switch(context.defaultRouteCause) {
        case "nonRoutablePacket": // packet doesn't have an action/resource, so ignore it
            return;
        case "noAction": 
            throw new ozpIwc.BadActionError(packet);
        case "noResource":
            throw new ozpIwc.BadResourceError(packet);
        default:
            throw new ozpIwc.BadRequestError(packet);
    }
};

/**
 * Enables the API's request queue, all requests will be held until deliverRequestQueue or flushRequestQueue is called.
 * @method enableRequestQueue
 * @private
 */
ozpIwc.ApiBase.prototype.enableRequestQueue=function() {
    this.isRequestQueueing=true;
    this.requestQueue=[];
};

/**
 * Routes all queued packets and turns off request queueing.
 * @method deliverRequestQueue
 * @private
 */
ozpIwc.ApiBase.prototype.deliverRequestQueue=function() {
    this.isRequestQueueing=false;
    this.requestQueue.forEach(this.receiveRequestPacket,this);
    this.requestQueue=[];
};

/**
 * Empties the queue of requests without processing and turns off queuing.
 * @method flushRequestQueue
 * @private
 */
ozpIwc.ApiBase.prototype.flushRequestQueue=function() {
    this.isRequestQueueing=false;
    this.requestQueue=[];
};

/**
 * Enables API's sending queue. This is to prevent an API from communicating given some state (Used for consensus
 * initialization).
 *
 * @method enableSendQueue
 * @private
 */
ozpIwc.ApiBase.prototype.enableSendQueue=function(){
    this.isSendQueueing=true;
    this.sendQueue=[];
};

/**
 * Delivers and disables API's sending queue.
 *
 * @method deliverSendQueue
 * @private
 */
ozpIwc.ApiBase.prototype.deliverSendQueue=function(){
    this.isSendQueueing=false;
    this.sendQueue.forEach(this.participant.send,this.participant);
    this.sendQueue=[];
};

/**
 * Empties and disables API's sending queue.
 *
 * @method flushSendQueue
 * @private
 */
ozpIwc.ApiBase.prototype.flushSendQueue=function() {
    this.isSendQueueing=false;
    this.sendQueue=[];
};


//===============================================================
// API Coordination Handling
//===============================================================
/**
 * Broadcasts to other instances of this API on the bus that it is ready to lead.
 * @method broadcastLeaderReady
 */
ozpIwc.ApiBase.prototype.broadcastLeaderReady=function() {
    this.participant.send({
        dst: this.coordinationAddress,
        action: "announceLeader"
    });
};

/**
 * Broadcasts to other instances of this API on the bus this APIs state.
 * @method broadcastDeathScream
 * @param {Object} deathScream the state data to pass on.
 */
ozpIwc.ApiBase.prototype.broadcastDeathScream=function(deathScream) {
    this.participant.send({
        dst: this.coordinationAddress,
        action: "deathScream",
        entity: deathScream
    });
};

/**
 * Handles packets received regarding leadership actions.
 * @method receiveCoordinationPacket
 * @param {Object} packetContext
 * @returns {Promise}
 */
ozpIwc.ApiBase.prototype.receiveCoordinationPacket=function(packetContext) {
    var packet=packetContext.packet;
    switch(packet.action) {
        case "announceLeader":
            return this.transitionToMemberDormant();
        case "deathScream":
            return this.transitionToMemberReady(packet.entity);
        default:
            ozpIwc.log.error("Unknown coordination packet: ", packet);
            return Promise.reject(new Error("Unknown action: " + packet.action + " in " + JSON.stringify(packetContext)));
    }
};

//===============================================================
// Load data from the server
//===============================================================

/**
 * Loads data from the provided endpoint.  The endpoint must point to a HAL JSON document
 * that embeds or links to all resources for this api.
 * 
 * @method loadFromEndpoint
 * @param {ozpIwc.Endpoint} endpoint
 * @param {Array} headers
 * @return {Promise} resolved when all data has been loaded.
 */
ozpIwc.ApiBase.prototype.loadFromEndpoint=function(endpoint,headers) {
    var self=this;
		ozpIwc.log.debug(self.logPrefix+" loading from ",endpoint.name," -- ",endpoint.baseUrl);
    return endpoint.get("/").then(function(data) {

        var response=data.response;
        var embeddedItems=ozpIwc.util.ensureArray((response._embedded && response._embedded.item) || []);
        var linkedItems=ozpIwc.util.ensureArray((response._links && response._links.item) || []);

        // load all the embedded items
        embeddedItems.forEach(function(i) {
            self.createNode({
                serializedEntity: i
            });
        });
				ozpIwc.log.debug(self.logPrefix+" processed " + embeddedItems.length + " items embedded in the endoint");
        var unknownLinks=linkedItems.map(function(i) { return i.href;});
        unknownLinks=unknownLinks.filter(function(href) {
                return ozpIwc.object.values(self.data,function(k,node) {
                    return node.self === href;
                }).length === 0;
            });
				ozpIwc.log.debug(self.logPrefix+" loading " + unknownLinks.length + " linked items");

				// empty array resolves immediately, so no check needed
        return Promise.all(unknownLinks.map(function(l) {
            return endpoint.get(l,headers).then(function(data) {

                var contentType = data.header['Content-Type'] || "";

                //split off the charset if given.
                contentType = contentType.split(';')[0];
                self.createNode({
                    serializedEntity: data.response,
                    serializedContentType: contentType
                });
            }).catch(function(err) {
							ozpIwc.log.info(self.logPrefix+"Could not load from "+l+" -- ",err);
						});
        }));

    }).catch(function(err) {
			ozpIwc.log.info(self.logPrefix+" couldn't load from endpoint "+endpoint.name +" -- ",err);
		});
};


//===============================================================
// Default Routes and Subclass Helpers
//===============================================================
/**
 * Gathers the collection data for a node given its pattern only if it has a pattern.
 * @method getCollection
 * @param {String} pattern
 * @returns {Array}
 */
ozpIwc.ApiBase.prototype.getCollection = function(pattern){
    if(pattern) {
        return this.matchingNodes(pattern).filter(function (node) {
            return !node.deleted;
        }).map(function (node) {
            return node.resource;
        });
    } else {
        return [];
    }
};

/**
 * A collection of default action handlers for an API.
 * @property defaultHandler
 * @static
 * @type {Object}
 */
ozpIwc.ApiBase.defaultHandler={
    "get":function(packet,context,pathParams) {
        var p =  context.node.toPacket();
        p.collection = this.getCollection(p.pattern);
        return p;
    },
    "set":function(packet,context,pathParams) {
        context.node.set(packet);
        return { response: "ok" };
    },
    "delete": function(packet,context,pathParams) {
        if(context.node) {
            context.node.markAsDeleted(packet);
        }

        return { response: "ok" };
    },
    "list": function(packet,context,pathParams) {
        var entity=this.matchingNodes(packet.resource).filter(function(node){
            if(node.deleted) {
                return false;
            }
            return true;
        }).map(function(node) {
            return node.resource;
        });
        return {
            "contentType": "application/json",
            "entity": entity
        };
    },
    "bulkGet": function(packet,context,pathParams) {
        var self = this;
        var entity=this.matchingNodes(packet.resource).map(function(node) {
            var p =  node.toPacket();
            p.collection = self.getCollection(p.pattern);
            return p;
        });
        // TODO: roll up the permissions of the nodes, as well
        return {
            "contentType": "application/json",
            "entity": entity
        };
    },
    "watch": function(packet,context,pathParams) {
        this.addWatcher(packet.resource,{
            src: packet.src,
            replyTo: packet.msgId
        });

        //Only if the node has a pattern applied will it actually be added as a collector.
        this.addCollector(packet.resource);

        if(context.node) {
            var p =  context.node.toPacket();
            p.collection = this.getCollection(p.pattern);
            return p;
        } else {
            return { response: "ok"};
        }
    },
    "unwatch": function(packet,context,pathParams) {
        this.removeWatcher(packet.resource, packet);

        //If no one is watching the resource any more, remove its collector if it has one to speed things up.
        if(this.watchers[packet.resource] && this.watchers[packet.resource].length === 0){
            this.removeCollector(packet.resource);
        }

        return { response: "ok" };
    }
};

/**
 * A list of all of the default actions.
 * @property allActions
 * @static
 * @type {String[]}
 */
ozpIwc.ApiBase.allActions=Object.keys(ozpIwc.ApiBase.defaultHandler);

/**
 * Install the default handler and filters for the provided actions and resources.
 * @method useDefaultRoute
 * @static
 * @param {String | String[]} actions
 * @param {String} resource="{resource:.*}" The resource template to install the default handler on.
 */


/**
 * Creates a subclass of ApiBase and adds some static helper functions.
 *
 * @method createApi
 * @param {Function} init the constructor function for the class
 * @return {Object} A new API class that inherits from the ApiBase class.
 */
ozpIwc.createApi=function(init) {
    var api=ozpIwc.util.extend(ozpIwc.ApiBase,function() {
        ozpIwc.ApiBase.apply(this, arguments);
        return init.apply(this,arguments);
    });
    ozpIwc.PacketRouter.mixin(api);
    api.useDefaultRoute=function(actions,resource) {
        resource = resource || "{resource:.*}";
        actions=ozpIwc.util.ensureArray(actions);
        actions.forEach(function(a) {
            var filterFunc=ozpIwc.standardApiFilters.forAction(a);
            api.declareRoute({
                action: a,
                resource: resource,
                filters: (filterFunc?filterFunc():[])
            },ozpIwc.ApiBase.defaultHandler[a]
            );
        });
    };

    api.declareRoute({
        action: ["bulkSend"],
        resource: "{resource:.*}",
        filters: []
    }, function(packet, context, pathParams) {
        var messages = packet.entity || [];
        var self = this;

        messages.forEach(function(message){
            var packetContext=new ozpIwc.TransportPacketContext({
                'packet':message.packet,
                'router': self.router,
                'srcParticipant': message.packet.src,
                'dstParticipant': self.address
            });
            self.receiveRequestPacket(packetContext);
        });
        return { response: "ok"};
    });
    return api;
};

/**
 * ```
    .---------------------------.
   /,--..---..---..---..---..--. `.
  //___||___||___||___||___||___\_|
  [j__ ######################## [_|
     \============================|
  .==|  |"""||"""||"""||"""| |"""||
 /======"---""---""---""---"=|  =||
 |____    []*  IWC     ____  | ==||
 //  \\        BUS    //  \\ |===||  hjw -(& kjk)
 "\__/"---------------"\__/"-+---+'
 * ```
 * @module bus
 */

/**
 * Classes related to api aspects of the IWC.
 * @module bus
 * @submodule bus.api
 */
/**
 * The API classes that can be used on the IWC bus. All of which subclass {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}
 * @module bus.api
 * @submodule bus.api.Type
 */
/**
 * The API Value types that can be used in IWC apis. All of which subclass
 * {{#crossLink "CommonApiValue"}}{{/crossLink}}
 * @module bus.api
 * @submodule bus.api.Value
 */

/**
 * A base class for IWC error objects.
 *
 * @class ApiError
 * @namespace ozpIwc
 * @constructor
 *
 * @type {Function}
 * @param {String} action The action of the error.
 * @param {String} message The message corresponding to the error.
 */
ozpIwc.ApiError=ozpIwc.util.extend(Error,function(action,message) {
    Error.call(this,message);
    this.name="ApiError";
    this.errorAction=action;
    this.message=message;
});

/**
 * Stringifies the error.
 *
 * @method toString
 * @returns {String}
 */
ozpIwc.ApiError.prototype.toString=function() {
    return this.name+":"+JSON.stringify(this.message);
};

/**
 * Creates a subclass of the ApiError with the given error name prefix.
 *
 * @method subclass
 * @param response
 * @returns {Function}
 */
ozpIwc.ApiError.subclass=function(response) {
    return ozpIwc.util.extend(ozpIwc.ApiError,function(message) {
        ozpIwc.ApiError.call(this,response,message);
        this.name=response+"Error";
    });
};

/**
 * Thrown when an invalid action is called on an api.
 *
 * @class BadActionError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.BadActionError=ozpIwc.ApiError.subclass("badAction");

/**
 * Thrown when an invalid resource is called on an api.
 *
 * @class BadResourceError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.BadResourceError=ozpIwc.ApiError.subclass("badResource");

/**
 * Thrown when an invalid request is made against an api.
 *
 * @class BadRequestError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.BadRequestError=ozpIwc.ApiError.subclass("badRequest");

/**
 * Thrown when an invalid contentType is used in a request against an api.
 *
 * @class BadContentError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.BadContentError=ozpIwc.ApiError.subclass("badContent");

/**
 * Thrown when the action or entity is not valid for the resource's state.
 *
 * @class BadStateError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.BadStateError=ozpIwc.ApiError.subclass("badState");

/**
 * Thrown when no action is given in a request against an api.
 *
 * @class NoActionError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.NoActionError=ozpIwc.ApiError.subclass("noAction");

/**
 * Thrown when no resource is given in a request against an api.
 *
 * @class NoResourceError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.NoResourceError=ozpIwc.ApiError.subclass("noResource");

/**
 * Thrown if an api request packets ifTag exists but does not match the node's version property.
 *
 * @class NoMatchError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.NoMatchError=ozpIwc.ApiError.subclass("noMatch");

/**
 * Thrown when an api request is not permitted.
 *
 * @class NoPermissionError
 * @extends ozpIwc.ApiError
 * @static
 */
ozpIwc.NoPermissionError=ozpIwc.ApiError.subclass("noPermission");


/**
 * A collection of filter generation functions.
 *
 * @class apiFilter
 * @namespace ozpIwc
 * @static
 */

/**
 * @class ozpIwc.apiFilter.Function
 * @type {Function}
 * @param {type} packet
 * @param {type} context
 * @param {type} pathParams
 * @param {type} next
 * @returns {Function} a call to the next filter
 */

ozpIwc.apiFilter={
    /**
     * Returns a filter function with the following features:
     * Stores the resource in context.node, creating it via the api's
     * @method createResource
     * @returns {ozpIwc.apiFilter.Function}
     */
    createResource: function(NodeType) {
        if(NodeType) {
            return function(packet,context,pathParams,next) {
                if(!context.node) {
                    context.node=this.data[packet.resource]=new NodeType({
                        resource: packet.resource,
                        pattern: packet.pattern,
                        lifespan: packet.lifespan,
                        src: packet.src
                    });
                }
                return next();
            };
        } else {
            return function(packet,context,pathParams,next) {
                if(!context.node) {
                    context.node=this.createNode({
                        resource: packet.resource,
                        pattern: packet.pattern,
                        lifespan: packet.lifespan,
                        src: packet.src
                    });
                }
                return next();
            };
        }
    },
    /**
     * Returns a filter function with the following features:
     * Adds the resource as a collector to the API, it will now get updates based on its pattern property.
     * @method markAsCollector
     * @returns {Function}
     */
    markAsCollector: function(){

        return function(packet,context,pathParams,next) {
            this.addCollector(packet.resource);
            return next();
        };
    },

    /**
     * Returns a filter function with the following features:
     * Stores the resource in context.node or throws NoResourceError if it does not exist.
     * @method requireResource
     * @returns {ozpIwc.apiFilter.Function}
     */
    requireResource: function() {
        return function(packet,context,pathParams,next) {
            if(!context.node || context.node.deleted) {
                throw new ozpIwc.NoResourceError(packet);
            }
            return next();
        };
    },

    /**
     * Returns a filter function with the following features:
     * Checks that the subject within the context is authorized for the action on the resource node.
     * @method checkAuthorization
     * @returns {ozpIwc.apiFilter.Function}
     */
    checkAuthorization: function(action) {
        return function(packet,context,pathParams,next) {
            this.checkAuthorization(context.node,context,packet,action || packet.action);
            return next();
        };
    },

    /**
     * An empty filter
     *
     * @method nullFilter
     * @param packet
     * @param context
     * @param pathParams
     * @param next
     * @returns {Function} a call to the next filter
     */
    nullFilter: function(packet,context,pathParams,next) {
        return next();
    },

    /**
     * Returns a filter function with the following features:
     * Checks that the content type is one that is authorized for the api resource.
     * @method checkContentType
     * @returns {ozpIwc.apiFilter.Function}
     */
    checkContentType: function(contentType) {
        if(!contentType) {
            return ozpIwc.apiFilter.nullFilter;
        }
        contentType=ozpIwc.util.ensureArray(contentType);
        return function(packet,context,pathParams,next) {
            if(!contentType.some(function(t) {
                return t===packet.contentType ||
                    (Object.prototype.toString.call(contentType) === '[object RegExp]' && 
                    t.test(packet.contentType));
                })
            ) {
                throw new ozpIwc.BadContentError({
                    'provided': packet.contentType,
                    'allowedTypes': contentType
                });
            }
            return next();
        };
    },

    /**
     * Returns a filter function with the following features:
     * Marks the resource as changed.
     * @method markResourceAsChanged
     * @returns {ozpIwc.apiFilter.Function}
     */
    markResourceAsChanged: function() { 
        return function(packet,context,pathParams,next) {
            this.markForChange(packet);
            return next();
        };
    },

    /**
     * Returns a filter function with the following features:
     * If the packet does not contain a pattern property create one from the packet resource + "/". This filter is to
     * be used only in node creation as it can overwrite the nodes pattern property if different than resource + "/".
     * @method fixPattern
     * @returns {Function}
     */
    fixPattern: function(){
        return function(packet,context,pathParams,next) {
            var pattern;
            if(context.node){
                pattern = context.node.pattern;
            }
            if(packet.resource) {
                packet.pattern = packet.pattern || pattern || packet.resource + "/";
            }
            return next();
        };
    },

    /**
     * Returns a filter function with the following features:
     * Checks the version of the packet against the context.
     * @method checkVersion
     * @returns {ozpIwc.apiFilter.Function}
     */
    checkVersion: function() { 
        return function(packet,context,pathParams,next) {
        // if there is no resource node, then let the request through
        if(packet.ifTag && packet.ifTag!==context.node.version) {
            throw new ozpIwc.NoMatchError({
                expectedVersion: packet.ifTag,
                actualVersion: context.node.version
            });
        }
        return next();
    };}
};

/**
 * Wrappers that return the list of filters for a standard action
 *
 * @class standardApiFilters
 * @namespace ozpIwc
 * @static
 */
ozpIwc.standardApiFilters={
    /**
     * Returns the filter collection generator for the given action.
     * @method forAction
     * @param {String} a
     * @returns {Function}
     */
    forAction: function(a) {
        return ozpIwc.standardApiFilters[a+"Filters"];
    },

    /**
     * Filters for the set action.
     * @method setFilters
     * @param nodeType
     * @param contentType
     * @returns {Function[]} array of filters
     */
    setFilters: function(nodeType,contentType) {
        return [
            ozpIwc.apiFilter.createResource(nodeType),
            ozpIwc.apiFilter.checkAuthorization(),
            ozpIwc.apiFilter.checkContentType(contentType),
            ozpIwc.apiFilter.checkVersion(),
            ozpIwc.apiFilter.markResourceAsChanged()
        ];
    },

    /**
     * Filters for the delete action.
     * @method deleteFilters
     * @returns {Function[]} array of filters
     */
    deleteFilters: function() {
        return [
            ozpIwc.apiFilter.checkAuthorization(),
            ozpIwc.apiFilter.checkVersion(),
            ozpIwc.apiFilter.markResourceAsChanged()
        ];
    },

    /**
     * Filters for the get action.
     * @method getFilters
     * @returns {Function[]} array of filters
     */
    getFilters: function() {
        return [
            ozpIwc.apiFilter.requireResource(),
            ozpIwc.apiFilter.checkAuthorization()
        ];
    },

    /**
     * Filters for set-like actions that need to mark the resource as a collector.
     * @method getFilters
     * @returns {Function[]} array of filters
     */
    createAndCollectFilters: function(nodeType,contentType) {
        return [
            ozpIwc.apiFilter.fixPattern(),
            ozpIwc.apiFilter.createResource(nodeType),
            ozpIwc.apiFilter.checkAuthorization(),
            ozpIwc.apiFilter.checkContentType(contentType),
            ozpIwc.apiFilter.checkVersion()
        ];
    }
};
/**
 * Service API Value classes of the bus.
 * @module bus.service
 * @submodule bus.service.Value
 */
/**
 *
 * @class ApiNode
 * @namespace ozpIwc
 * @constructor
 * @param {Object} config
 * @param {String} config.resource
 * @param {String[]} config.allowedContentTypes
 * @param {Object} config.entity
 * @param {String} config.contentType
 * @param {Number} config.version
 * @param {String} config.self
 * @param {String} config.serializedEntity
 * @param {String} config.serializedContentType
 */
ozpIwc.ApiNode= function(config) {
 	config = config || {};

    /**
     * @property resource
     * @type String
     */
	this.resource=config.resource;

    /**
     * @property allowedContentTypes
     * @type Array
     */
    this.allowedContentTypes=config.allowedContentTypes;

    /**
     * @property entity
     * @type Object
     */
    this.entity=config.entity;

    /**
     * @property contentType
     * @type String
     */
	this.contentType=config.contentType;
    /**
     * @property uriTemplate
     * @type String
     */
	// used if() to allow for subclasses to set the uriTemplate on the prototype
	// setting the field, even to undefined, would mask the prototype's value
	if(config.uriTemplate) {
		this.uriTemplate=config.uriTemplate;
	}
    /**
     * @property permissions
     * @type Object
     * @default {}
     */
	this.permissions={};

    /**
     * @property version
     * @type Number
     * @default 0
     */
	this.version=config.version || 1;

    /**
     * @property lifespan
     * @type Boolean
     * @default false
     */
    var lifespanParsed = ozpIwc.Lifespan.getLifespan(config.lifespan);
    if(lifespanParsed){
        this.lifespan = lifespanParsed;
    } else {
        this.lifespan = new ozpIwc.Lifespan.Ephemeral();
    }

    /**
     * @property deleted
     * @type Boolean
     * @default true
     */
    this.deleted=false;

    /**
     * String to match for collection.
     * @property pattern
     * @type String
     */
    this.pattern = config.pattern;

    /**
     * @property collection
     * @type Array
     * @default []
     */
    this.collection = [];

    /**
     * @property self - The url backing this node 
     * @type String
     */
    this.self=config.self;
    
    if(config.serializedEntity) {
        this.deserializedEntity(config.serializedEntity,config.serializedContentType);
    }

    if(!this.resource) {
        throw new Error("ApiNode requires a resource");
    }
};

/**
 * Gathers the self uri from the uriTemplate property if it does not already exist.
 * @method getSelfUri
 * @returns {Number|*}
 */
ozpIwc.ApiNode.prototype.getSelfUri=function() {
	if(this.self) {
		return this.self;
	}
	if(this.uriTemplate && ozpIwc.uriTemplate) {
		var template=ozpIwc.uriTemplate(this.uriTemplate);
		if(template) {
			this.self=ozpIwc.util.resolveUriTemplate(template,this);
		}
	}
	return this.self;
};

/**
 * Serialize the node to a form that conveys both persistent and
 * ephemeral state of the object to be handed off to a new API
 * leader.
 * 
 * __Intended to be overridden by subclasses__
 * @method serializeLive
 * @returns {Object}
 */
ozpIwc.ApiNode.prototype.serializeLive=function() {
    return this.toPacket({
        deleted: this.deleted,
        pattern: this.pattern,
        collection: this.collection,
        lifespan: this.lifespan,
        allowedContentTypes: this.allowedContentTypes,
       _links: {
           self: {href: this.self}
       }
    });
};

/**
 * Set the node using the state returned by serializeLive.
 *
 * __Intended to be overridden by subclasses__
 * 
 * @method deserializeLive
 * @param {Object} serializedForm The data returned from serializeLive
 * @return {Object} the content type of the serialized data
 */
ozpIwc.ApiNode.prototype.deserializeLive=function(serializedForm, serializedContentType) {
    serializedForm.contentType = serializedForm.contentType || serializedContentType;
    this.set(serializedForm);
    if(serializedForm._links && serializedForm._links.self) {
        this.self=serializedForm._links.self.href;
    }
    if(!this.resource){
        this.resource = serializedForm.resource || this.resourceFallback(serializedForm);
    }
    this.deleted = serializedForm.deleted;
    this.lifespan= serializedForm.lifespan;
    this.allowedContentTypes=serializedForm.allowedContentTypes;
    this.pattern = serializedForm.pattern;
    this.collection = serializedForm.collection;
};


/**
 * If a resource path isn't given, this takes the best guess at assigning it.
 * Overriden by subclasses.
 *
 * @method deserializeResourceFromContentType
 * @param serializedForm
 */
ozpIwc.ApiNode.prototype.deserializeResourceFromContentType = function(serializedForm) {
    if(serializedForm._links && serializedForm._links.self){
        this.resource = serializedForm._links.self.href.replace(ozpIwc.apiRootUrl,"");
    }
};

/**
 * Serializes the node for persistence to the server.
 *
 * __Intended to be overridden by subclasses__
 * 
 * @method serializedEntity
 * @return {String} a string serialization of the object
 */
ozpIwc.ApiNode.prototype.serializedEntity=function() {
    return JSON.stringify(this.entity);
};

/**
 * The content type of the data returned by serializedEntity()
 *
 * __Intended to be overridden by subclasses__
 * 
 * @method serializedContentType
 * @return {String} the content type of the serialized data
 */
ozpIwc.ApiNode.prototype.serializedContentType=function() {
    return this.contentType;
};

/**
 * Sets the api node from the serialized form.
 *
 * __Intended to be overridden by subclasses__
 * 
 * @method serializedEntity
 * @param {String} serializedForm A string serialization of the object
 * @param {String} contentType The contentType of the object
 * @return {Object}
 */
ozpIwc.ApiNode.prototype.deserializedEntity=function(serializedForm,contentType) {
    if(typeof(serializedForm) === "string") {
        serializedForm=JSON.parse(serializedForm);
    }
    this.entity=serializedForm;
    this.contentType = contentType;
    if(this.entity && this.entity._links) {
        var links = this.entity._links;
        if (!this.self && links.self) {
            this.self = links.self.href;
        }
        if (!this.resource) {
            if (links["ozp:iwcSelf"]) {
                this.resource = links["ozp:iwcSelf"].href.replace(/web\+ozp:\/\/[^/]+/, "");
            } else {
                this.resource = this.resourceFallback(serializedForm);
            }
        }
    }
};


/**
 * If a resource path isn't given, this takes the best guess at assigning it.
 * @method resourceFallback
 * @param serializedForm
 */
ozpIwc.ApiNode.prototype.resourceFallback = function(serializedForm) {
    // do nothing, override if desired.
};

/**
 * Turns this value into a packet.
 *
 * @method toPacket
 * @param {ozpIwc.TransportPacket} base Fields to be merged into the packet.
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.ApiNode.prototype.toPacket=function(base) {
	base = base || {};
	base.entity=ozpIwc.util.clone(this.entity);
    base.lifespan = this.lifespan;
	base.contentType=this.contentType;
	base.permissions=this.permissions;
	base.eTag=this.version;
	base.resource=this.resource;
    base.pattern = this.pattern;
    base.collection = this.collection;
	return base;
};


/**
 * Sets a data based upon the content of the packet.  Automatically updates the content type,
 * permissions, entity, and updates the version.
 *
 * @method set
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.ApiNode.prototype.set=function(packet) {
    if(!Array.isArray(packet.permissions)){
        for(var i in packet.permissions) {
            //If a permission was passed, wipe its value and set it to the new value;
            this.permissions.clear(i);
            this.permissions.pushIfNotExist(i,packet.permissions[i]);
        }
    }
    this.lifespan = ozpIwc.Lifespan.getLifespan(packet.lifespan) || this.lifespan;
    this.contentType=packet.contentType;
    this.entity=packet.entity;
    this.pattern = packet.pattern || this.pattern;
    this.deleted = false;
    if(packet.eTag) {
        this.version=packet.eTag;
    } else {
        this.version++;
    }
};

/**
 * Clears the entity of the node and marks as deleted.
 * @method markAsDeleted
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.ApiNode.prototype.markAsDeleted=function(packet) {
    this.version++;
    this.deleted=true;
    this.entity=null;
    this.pattern=null;
    this.collection=null;
};

/**
 * Adds a new watcher based upon the contents of the packet.
 *
 * @method addWatch
 * @param {ozpIwc.TransportPacket} watch
 */
ozpIwc.ApiNode.prototype.addWatch=function(watch) {
    this.watchers.push(watch);
};

/**
 * Removes all watchers who's packet matches that which is passed in.
 * @method removeWatch
 * @param {ozpIwc.TransportPacket} filter
 */
ozpIwc.ApiNode.prototype.removeWatch=function(filter) {
    this.watchers=this.watchers.filter(filter);
};


/**
 * Generates a point-in-time snapshot of this value that can later be sent to
 * {@link ozpIwc.CommonApiValue#changesSince} to determine the changes made to the value.
 * This value should be considered opaque to consumers.
 * 
 * <p> For API subclasses, the default behavior is to simply call toPacket().  Subclasses
 * can override this, but should likely override {@link ozpIwc.CommonApiValue#changesSince}
 * as well.
 *
 * @method snapshot
 * @returns {object}
 */
ozpIwc.ApiNode.prototype.snapshot=function() {
	return this.toPacket();
};

/**
 * From a given snapshot, create a change notifications.  This is not a delta, rather it's
 * change structure.
 * <p> API subclasses can override if there are additional change notifications (e.g. children in DataApi).
 *
 * @method changesSince
 * @param {object} snapshot The state of the value at some time in the past.
 * @returns {Object} A record of the current value and the value of the snapshot.
 */
ozpIwc.ApiNode.prototype.changesSince=function(snapshot) {
	if(snapshot.eTag === this.version) {
        return null;
    }
	return {
        'newValue': this.toPacket(),
        'oldValue': snapshot
	};
};
/**
 * @class Endpoint
 * @namespace ozpIwc
 * @param {ozpIwc.EndpointRegistry} endpointRegistry Endpoint name
 * @constructor
 */
ozpIwc.Endpoint=function(endpointRegistry) {

    /**
     * @property endpointRegistry
     * @type ozpIwc.EndpointRegistry
     */
	this.endpointRegistry=endpointRegistry;
};

/**
 * Performs an AJAX request of GET for specified resource href.
 *
 * @method get
 * @param {String} resource
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 * @returns {Promise}
 */
ozpIwc.Endpoint.prototype.get=function(resource, requestHeaders) {
    var self=this;
    resource = resource || '';
    return this.endpointRegistry.loadPromise.then(function() {
        if(!self.endpointRegistry.loaded){
            throw Error("Endpoint " + self.endpointRegistry.apiRoot + " could not be reached. Skipping GET of " + resource);
        }

        if (resource === '/' || resource === '' ) {
            resource=self.baseUrl;
        }
        if(!resource){
            return Promise.reject();
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'GET',
            headers: requestHeaders
        });
    });
};

/**
 *
 * Performs an AJAX request of PUT for specified resource href.
 *
 * @method put
 * @param {String} resource
 * @param {Object} data\
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 * @returns {Promise}
 */
ozpIwc.Endpoint.prototype.put=function(resource, data, requestHeaders) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if(resource.indexOf(self.baseUrl)!==0) {
            resource=self.baseUrl + resource;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'PUT',
			data: data,
            headers: requestHeaders
        });
    });
};

/**
 *
 * Performs an AJAX request of DELETE for specified resource href.
 *
 * @method put
 * @param {String} resource
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 * @returns {Promise}
 */
ozpIwc.Endpoint.prototype.delete=function(resource, data, requestHeaders) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if(!self.baseUrl) {
            throw Error("The server did not define a relation of type " + this.name + " for retrivieving " + resource);
        }
        if(resource.indexOf(self.baseUrl)!==0) {
            resource=self.baseUrl + resource;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'DELETE',
            headers: requestHeaders
        });
    });
};

/**
 * Sends AJAX requests to PUT the specified nodes into the endpoint.
 * @todo PUTs each node individually. Currently sends to a fixed api point switch to using the node.self endpoint and remove fixed resource
 * @method saveNodes
 * @param {ozpIwc.CommonApiValue[]} nodes
 */
ozpIwc.Endpoint.prototype.saveNodes=function(nodes) {
    var resource = "/data";
    for (var node in nodes) {
        var nodejson = JSON.stringify(nodes[node]);
        this.put((nodes[node].self || resource), nodejson);
    }
};

/**
 * @class EndpointRegistry
 * @namespace ozpIwc
 * @constructor
 *
 * @param {Object} config
 * @param {String} config.apiRoot the root of the api path.
 */
ozpIwc.EndpointRegistry=function(config) {
    config=config || {};
    var apiRoot=config.apiRoot || '/api';

    /**
     * The root path of the specified apis
     * @property apiRoot
     * @type String
     * @default '/api'
     */
    this.apiRoot = apiRoot;

    /**
     * The collection of api endpoints
     * @property endPoints
     * @type Object
     * @default {}
     */
    this.endPoints={};

    /**
     * The collection of uri templates for endpoints.
     * @property template
     * @type Object
     * @default {}
     */
    this.template={};
		
    var self=this;

    /**
     * An AJAX GET request fired at the creation of the Endpoint Registry to gather endpoint data.
     * @property loadPromise
     * @type Promise
     */
    this.loadPromise=ozpIwc.util.ajax({
        href: apiRoot,
        method: 'GET'
    }).then(function(data) {
        self.loaded = true;
        var payload = data.response || {};
        payload._links = payload._links || {};
        payload._embedded = payload._embedded || {};

        for (var linkEp in payload._links) {
            if (linkEp !== 'self') {
                var link = payload._links[linkEp];
                if(Array.isArray(payload._links[linkEp])) {
                    link=payload._links[linkEp][0].href;
                }
                if(link.templated) {
                    self.template[linkEp]=link.href;
                } else {
                    self.endpoint(linkEp).baseUrl = link.href;
                }
            }
        }
        for (var embEp in payload._embedded) {
            var embLink = payload._embedded[embEp]._links.self.href;
            self.endpoint(embEp).baseUrl = embLink;
        }
        // UGLY HAX
        if(!self.template["ozp:data-item"]) {
            self.template["ozp:data-item"]=self.endpoint("ozp:user-data").baseUrl+"/{+resource}";
        }
        //END HUGLY HAX
    })['catch'](function(err){
        ozpIwc.log.debug(Error("Endpoint " + self.apiRoot + " " + err.statusText + ". Status: " +  err.status));
        self.loaded = false;
    });
};

/**
 * Finds or creates an input with the given name.
 *
 * @method endpoint
 * @param {String} name
 * @returns {ozpIwc.Endpoint}
 */
ozpIwc.EndpointRegistry.prototype.endpoint=function(name) {
    var endpoint=this.endPoints[name];
    if(!endpoint) {
        endpoint=this.endPoints[name]=new ozpIwc.Endpoint(this);
        endpoint.name=name;
    }
    return endpoint;
};

/**
 * Initializes the Endpoint Registry with the api root path.
 *
 * @method initEndpoints
 * @param {String} apiRoot
 */
ozpIwc.initEndpoints=function(apiRoot) {
    var registry=new ozpIwc.EndpointRegistry({'apiRoot':apiRoot});
    ozpIwc.endpoint=function(name) {
        return registry.endpoint(name);
    };
    ozpIwc.uriTemplate=function(name) {
        return registry.template[name];
    };
};


/**
 * @submodule bus.api.Type
 */

/**
 * The Locks Api. Treats each node as an individual mutex, creating a queue to access/own the resource.
 * Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the
 * {{#crossLink "ozpIwc.LocksNode"}}{{/crossLink}} which subclasses the
 * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
 *
 * @class LocksApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.LocksApi =ozpIwc.util.extend(ozpIwc.ApiBase,function(config) {
    if(!config.name) {throw Error("API must be configured with a name");}
    this.name = "locks.api";
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    this.router=config.router || ozpIwc.defaultRouter;
    this.endpoints=[];
    this.data={};
    this.watchers={};
    this.collectors=[];
    this.changeList={};

    //Start queueing and queue until either:
    // (1) state comes in a victor message or
    // (2) become leader. whichever is first
    this.enableRequestQueue();
    this.enableSendQueue();

    this.consensusConfiguration(config);
    this.participantConfiguration(config);
    this.on("addressDisconnects",this.unlockAll,this);

    this.logPrefix="[" + this.name + "/" + this.participant.address +"] ";
    //This is poor form, but the apiBase behavior for locks should let everyone write.
    this.leaderState="loading";
    this.transitionToLeader();

    var self = this;
    ozpIwc.util.addEventListener("beforeunload",function(){
        self.shutdown();
    });
});
ozpIwc.PacketRouter.mixin(ozpIwc.LocksApi);


ozpIwc.LocksApi.prototype.transitionToLeader = function(){
    if(this.leaderState !== "loading") {
        ozpIwc.log.error(this.logPrefix+"transition to leader called in an invalid state:",this.leaderState);
        return;
    }
    ozpIwc.log.debug(this.logPrefix+"transitioning to leader");
    this.leaderState = "leader";
    this.broadcastLeaderReady();
};

/**
 * The Locks Api uses the Bully Consensus module to determine leadership.
 *
 * @method consensusConfiguration
 * @param {Object} config
 */
ozpIwc.LocksApi.prototype.consensusConfiguration = function(config){
    this.consensusMember = config.consensusMember || new ozpIwc.consensus.Bully({
        'name': this.name,
        'router': this.router,
        'gatherLogs': function(){
            return self.createDeathScream();
        }
    });
    var self = this;
    this.consensusMember.on("receivedLogs",this.handleLogs,this);
    this.consensusMember.on("changedState",this.handleConsensusState,this);
};

/**
 * For Api call handling, the Locks Api uses a clientParticipant.
 *
 * @method participantConfiguration
 * @param {Object} config
 */
ozpIwc.LocksApi.prototype.participantConfiguration = function(config){
    this.participant =  new ozpIwc.ClientParticipant({internal:true});
    this.participant.on("receive",function(packetContext) {
        this.receivePacketContext(packetContext);
    },this);
    this.router.registerMulticast(this.participant,[this.name]);
    if(this.consensusMember.state === "coordinator"){
        this.deliverRequestQueue();
    }
};

/**
 * Unlocks All queued locks for the given address in the Locks Api.
 *
 * @TODO: Right now cycles through Every node, keep a map of addresses to nodes to unlock.
 *
 * @method unlockAll
 * @param {String} address
 */
ozpIwc.LocksApi.prototype.unlockAll = function(address){
    var self = this;
    ozpIwc.object.eachEntry(this.data,function(k,v) {
        self.updateLock(v,v.unlock({
            src: address
        }));
    });
};

/**
 * Iterates over all node's and cleans out any rouge locks queue'd for no-longer/non-existent addresses.
 *
 * @method cleanup
 */
ozpIwc.LocksApi.prototype.cleanup = function(){
    var addrMap = {};
    ozpIwc.object.eachEntry(this.data,function(k,v){
        var queue = v.entity.queue || [];
        queue.forEach(function(entry){
            addrMap[entry.src] = true;
        });
    });

    var self = this;
    this.participant.names().bulkGet("/address").then(function(reply){
        reply.entity.forEach(function(node){
            if(node.entity.time && node.entity.time + ozpIwc.heartBeatFrequency > ozpIwc.util.now()){
                addrMap[node.entity.address] = false;
            }
        });
    }).then(function(){
        ozpIwc.object.eachEntry(addrMap,function(k,v){
            if(v) {
                self.unlockAll(k);
            }
        });
    });
};

/**
 * When the Consensus Module changes state, the Locks Api behaves differently. It's participant will only send outbound
 * messages if it is the "Coordinator".
 *
 * @method handleConsensusState
 * @param {String} state
 */
ozpIwc.LocksApi.prototype.handleConsensusState = function(state){
    ozpIwc.log.debug("[" + this.participant.address + "] State: ", state);
    switch(state){
        case "coordinator":
            this.deliverRequestQueue();
            this.deliverSendQueue();
            break;
        default:
            this.participant.sendingBlocked = true;
            this.flushSendQueue();
            break;
    }
};

/**
 * If the Locks Api object has not been initialized, it will initialize with the data passed in to the handleLogs
 * function.
 *
 * @method handleLogs
 * @param {Object}data
 */
ozpIwc.LocksApi.prototype.handleLogs = function(data){
    if(this.initialized) {
        return;
    }
    this.initialized = true;
    var logTimestamp = data.timestamp;
    this.initializeData(data);
    this.deliverRequestQueue(logTimestamp);
};

/**
 * Override the default node type to be a Locks Api Value.
 *
 * @override
 * @method createNodeObject
 * @param {type} config
 * @returns {ozpIwc.DataNode}
 */
ozpIwc.LocksApi.prototype.createNodeObject=function(config) {
    return new ozpIwc.LocksNode(config);
};


/**
 * Shuts down the api, issuing a deathscream and releasing the lock, if possible.
 *
 * @method shutdown
 * @return
 */
ozpIwc.LocksApi.prototype.shutdown=function() {
    if(this.leaderState === "leader") {
        this.broadcastDeathScream(this.createDeathScream());
    }

    this.participant.send({
        dst: "locks.api",
        resource: "/mutex/"+this.name,
        action: "unlock"
    });
};

//====================================================================
// Default Route
//====================================================================
ozpIwc.LocksApi.useDefaultRoute=function(actions,resource) {
    resource = resource || "{resource:.*}";
    actions=ozpIwc.util.ensureArray(actions);
    var self = this;
    actions.forEach(function(a) {
        var filterFunc=ozpIwc.standardApiFilters.forAction(a);
        self.declareRoute({
                action: a,
                resource: resource,
                filters: (filterFunc?filterFunc():[])
            },ozpIwc.ApiBase.defaultHandler[a]
        );
    });
};

ozpIwc.LocksApi.useDefaultRoute(["bulkGet", "list", "get","watch","unwatch"]);
//====================================================================
// Bulk Send
//====================================================================
ozpIwc.LocksApi.declareRoute({
    action: ["bulkSend"],
    resource: "{resource:.*}",
    filters: []
}, function(packet, context, pathParams) {
    var messages = packet.entity || [];
    var self = this;

    messages.forEach(function(message){
        var packetContext=new ozpIwc.TransportPacketContext({
            'packet':message.packet,
            'router': self.router,
            'srcParticipant': message.packet.src,
            'dstParticipant': self.address
        });
        self.receiveRequestPacket(packetContext);
    });
    return { response: "ok"};
});

//====================================================================
// Lock
//====================================================================
ozpIwc.LocksApi.declareRoute({
    action: "lock",
    resource: "/mutex/{name}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.LocksNode)
}, function(packet,context,pathParams) {
    if(context.node) {
        this.updateLock(context.node, context.node.lock({
            src: packet.src,
            msgId: packet.msgId
        }));
    }
});

//====================================================================
// Unlock
//====================================================================
ozpIwc.LocksApi.declareRoute({
    action: "unlock",
    resource: "/mutex/{name}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.LocksNode)
}, function(packet,context,pathParams) {
    packet.entity = packet.entity || {};
    ozpIwc.log.debug("[locks.api"+ context.node.resource +"][UNLOCK]: ", packet.src);
    if(context.node) {
        this.updateLock(context.node, context.node.unlock({
            src: packet.entity.src || packet.src,
            msgId: packet.entity.msgId || packet.msgId
        }));
    }
});


//====================================================================
// Lock/Unlock Utility
//====================================================================
/**
 * Notifies the owner of the node's lock/unlock.
 *
 * @method updateLock
 * @param {ozpIwc.LocksApiValue} node
 * @param {Object} newOwner
 */
ozpIwc.LocksApi.prototype.updateLock=function(node,newOwner) {
    if(newOwner){
        ozpIwc.log.debug("[locks.api"+ node.resource +"][NEW LEADER]",newOwner);
        var pkt = {
            'dst': newOwner.src,
            'src': this.participant.name,
            'replyTo': newOwner.msgId,
            'response': 'ok',
            'resource': node.resource
        };

        if(this.isSendQueueing) {
            this.sendQueue.push(pkt);
        } else {
            this.participant.send(pkt);
        }
    }
};

/**
 * @submodule bus.api.Value
 */

/**
 * @class LocksNode
 * @namespace ozpIwc
 * @extends ozpIwc.apiNode
 *
 * @constructor
 * @param {Object} config
 * @param {String[]} config.allowedContentTypes a list of content types this Locs Api value will accept.
 */
ozpIwc.LocksNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    ozpIwc.ApiNode.apply(this, arguments);
    this.entity={
        owner: null,
        queue: []
    };
});

/**
 * Pushes the ozpIwc.TransportPacket onto the mutex queue. If it is the first element in the queue, the packet's sender
 * will take control of the node.
 *
 * @method lock
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Object|null} should the lock action set a new owner it will be returned, else null will be returned.
 */
ozpIwc.LocksNode.prototype.lock=function(packet) {
    this.entity.queue = this.entity.queue || [];

    for(var i in this.entity.queue) {
        var current = this.entity.queue[i];
        //Skip over duplicates (for newly joined instances of locks)
        if(current.src === packet.src && current.msgId === packet.msgId) {
            return null;
        }
    }

    this.entity.queue.push(packet);
    this.entity.owner = this.entity.owner || {};
    if(!ozpIwc.util.objectContainsAll(this.entity.owner,this.entity.queue[0])) {
        this.entity.owner=this.entity.queue[0];
        if(packet.eTag) {
            this.version=packet.eTag;
        } else {
            this.version++;
        }
        return this.entity.owner;
    }
    return null;
};

/**
 * Removes all ozpIwc.TransportPackets in the queue that match the given packet. Should this remove the owner of the
 * mutex, the next remaining packet's sender will take control.
 *
 * @method lock
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Object|null} should the unlock action set a new owner it will be returned, else null will be returned.
 */
ozpIwc.LocksNode.prototype.unlock=function(packet) {
    this.entity.queue=this.entity.queue.filter(function(q) {
       return !ozpIwc.util.objectContainsAll(q,packet);
    });



    if(!ozpIwc.util.objectContainsAll(this.entity.owner,this.entity.queue[0])) {
        this.entity.owner=this.entity.queue[0];
        if(packet.eTag) {
            this.version=packet.eTag;
        } else {
            this.version++;
        }
        return this.entity.owner;
    } else if(this.entity.queue.length === 0){
        if(packet.eTag) {
            this.version=packet.eTag;
        } else {
            this.version++;
        }
        this.entity.owner = null;
    }
    return null;
};


/**
 * @submodule bus.service.Value
 */

/**
 * @class DataNode
 * @namespace ozpIwc
 * @extends ozpIwc.ApiNode
 * @constructor
 */
ozpIwc.DataNode=ozpIwc.util.extend(ozpIwc.ApiNode,function(config) {
    ozpIwc.ApiNode.apply(this, arguments);
    var lifespanParsed = ozpIwc.Lifespan.getLifespan(config.lifespan);
    if(lifespanParsed){
        this.lifespan = lifespanParsed;
    } else {
        this.lifespan = new ozpIwc.Lifespan.Persistent();
    }
});

/**
 * @property uriTemplate
 * @type {string}
 */
ozpIwc.DataNode.prototype.uriTemplate="ozp:data-item";

/**
 * Serializes the node for persistence to the server.
 *
 * @method serializedEntity
 * @returns {String}
 */
ozpIwc.DataNode.prototype.serializedEntity=function() {
    return JSON.stringify({
        key: this.resource,
        entity: this.entity,
        collection: this.collection,
        pattern: this.pattern,
        contentType: this.contentType,
        permissions: this.permissions,
        version: this.version,
        _links: {
            self: {
                href: this.self
            }
        }
    });
};

/**
 * The content type of the data returned by serializedEntity()
 *
 * @method serializedContentType
 * @returns {string}
 */
ozpIwc.DataNode.prototype.serializedContentType=function() {
    return "application/vnd.ozp-iwc-data-object+json";
};

/**
 * Sets the api node from the serialized form.
 *
 * @method deserializedEntity
 * @param {String} serializedForm
 * @param {String} contentType
 */
ozpIwc.DataNode.prototype.deserializedEntity=function(serializedForm,contentType) {
    var data;
    if(typeof(serializedForm.entity) === "string") {
        data=JSON.parse(serializedForm.entity);
    } else {
        data = serializedForm.entity;
    }

    this.entity=data.entity;
    this.collection=data.collection;
    this.pattern = data.pattern;
    this.contentType=data.contentType;
    this.permissions=data.permissions;
    this.version=data.version;
    data._links = data._links || {};
    if(data._links.self) {
        this.self=data._links.self.href;
    }

    if (!this.resource) {
        if (data._links["ozp:iwcSelf"]) {
            this.resource = data._links["ozp:iwcSelf"].href.replace(/web\+ozp:\/\/[^/]+/, "");
        } else {
            this.resource = this.resourceFallback(data);
        }
    }
};

/**
 * If a resource path isn't given, this takes the best guess at assigning it.
 * @override
 * @method resourceFallback
 * @param {Object} serializedForm
 * @returns {String}
 */
ozpIwc.DataNode.prototype.resourceFallback = function(serializedForm) {
    if(serializedForm.key) {
       return ((serializedForm.key.charAt(0) === "/") ? "" : "/") + serializedForm.key;
    }
};
/**
 * @class IntentsInFlightNode
 * @namespace ozpIwc
 * @extends ozpIwc.ApiNode
 * @constructor
 */
ozpIwc.IntentsInFlightNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    config=config || {};

    // Take the supplied data for anything that matches in the super class,
    // such as resource.
    ozpIwc.ApiNode.apply(this, arguments);
    /**
     * @property lifespan
     * @type {ozpIwc.Lifespan.Bound}
     */
    this.lifespan = new ozpIwc.Lifespan.Bound({
        'addresses': [config.src]
    });

    if(!config.invokePacket) {
        throw new ozpIwc.BadContentError("In flight intent requires an invocation packet");
    }
    if(!Array.isArray(config.handlerChoices) || config.handlerChoices <1) {
        throw new ozpIwc.BadContentError("No handlers available");
    }
    /**
     * Extra information that isn't captured already by the base class, or that isn't captured adequately.
     *
     * @property entity
     * @type {Object}
     */
    this.entity = {
        'intent': {
            'type': config.type,
            'action': config.action
        },
        'invokePacket': config.invokePacket,
        'contentType': config.invokePacket.contentType,
        'entity': config.invokePacket.entity,
        'state': "init",
        'status': "ok",
        'handlerChoices': config.handlerChoices,
        'handler': {
            'resource': null,
            'address': null
        },
        'reply': null
    };
});

/**
 * @class IntentsInFlightNode
 * @namespace ozpIwc
 * @extends ozpIwc.ApiNode
 * @constructor
 */
ozpIwc.IntentHandlerNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    // Take the supplied data for anything that matches in the super class,
    // such as resource.
    ozpIwc.ApiNode.apply(this, arguments);
    /**
     * @property lifespan
     * @type {ozpIwc.Lifespan.Bound}
     */
    this.lifespan = new ozpIwc.Lifespan.Bound({
        'addresses': [config.src]
    });
    /**
     * @property entity
     * @type {Object}
     */
    this.entity = config.entity || {};

});

/**
 * Handles writing new data to the handler node.
 * @override
 * @method set
 * @param {Object} packet
 */
ozpIwc.IntentHandlerNode.prototype.set=function(packet) {
    var dst=packet.src;
    if(packet.entity && packet.entity.invokeIntent && packet.entity.invokeIntent.dst) {
        dst=packet.entity.invokeIntent.dst;
    }
    if(!dst) {
        ozpIwc.log.error("Handler lacks a invokeIntent.dst",packet);
        throw new ozpIwc.BadContentError("Intent handler must supply invokeIntent.dst");
    }
    
    ozpIwc.ApiNode.prototype.set.apply(this, arguments);
    this.entity.invokeIntent=this.entity.invokeIntent || {};
    this.entity.invokeIntent.dst=dst;

    //We need to know what callback to call on the client.
    this.entity.replyTo = packet.msgId;
};

/**
 * If a resource path isn't given, this takes the best guess at assigning it.
 * @override
 * @method resourceFallback
 * @param serializedForm
 * @returns String
 */
ozpIwc.IntentHandlerNode.prototype.resourceFallback = function(serializedForm) {
    switch(this.contentType){
        case "application/vnd.ozp-intents-v1+json":
            return "/" + serializedForm.intent.type + "/" + serializedForm.intent.action;
    }
};
/**
 * Persistance types for the apiNode.
 * @module bus.service.Value
 * @submodule bus.service.Value.Persistance
 */
/**
 *
 * @namespace ozpIwc.Lifespan
 */
ozpIwc.Lifespan = ozpIwc.Lifespan || {};

/**
 * A object formatter for the node's lifespan. If passed as just a string, format it to the object notation.
 * @method getLifespan
 * @static
 * @param {Object} lifespanObj
 * @param {String} lifespanObj.type
 * @returns {Object|undefined}
 */
ozpIwc.Lifespan.getLifespan = function(lifespanObj){
    if(!lifespanObj){
        return;
    }
    if(typeof lifespanObj === "string"){
        var type = lifespanObj;
        lifespanObj = {
            'type': type
        };
    }
    if(!lifespanObj.type){
        return;
    }

    lifespanObj.type = lifespanObj.type.charAt(0).toUpperCase() + lifespanObj.type.slice(1);

    return lifespanObj;
};


/**
 * Returns the lifespan functionality given the lifespan object given.
 * @method getLifespanFunctionality
 * @static
 * @param {Object} lifespanObj
 * @param {String} lifespanObj.type
 * @returns {{shouldPersist: Function, shouldDelete: Function}|*}
 */
ozpIwc.Lifespan.getLifespanFunctionality = function(lifespanObj){

    switch(lifespanObj.type){
        case "Ephemeral":
            return ozpIwc.Lifespan.ephemeralFunctionality;
        case "Persistent":
            return ozpIwc.Lifespan.persistentFunctionality;
        case "Bound":
            return ozpIwc.Lifespan.boundFunctionality;
        default:
            ozpIwc.Error("Received a malformed Lifespan, resource will be dropped: ", lifespanObj);
            break;
    }
};

/**
 * Functionality for ephemeral lifespans.
 * @method ephemeralFunctionality
 * @static
 * @type {{shouldPersist: Function, shouldDelete: Function}}
 */
ozpIwc.Lifespan.ephemeralFunctionality = {
    shouldPersist: function(){ return false; },
    shouldDelete: function(){ return false; }
};

/**
 * Functionality for persistant lifespans.
 * @method ephemeralFunctionality
 * @static
 * @type {{shouldPersist: Function, shouldDelete: Function}}
 */
ozpIwc.Lifespan.persistentFunctionality = {
    shouldPersist: function(){ return true; },
    shouldDelete: function(){ return false; }
};


/**
 * Functionality for bound lifespans.
 * @method ephemeralFunctionality
 * @static
 * @type {{shouldPersist: Function, shouldDelete: Function}}
 */
ozpIwc.Lifespan.boundFunctionality = {
    shouldPersist: function(){ return false; },
    shouldDelete: function(lifespan,address){
        var len=address.length;
        for(var i in lifespan.addresses) {
            if(!lifespan.addresses[i] || lifespan.addresses[i].substr(-len) === address) {
                return true;
            }
        }
        return false;
    }
};

/**
 * Creates a persistent lifespan object
 * @Class Persistent
 * @namespace ozpIwc.Lifespan
 * @constructor
 */
ozpIwc.Lifespan.Persistent = function(){
    this.type = "Persistent";
};

/**
 * Creates an ephemeral lifespan object
 * @Class Ephemeral
 * @namespace ozpIwc.Lifespan
 * @constructor
 */
ozpIwc.Lifespan.Ephemeral = function(){
    this.type = "Ephemeral";
};

/**
 * Creates a bound lifespan object
 * @Class Bound
 * @namespace ozpIwc.Lifespan
 * @property {Object} config
 * @property {String[]} config.addresses
 * @constructor
 *
 */
ozpIwc.Lifespan.Bound = function(config){
    config = config || {};
    this.type = "Bound";
    this.addresses = config.addresses || [];
};

/**
 * @submodule bus.service.Value
 */

/**
 * @class NamesNode
 * @namespace ozpIwc
 * @extends ozpIwc.ApiNode
 * @constructor
 */
ozpIwc.NamesNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    // Take the supplied data for anything that matches in the super class,
    // such as resource.
    ozpIwc.ApiNode.apply(this, arguments);

    /**
     * @property lifespan
     * @type {ozpIwc.Lifespan.Bound}
     */
    this.lifespan = new ozpIwc.Lifespan.Bound({
        'addresses': [config.src]
    });

    /**
     * @property entity
     * @type {Object}
     */
    this.entity = config.entity || {};

});

/**
 * @submodule bus.service.Value
 */

/**
 * @class SystemNode
 * @namespace ozpIwc
 * @extends ozpIwc.ApiNode
 * @constructor
 */
ozpIwc.SystemNode = ozpIwc.util.extend(ozpIwc.ApiNode, function(config) {
    ozpIwc.ApiNode.apply(this, arguments);
});

/**
 * If a resource path isn't given, this takes the best guess at assigning it.
 * @override
 * @method resourceFallback
 * @param serializedForm
 * @returns String
 */
ozpIwc.SystemNode.prototype.resourceFallback = function(serializedForm) {
    switch(this.contentType){
        case "application/vnd.ozp-application-v1+json":
            return "/application/" + serializedForm.id;
    }
};
/* global ozpIwc */

/**
 * @submodule bus.service.Type
 */

/**
 * The Data Api. 
 * Subclasses the {{#crossLink "ozpIwc.ApiBase"}}{{/crossLink}}.
 *
 * @class DataApi
 * @namespace ozpIwc
 * @extends ozpIwc.ApiBase
 * @constructor
 */
ozpIwc.DataApi = ozpIwc.createApi(function(config) {
    this.persistenceQueue=config.persistenceQueue || new ozpIwc.AjaxPersistenceQueue();
    this.endpoints=[
        {
            link: ozpIwc.linkRelPrefix+":user-data",
            headers: []
        }
    ];

});

/**
 * Override the default node type to be a DataNode.
 * @override
 * @method createNodeObject
 * @param {type} config
 * @returns {ozpIwc.DataNode}
 */
ozpIwc.DataApi.prototype.createNodeObject=function(config) {
    return new ozpIwc.DataNode(config);
};

// Default handlers are fine anything
ozpIwc.DataApi.useDefaultRoute(ozpIwc.ApiBase.allActions);

//============================================
// Add/Remove Child:
//============================================
/**
 * A filter for adding children nodes to the data api. assigns the parent node a pattern & sets it as a collector.
 * @method addChildFilters
 * @static
 * @returns {function[]}
 */
ozpIwc.DataApi.addChildFilters = function(){
    var childsPattern;
    var filters = ozpIwc.standardApiFilters.createAndCollectFilters(ozpIwc.DataNode);

    //Stash the child's pattern for now and create the parent.
    filters.unshift(function(packet,context,pathParams,next) {
        childsPattern = packet.pattern;
        packet.pattern = null;
        return next();
    });
    //Make sure the parent node has it's pattern set then replace the childs pattern at the end of the filter chain
    filters.push(function(packet,context,pathParams,next) {
        context.node.set({
            pattern: packet.pattern
        });
        packet.pattern = childsPattern;
        return next();
    });
    return filters;
};

ozpIwc.DataApi.declareRoute({
    action: ["addChild"],
    resource: "{resource:.*}",
    filters: ozpIwc.DataApi.addChildFilters()
}, function(packet, context, pathParams) {
    var key = this.createKey(context.node.pattern);
    packet.resource = key;
    packet.pattern =  packet.pattern || key + "/";
    var childNode = this.createNode({resource: key}, ozpIwc.DataNode);
    this.markForChange(childNode);
    childNode.set(packet);

    return {
        response: "ok",
        entity: {
            resource: childNode.resource
        }
    };
});

ozpIwc.DataApi.declareRoute({
    action: ["removeChild"],
    resource: "{resource:.*}",
    filters: ozpIwc.standardApiFilters.deleteFilters()
}, function(packet, context, pathParams) {
    if (packet.entity && packet.entity.resource) {
        packet.resource = packet.entity.resource;
        context.node = this.data[packet.resource];
        if (context.node) {
            this.markForChange(context.node);
            context.node.markAsDeleted(packet);
        }
    }
    return {response: "ok"};
});
/**
 * @submodule bus.service.Util
 */

/**
 * A Finite State Machine for in-flight intent resources. This state machine is static and manipulates the apiNodes
 * it receives given the packet context received.
 * @class InFlightIntentFSM
 * @static
 * @type {Object}
 */
ozpIwc.InFlightIntentFSM = {};
ozpIwc.InFlightIntentFSM.events=new ozpIwc.Event();
ozpIwc.InFlightIntentFSM.events.mixinOnOff(ozpIwc.InFlightIntentFSM);

//===============================================
// States.
// Called with node as scope.
//===============================================
/**
 * A collection of states in the FSM. Each state is a function that is called when a node transitions to it via
 * ozpIwc.InFlightFSM.transition.
 * Each state function is called with the node's scope.
 *
 * @property states
 * @type {Object}
 */
ozpIwc.InFlightIntentFSM.states ={};

/**
 * The initial state.
 * This state immediately determines the next state of the node based on the number of handler choices it contains.
 *
 * @method init
 * @returns {Object}
 */
ozpIwc.InFlightIntentFSM.states.init = function(){
    var choices = this.entity.handlerChoices || [];
    var nextEntity = {};

    if(choices.length === 1){
        nextEntity.handler = {
            resource: choices[0].resource,
            reason: "onlyOne"
        };
        nextEntity.state = "delivering";
        //nextEntity.handlerChosen = this.entity.handlerChoices[0];
    } else if (choices.length > 1){
        nextEntity.state = "choosing";
    } else {
        nextEntity.state = "error";
        nextEntity.error= "noChoices";
    }
    return ozpIwc.InFlightIntentFSM.transition(this,{entity: nextEntity});
};

/**
 * The error handling state.
 * This state is called when unexpected state changes and missing data occurs in the state
 * machine.
 *
 * @method error
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.error=function(entity){
    this.entity = this.entity || {};
    this.entity.reply = entity.error;
    this.entity.state = "error";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The delivering state.
 * The node is in a delivering state when it's registered handler is called to operate on the
 * intent data. The register handler will respond with "running" to signify it has received the request.
 *
 * @method delivering
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.delivering=function(entity){
    if(!entity.handler || !entity.handler.resource || !entity.handler.reason) {
        throw new ozpIwc.BadStateError("Choosing state requires a resource and reason");
    }
    this.entity.handler = entity.handler;
    this.entity.state = "delivering";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The running state.
 * The node is in a running state when the registered handler has received the request data. The
 * node will transition to the "complete" state upon receiving a response from the handler's operation.
 * @TODO currently running/complete are sent at once and no data is returned. When these states are sent the intent is handled.
 *
 * @method running
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.running=function(entity){
    if(!entity.handler || !entity.handler.address) {
        throw new ozpIwc.BadContentError("Entity lacks a 'handler.address' field");
    }
    this.entity.handler.address=entity.handler.address;
    this.entity.state = "running";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The choosing state.
 * The node is in a choosing state when:
 *  (1) the intent chooser is opened.
 *  (2) the api is gathering the preference-stored designated handler.
 *
 * The node will transition to delivering once the handler has been chosen.
 *
 * @method choosing
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.choosing=function(){
    this.entity.state = "choosing";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The Complete state.
 * Once the intent has been handled or canceled the node will transition to the complete state. From here the API
 * will mark the node for deletion as it is no longer needed.
 *
 * @method complete
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.complete=function(entity){
    this.entity.reply=entity.reply;
    this.entity.state = "complete";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};


//===============================================
//State Transitions
//===============================================
/**
 * A collection of state transitions for the Finite State machine. The first level of properties represent current state
 * and the second level represents states that can be transitioned to.
 *
 * @property stateTransitions
 * @type {Object}
 */
ozpIwc.InFlightIntentFSM.stateTransitions ={
        "init": {
            "init": ozpIwc.InFlightIntentFSM.states.init,
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "delivering" : ozpIwc.InFlightIntentFSM.states.delivering,
            "choosing": ozpIwc.InFlightIntentFSM.states.choosing
        },
        "choosing": {
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "delivering" : ozpIwc.InFlightIntentFSM.states.delivering,
            "complete": ozpIwc.InFlightIntentFSM.states.complete
        },
        "delivering": {
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "running": ozpIwc.InFlightIntentFSM.states.running,
            "complete": ozpIwc.InFlightIntentFSM.states.complete
        },
        "running": {
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "complete": ozpIwc.InFlightIntentFSM.states.complete
        },
        "complete": {},
        "error": {}
};

/**
 * The transition utility function. This determines if the requested state change from the packet is valid, then
 * calls the state transition and returns the modified node for storage.
 * @method transition
 * @param {ozpIwc.ApiNode} node
 * @param {ozpIwc.PacketContext} [packet] If not provided, FSM assumes initial state transition.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.transition = function(node,packet){
    packet = packet || {entity:{state: "init"}};
    if(!packet.entity || !packet.entity.state) {
        throw new ozpIwc.BadContentError("Entity lacks a 'state' field");
    }
    if(node.deleted){
        throw new ozpIwc.BadContentError("Already handled.");
    }
    var transist=ozpIwc.InFlightIntentFSM.stateTransitions[node.entity.state];
    if(!transist) {
        // we're in a bad state.  pretty much unrecoverable
        return ozpIwc.InFlightIntentFSM.states.error.call(node, {
            entity: {
                error: "Inflight intent is in an invalid state.  Cannot proceed.",
            }
        });
    }

    transist=transist[packet.entity.state];
    if(!transist) {
        throw new ozpIwc.BadStateError("In-flight intent cannot transition from "+
            node.entity.state+" to "+packet.entity.state);
    }

    return transist.call(node,packet.entity);
};

/**
 * Triggers node's state event and returns the node.
 * @method stateReturn
 * @param node
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.stateEvent = function(node){
    if(node.entity && node.entity.state) {
       ozpIwc.InFlightIntentFSM.events.trigger(node.entity.state,node);
    }
    return node;
};
/**
 * @submodule bus.service.Type
 */

/**
 * The Intents Api.
 * Subclasses the {{#crossLink "ozpIwc.ApiBase"}}{{/crossLink}}.
 *
 * @class IntentsApi
 * @namespace ozpIwc
 * @extends ozpIwc.ApiBase
 * @constructor
 */
ozpIwc.IntentsApi = ozpIwc.createApi(function(config) {
    /**
     * @property persistenceQueue
     * @type {ozpIwc.AjaxPersistenceQueue|*}
     */
    this.persistenceQueue = config.persistenceQueue || new ozpIwc.AjaxPersistenceQueue();

    /**
     * @property endpoints
     * @type {Object[]}
     */
    this.endpoints=[
        {
            link: ozpIwc.linkRelPrefix+":intent",
            headers: []
        }
    ];
});

ozpIwc.IntentsApi.prototype.initializeData=function(deathScream) {
    deathScream=deathScream || { watchers: {}, collectors: [], data: []};
    this.watchers=deathScream.watchers;
    this.collectors = deathScream.collectors;
    deathScream.data.forEach(function(packet) {
        if(packet.resource.indexOf("/inFlightIntent") === 0){
            packet.entity = packet.entity || {};
            packet.entity.dState = packet.entity.state;
            packet.entity.state = "deserialize";
            this.createNode({
                resource: packet.resource, invokePacket: {},
                handlerChoices:[0,1],
                state: "deserialize"
            },ozpIwc.IntentsInFlightNode).deserializeLive(packet);
        }else {
            this.createNode({resource: packet.resource}).deserializeLive(packet);
        }
    },this);

    this.updateCollections();
    if(this.endpoints) {
        var self=this;
        return Promise.all(this.endpoints.map(function(u) {
            var e=ozpIwc.endpoint(u.link) ;
            return self.loadFromEndpoint(e,u.headers).catch(function(e) {
                ozpIwc.log.error(self.logPrefix,"load from endpoint ",e," failed: ",e);
            });
        }));
    } else {
        return Promise.resolve();
    }
};

// turn on bulkGet and list for everything
ozpIwc.IntentsApi.useDefaultRoute(["bulkGet", "list"]);

//====================================================================
// Intent Invocation Endpoints
//====================================================================

ozpIwc.IntentsApi.useDefaultRoute([ "watch", "unwatch", "delete"], "/inFlightIntent/{id}");

/**
 * A handler for invoke calls. Creates an inFlight-intent node and kicks off the inflight state machine.
 *
 * @method invokeIntentHandler
 * @param {Object} packet
 * @param {String} type
 * @param {String} action
 * @param {Object[]} handlers
 * @param {String} pattern
 * @returns {Promise}
 */
ozpIwc.IntentsApi.prototype.invokeIntentHandler=function(packet,type,action,handlers,pattern) {
    var self = this;
    var inflightNode = new ozpIwc.IntentsInFlightNode({
        resource: this.createKey("/inFlightIntent/"),
        src:packet.src,
        invokePacket: packet,
        type: type,
        action: action,
        handlerChoices: handlers,
        pattern: pattern
    });
    
    this.data[inflightNode.resource] = inflightNode;
    this.addCollector(inflightNode.resource);

    this.data[inflightNode.resource] = ozpIwc.InFlightIntentFSM.transition(inflightNode);
    return this.handleInflightIntentState(inflightNode).then(function() {
        return {
            entity: {
                inFlightIntent: self.data[inflightNode.resource].toPacket()
            }
        };
    });
};

/**
 * Handles the current state of the state machine.
 * If "choosing", the intent chooser will open.
 * If "delivering", the api will send the intent to the chosen handler
 * If "complete", the api will send the intent handler's reply back to the invoker and mark the inflight intent as deleted.
 * @param {Object} inflightNode
 * @returns {*}
 */
ozpIwc.IntentsApi.prototype.handleInflightIntentState=function(inflightNode) {
    switch(inflightNode.entity.state){
        case "choosing":
            return this.handleChoosing(inflightNode);
        case "delivering":
            this.handleDelivering(inflightNode);
            break;
        case "complete":
            this.handleComplete(inflightNode);
            break;
        default:
            break;
    }
    return Promise.resolve(inflightNode);
};

/**
 * A handler for the "choosing" state of an in-flight intent node.
 * @method handleChoosing
 * @param node
 * @returns {Promise} Resolves when either a preference is gathered or the intent chooser is opened.
 */
ozpIwc.IntentsApi.prototype.handleChoosing = function(node){

    var useRegisteredChooser = function(intentNode){

        var tryChooser = function(chooser){
            var packet = ozpIwc.util.clone(chooser.entity.invokeIntent);
            packet.entity = packet.entity || {};
            packet.replyTo = chooser.entity.replyTo;
            packet.entity.inFlightIntent = intentNode.toPacket();
            packet.entity.force = (ozpIwc.util.getInternetExplorerVersion() === 11);

            return self.invokeIntentHandler(packet, '/inFlightIntent/chooser', 'choose', [chooser], '/inFlightIntent/chooser/choose/').then(function(packet){
                //This is because we are manually using the packetRouter route.
                var inFlightNode = packet.entity.inFlightIntent;
                inFlightNode.entity = inFlightNode.entity || {};

                if(inFlightNode.entity.state === "complete"){
                    return true;
                } else if(inFlightNode.entity.state === "error"){
                    throw "err";
                } else {
                    var res,rej;
                    var promise = new Promise(function(resolve,reject){
                        res = resolve;
                        rej = reject;
                    });
                    var onComplete = function(node){
                        if(node.resource === inFlightNode.resource) {
                            ozpIwc.InFlightIntentFSM.off("complete",onComplete);
                            res(true);
                        }
                    };
                    var onError = function(node){
                        if(node.resource === inFlightNode.resource) {
                            ozpIwc.InFlightIntentFSM.off("error",onError);
                            rej("err");
                        }
                    };
                    ozpIwc.InFlightIntentFSM.on("complete",onComplete);
                    ozpIwc.InFlightIntentFSM.on("error",onError);
                    return promise;
                }
            });
        };

        var itterChoosers = function(choosers){
            if(choosers.length > 0){
                return tryChooser(choosers[0]).then(function(){
                    return Promise.resolve();
                }).catch(function(err){
                    choosers.shift();
                    return itterChoosers(choosers);
                });
            } else {
                return Promise.reject("no choosers.");
            }
        };


        var registeredChoosers = self.matchingNodes('/inFlightIntent/chooser/choose/');
        return itterChoosers(registeredChoosers);
    };

    var showChooser=function(err) {
        ozpIwc.log.info("Picking chooser because",err);
        return useRegisteredChooser(node).catch(function(err){

            if(ozpIwc.util.getInternetExplorerVersion() !== 11) {
                ozpIwc.log.info("launching popup chooser because: ", err);
                ozpIwc.util.openWindow(ozpIwc.intentsChooserUri, {
                    "ozpIwc.peer": ozpIwc.BUS_ROOT,
                    "ozpIwc.intentSelection": "intents.api" + node.resource
                }, ozpIwc.INTENT_CHOOSER_FEATURES);
            } else {
                ozpIwc.log.error("Failed to handle intent choosing: Internet Explorer 11 is not supported"+
                " for the default intent chooser.");
                node = ozpIwc.InFlightIntentFSM.transition(node,{ state: "error"});
            }
        });
    };
    var self = this;
    return this.getPreference(node.entity.intent.type+"/"+node.entity.intent.action).then(function(handlerResource) {
        if(handlerResource in self.data) {
            node = ozpIwc.InFlightIntentFSM.transition(node,{
                entity: {
                    state: "delivering",
                    'handler': {
                        'resource': handlerResource,
                        'reason': "remembered"
                    }
                }
            });
            return self.handleInflightIntentState(node);
        } else {
            return showChooser();
        }
    }).catch(showChooser);
};

/**
 *  A handler for the "delivering" state of an in-flight intent node.
 *  Sends a packet to the chosen handler.
 *
 *  @TODO should resolve on response from the handler that transitions the node to "running".
 *
 * @method handleDelivering
 * @param {ozpIwc.ApiNode} node
 */
ozpIwc.IntentsApi.prototype.handleDelivering = function(node){
    var handlerNode=this.data[node.entity.handler.resource];

    var packet = ozpIwc.util.clone(handlerNode.entity.invokeIntent);
    packet.entity = packet.entity || {};
    packet.replyTo = handlerNode.entity.replyTo;
    packet.entity.inFlightIntent = node.toPacket();
    ozpIwc.log.debug(this.logPrefix+"delivering intent:",packet);
    // TODO: packet permissions
    return this.send(packet);
};

/**
 * A handler for the "complete" state of an in-flight intent node.
 * Sends notification to the invoker that the intent was handled & deletes the in-flight intent node as it is no longer
 * needed.
 *
 * @method handleComplete
 * @param {ozpIwc.ApiNode} node
 */
ozpIwc.IntentsApi.prototype.handleComplete = function(node){
    if(node.entity.invokePacket && node.entity.invokePacket.src && node.entity.reply) {
        this.send({
            dst: node.entity.invokePacket.src,
            replyTo: node.entity.invokePacket.msgId,
            contentType: node.entity.reply.contentType,
            response: "complete",
            entity: node.entity.reply.entity
        });
    }
    node.markAsDeleted();
};

ozpIwc.IntentsApi.declareRoute({
    action: "set",
    resource: "/inFlightIntent/{id}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.IntentsInFlightNode)
}, function(packet, context, pathParams) {
    context.node = ozpIwc.InFlightIntentFSM.transition(context.node,packet);
    return this.handleInflightIntentState(context.node).then(function() {
        return {response: "ok"};
    });
});

//====================================================================
// Handler endpoints
//====================================================================
ozpIwc.IntentsApi.useDefaultRoute(["get","delete", "watch", "unwatch"], "/{major}/{minor}/{action}/{handlerId}");

/**
 * A route for intent handler invocations.
 * Invokes a specific handler directly
 */
ozpIwc.IntentsApi.declareRoute({
    action: "invoke",
    resource: "/{major}/{minor}/{action}/{handlerId}",
    filters: []
}, function(packet, context, pathParams) {
    return this.invokeIntentHandler(
        packet, 
        pathParams.major+"/"+pathParams.minor,
        pathParams.action,
        [context.node]
    );
});
ozpIwc.IntentsApi.declareRoute({
    action: "set",
    resource: "/{major}/{minor}/{action}/{handlerId}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.IntentHandlerNode, "application/vnd.ozp-iwc-intent-handler-v1+json")
}, function(packet, context, pathParams) {
    context.node.set(packet);
    return {"response": "ok"};
});

//====================================================================
// Action endpoints
//====================================================================
/**
 * A route filter for creating an intent definition (/{major}/{minor}/{action}) if it does not exist.
 * @method registerDefinitionFilter
 * @param {String} nodeType
 * @param {String} contentType
 * @returns {*}
 */
ozpIwc.IntentsApi.registerDefinitionFilter = function(nodeType,contentType){
    var setDefinition = function(packet,context,pathParams,next){
        // Only set to the definition if not already set.
        if(!context.node.entity){
            context.node.set({
                entity: {
                    "type": pathParams.major + "/" + pathParams.minor,
                    "action": pathParams.action
                }
            });
        }

        this.addCollector(context.node.resource);

        return next();
    };

    var filters = ozpIwc.standardApiFilters.setFilters(nodeType,contentType);
    filters.unshift(ozpIwc.apiFilter.fixPattern());
    filters.push(setDefinition);

    return filters;
};

/**
 * A route filter for creating an intent definition node (/{major}/{minor}/{action}) if it does not exist, then creates
 * an intent handler node with the specified handlerId ({major}/{minor}/{action}/{handlerId})
 * @method registerHandlerFilter
 * @param {String} nodeType
 * @param {String} contentType
 * @returns {*}
 */
ozpIwc.IntentsApi.registerHandlerFilter = function(nodeType,contentType){
    var generateDefinitionResource = function(packet,context,pathParams,next){
        packet.resource = "/"+pathParams.major + "/" + pathParams.minor + "/" + pathParams.action;
        context.node = this.data[packet.resource];
        return next();
    };

    var generateHandlerResource = function(packet,context,pathParams,next){
        packet.resource = "/"+pathParams.major + "/" + pathParams.minor + "/" + pathParams.action + "/" +
            pathParams.handlerId;
        context.node = this.data[packet.resource];
        return next();
    };

    var definitionFilter = ozpIwc.IntentsApi.registerDefinitionFilter(null, "application/vnd.ozp-iwc-intent-handler-v1+json");
    definitionFilter.unshift(generateDefinitionResource);

    var handlerFilter = ozpIwc.standardApiFilters.setFilters(nodeType,contentType);
    handlerFilter.unshift(generateHandlerResource);

    // Concat the two filters together, run through the definition then the handler.
    definitionFilter.push.apply(definitionFilter,handlerFilter);

    return definitionFilter;
};

/**
 * Registration handler when a handlerId is not specified
 */
ozpIwc.IntentsApi.declareRoute({
    action: "register",
    resource: "/{major}/{minor}/{action}",
    filters: ozpIwc.IntentsApi.registerDefinitionFilter(null, "application/vnd.ozp-iwc-intent-handler-v1+json")
}, function(packet, context, pathParams) {

    var childNode = this.createNode({
        'resource': this.createKey(context.node.resource + "/"),
        'src': packet.src
    }, ozpIwc.IntentHandlerNode);
    childNode.set(packet);

    ozpIwc.log.debug(this.logPrefix+" registered ",context.node);
    return {
        'response': 'ok',
        'entity': {
            'resource': childNode.resource
        }
    };
});

/**
 * Registration handler when a handlerId is specified
 */
ozpIwc.IntentsApi.declareRoute({
    action: "register",
    resource: "/{major}/{minor}/{action}/{handlerId}",
    filters: ozpIwc.IntentsApi.registerHandlerFilter(null, "application/vnd.ozp-iwc-intent-handler-v1+json")
}, function(packet, context, pathParams) {
    context.node.set(packet);

    ozpIwc.log.debug(this.logPrefix+" registered ",context.node);
    return {
        'response': 'ok',
        'entity': {
            'resource': context.node.resource
        }
    };
});

/**
 * A route for intent action invocations.
 * Will launch direct for user input if multiple options.
 */
ozpIwc.IntentsApi.declareRoute({
    action: "invoke",
    resource: "/{major}/{minor}/{action}",
    filters: ozpIwc.standardApiFilters.getFilters()
}, function(packet, context, pathParams) {
    return this.invokeIntentHandler(
        packet, 
        pathParams.major+"/"+pathParams.minor,
        pathParams.action,
        this.matchingNodes(context.node.pattern),
        context.node.pattern
    );
});

/**
 * A route for the following actions not handled by other routes: bulkGet, list, delete, watch, and unwatch.
 * Default route used.
 */
ozpIwc.IntentsApi.useDefaultRoute(["delete", "watch", "unwatch", "get"],"/{major}/{minor}/{action}");

//====================================================================
// Content Type endpoints
//====================================================================
ozpIwc.IntentsApi.declareRoute({
    action: ["set", "delete"],
    resource: "/{major}/{minor}",
    filters: []
}, function(packet, context, pathParams) {
    throw new ozpIwc.NoPermissionError(packet);
});

ozpIwc.IntentsApi.declareRoute({
    action: "get",
    resource: "/{major}/{minor}",
    filters: []
}, function(packet, context, pathParams) {
    if (context.node) {
        // the following needs to be included, possibly via override of toPacket();
        //'invokeIntent': childNode
        return context.node.toPacket();
    } else {
        return {
            response: "ok",
            entity: {
                "type": pathParams.major + "/" + pathParams.minor,
                "actions": this.matchingNodes(packet.resource).map(function(n) {
                    return n.entity.action;
                })
            }
        };
    }
});


ozpIwc.IntentsApi.declareRoute({
    action: "broadcast",
    resource: "/{major}/{minor}/{action}",
    filters: ozpIwc.standardApiFilters.getFilters()
}, function(packet, context, pathParams) {
    for(var i  in context.node.collection) {
        this.invokeIntentHandler(
            packet,
            pathParams.major + "/" + pathParams.minor,
            pathParams.action,
            this.matchingNodes(context.node.collection[i]),
            context.node.collection[i]
        );
    }

    return {
        response: "ok",
        entity: {
            handlers: context.node.collection
        }
    };
});


/**
 * @submodule bus.service.Type
 */

/**
 * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the IWC.
 * Subclasses the {{#crossLink "ozpIwc.ApiBase"}}{{/crossLink}}.
 *
 * @class NamesApi
 * @namespace ozpIwc
 * @extends ozpIwc.ApiBase
 * @constructor
 */
ozpIwc.NamesApi = ozpIwc.createApi(function(config) {
    for(var key in ozpIwc.apiMap){
        var api = ozpIwc.apiMap[key];
        var resourceName='/api/' + api.address;
        this.data[resourceName]=new ozpIwc.ApiNode({
            resource: resourceName,
            entity: {'actions': api.actions},
            contentType: 'application/vnd.ozp-iwc-api-v1+json'
        });
    }
    var self=this;
    this.on("addressDisconnects",function(address) {
        var len=address.length;
        ozpIwc.object.eachEntry(self.data,function(k,v) {
            if(k.substr(-len) === address) {
                self.markForChange(v);
                v.markAsDeleted();
            }
        });
    });
    this.leaderPromise.then(function(){
        window.setInterval(function(){self.checkForNonresponsives();},ozpIwc.heartBeatFrequency);
    });
});

/**
 * Cycles through all /address/{address} resources and disconnects them from the bus if they have not responded in the
 * last 2 heartbeats.
 *
 * @method checkForNonresponsives
 */
ozpIwc.NamesApi.prototype.checkForNonresponsives=function(){
    var self = this;
    this.matchingNodes("/address").forEach(function(node) {
        var delta = ozpIwc.util.now() - node.entity.time;

        if(delta > 3*ozpIwc.heartBeatFrequency) {
            console.log("["+node.resource+"] [Removing] Time since update:", ozpIwc.util.now() - node.entity.time);
            self.participant.send({
                "dst": "$bus.multicast",
                "action": "disconnect",
                "entity": node.entity
            });
            node.markAsDeleted();
        }
    });
};

// Default handlers are fine for list, bulkGet, watch, and unwatch with any properly formed resource
ozpIwc.NamesApi.useDefaultRoute(["list","bulkGet"],"{c:/}");
ozpIwc.NamesApi.useDefaultRoute(["list","bulkGet"],"{c:/(?:api|address|multicast|router).*}");

//====================================================================
// Address, Multicast, and Router endpoints
//====================================================================
ozpIwc.NamesApi.declareRoute({
    action: ["set","delete"],
    resource: "/{collection:api|address|multicast|router}",
    filters: []
}, function(packet,context,pathParams) {
    throw new ozpIwc.NoPermissionError(packet);    
});
ozpIwc.NamesApi.declareRoute({
    action: "get",
    resource: "/{collection:api|address|multicast|router}",
    filters: []
}, function(packet,context,pathParams) {
    return {
        "contentType": "application/json",
        "entity": this.matchingNodes(packet.resource).map(function(node) {
            return node.resource;
        })
    };
});

//====================================================================
// API endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/api/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/api/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.ApiNode,"application/vnd.ozp-iwc-api-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    context.node.set(packet);
    return {response:"ok"};
});

//====================================================================
// Address endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/address/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/address/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.NamesNode,"application/vnd.ozp-iwc-address-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address

    context.node.set(packet);
    return {response:"ok"};
});

//====================================================================
// Multicast endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/multicast/{group}");
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/multicast/{group}/{memberAddr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/multicast/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.ApiNode,"application/vnd.ozp-iwc-multicast-address-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    
    //
    context.node.set(packet);
    return {response:"ok"};
});
ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/multicast/{group}/{member}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.NamesNode,"application/vnd.ozp-iwc-multicast-address-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    
    //
    context.node.set(packet);
    return {response:"ok"};
});

//====================================================================
// Router endpoints
//====================================================================
ozpIwc.NamesApi.useDefaultRoute(["get","delete","watch","unwatch"],"/router/{addr}");

ozpIwc.NamesApi.declareRoute({
    action: "set",
    resource: "/router/{addr}",
    filters: ozpIwc.standardApiFilters.setFilters(ozpIwc.NamesNode,"application/vnd.ozp-iwc-router-v1+json")
}, function(packet,context,pathParams) {
    // validate that the entity is an address
    
    //
    context.node.set(packet);
    return {response:"ok"};
});
/**
 * @submodule bus.service.Type
 */

/**
 * The System Api. Provides reference data of registered applications, versions, and information about the current user
 * through the IWC. Subclasses the {{#crossLink "ozpIwc.ApiBase"}}{{/crossLink}}.
 *
 * @class NamesApi
 * @namespace ozpIwc
 * @extends ozpIwc.ApiBase
 * @constructor
 */
ozpIwc.SystemApi = ozpIwc.createApi(function(config) {
    // The stock initializeData should do fine for us here as we're not using
    // any special subclasses for these items.  Might have to revisit this at
    // some point.
    /**
     * @property endpoints
     * @type {Object[]}
     */
    this.endpoints = [
        {
            link: ozpIwc.linkRelPrefix + ":application",
            headers: [{name: "Accept", value: "application/vnd.ozp-application-v1+json"}]
        },
        {
            link: ozpIwc.linkRelPrefix + ":user",
            headers: []
        },
        {
            link: ozpIwc.linkRelPrefix + ":system",
            headers: []
        }
    ];
    var self=this;
    this.on("createdNode",this.updateIntents,this);

    this.leaderPromise.then(function() {
        ozpIwc.log.debug("System.api registering for the launch intent");
        var registerData = {
            'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
            'entity': {
                'type': "application/vnd.ozp-iwc-launch-data-v1+json",
                'action': "run",
                'label': "Open in new tab",
                'invokeIntent': {
                    'dst': "system.api",
                    'action' : 'invoke',
                    'resource' : "/launchNewWindow"
                }
            }
        };
        return self.participant.intents().register("/application/vnd.ozp-iwc-launch-data-v1+json/run/system.api",
            registerData).catch(function(error) {
                ozpIwc.log.error("System.api failed to register for launch intent: ",error);
            });
    });
});

/**
 * Updates intents API registrations for the given system api application.
 * @method updateIntents
 * @param {Object} node
 * @returns {Promise}
 */
ozpIwc.SystemApi.prototype.updateIntents=function(node) {
    if(!node.entity || !node.entity.intents) {
        return;
    }
    var packets = [];

    // build out the messages for intent registrations but don't send, we are sending in bulk.
    node.entity.intents.forEach(function(i) {
        var icon = i.icon || (node.entity && node.entity.icons && node.entity.icons.small) ? node.entity.icons.small : '';
        var label = i.label || node.entity.name;
        var resource =  "/"+i.type+"/"+i.action+"/system.api"+node.resource.replace(/\//g,'.');
        var payload ={
            'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
            'entity': {
            'type': i.type,
                'action': i.action,
                'icon': icon,
                'label': label,
                '_links': node.entity._links,
                'invokeIntent': {
                'action' : 'launch',
                    'resource' : node.resource
                }
            }
        };

        packets.push(this.participant.intents().messageBuilder.set(resource,payload));
    },this);

    //Send out all intent messages in bulk
    return this.participant.intents().bulkSend(packets).then(function(response){
        // After getting the ok on the bulk message, wait for each individual message to resolve
        return Promise.all(packets);
    });

};

//====================================================================
// Collection endpoints
//====================================================================
ozpIwc.SystemApi.useDefaultRoute(["bulkGet","list"]);
ozpIwc.SystemApi.declareRoute({
    action: "get",
    resource: "/{collection:user|application|system}",
    filters: []
}, function(packet,context,pathParams) {
    return {
        "contentType": "application/json",
        "entity": this.matchingNodes(packet.resource).map(function(node) {
            return node.resource;
         })
    };
});

//====================================================================
// User endpoints
//====================================================================
ozpIwc.SystemApi.useDefaultRoute(["get","watch","unwatch"],"/user");
ozpIwc.SystemApi.declareRoute({
    action: ["set", "delete"],
    resource: "/user",
    filters: []
}, function(packet, context, pathParams) {
    throw new ozpIwc.BadActionError(packet);
});

//====================================================================
// System endpoints
//====================================================================
ozpIwc.SystemApi.useDefaultRoute(["get","watch","unwatch"],"/system");

ozpIwc.SystemApi.declareRoute({
    action: ["set", "delete"],
    resource: "/system",
    filters: []
}, function(packet, context, pathParams) {
    throw new ozpIwc.BadActionError(packet);
});

//====================================================================
// Application Endpoints
//====================================================================
ozpIwc.SystemApi.useDefaultRoute(["get","watch","unwatch"],"/application/{id}");
ozpIwc.SystemApi.declareRoute({
    action: ["set", "delete"],
    resource: "/application/{id}",
    filters: []
}, function(packet, context, pathParams) {
    throw new ozpIwc.BadActionError(packet);
});
ozpIwc.SystemApi.declareRoute({
    action: ["launch"],
    resource: "/application/{id}",
    filters: ozpIwc.standardApiFilters.getFilters()
}, function(packet, context, pathParams) {
    ozpIwc.log.debug(this.logPrefix+" launching ",packet.entity);
    this.participant.send({
        dst: "intents.api",
        contentType: "application/vnd.ozp-iwc-intent-handler-v1+json",
        action: "invoke",
        resource: "/application/vnd.ozp-iwc-launch-data-v1+json/run",
        entity: {
            "url": context.node.entity.launchUrls.default,
            "applicationId": context.node.resource,
            "launchData": packet.entity,
            "id": context.node.entity.id
        }
    });
    return {response: "ok"};
});

ozpIwc.SystemApi.declareRoute({
    action: ["invoke"],
    resource: "/launchNewWindow",
    filters: []
}, function(packet,context,pathParams) {
    ozpIwc.log.debug(this.logPrefix+" handling launchdata ",packet.entity);
    if(packet.entity && packet.entity.inFlightIntent){
        ozpIwc.util.openWindow(packet.entity.inFlightIntent.entity.entity.url,{
            "ozpIwc.peer":ozpIwc.BUS_ROOT,
            "ozpIwc.inFlightIntent":packet.entity.inFlightIntent
        });
        return {'response': "ok"};
    } else{
        return {'response': "badResource"};
    }

});

/**
 * Override the default node type to be a SystemNode.
 * @override
 * @method createNodeObject
 * @param {type} config
 * @returns {ozpIwc.SystemNode}
 */
ozpIwc.SystemApi.prototype.createNodeObject=function(config) {
    return new ozpIwc.SystemNode(config);
};

var ozpIwc=ozpIwc || {};
ozpIwc.version = "1.0.10";
ozpIwc.log.threshold = 6;
ozpIwc.legacySupport = true;
ozpIwc.ELECTION_TIMEOUT = 3000;
ozpIwc.heartBeatFrequency = 20000; // 3 seconds
ozpIwc.apiRootUrl = ozpIwc.apiRootUrl || "/";
ozpIwc.policyRootUrl = ozpIwc.policyRootUrl || "/policy";
ozpIwc.basicAuthUsername= ozpIwc.basicAuthUsername || '';
ozpIwc.basicAuthPassword= ozpIwc.basicAuthPassword || '';
ozpIwc.linkRelPrefix = ozpIwc.linkRelPrefix || "ozp";

ozpIwc.intentsChooserUri = "intentsChooser.html";

(function() {
	var params=ozpIwc.util.parseQueryParams();
	if(params.log) {
		try{
			console.log("Setting log level to ",params.log);
			ozpIwc.log.setThreshold(ozpIwc.log[params.log.toUpperCase()]);
		}catch(e) {
			// just ignore it and leave the default level
		}
	}
})();

ozpIwc._busInit = function(){};
ozpIwc.authorization = new ozpIwc.policyAuth.PDP({
    'pip': new ozpIwc.policyAuth.PIP(),
    'prp': new ozpIwc.policyAuth.PRP(),
    'setsEndpoint': ozpIwc.policyRootUrl
});
var enablePostMessageParticipants = function(){};

if (typeof ozpIwc.enableDefault === "undefined" || ozpIwc.enableDefault) {
    ozpIwc.initEndpoints(ozpIwc.apiRootUrl || "api");
    ozpIwc.defaultPeer = new ozpIwc.Peer();
    ozpIwc.defaultLocalStorageLink = new ozpIwc.KeyBroadcastLocalStorageLink({
        peer: ozpIwc.defaultPeer
    });

    ozpIwc.defaultRouter = new ozpIwc.Router({
        peer: ozpIwc.defaultPeer,
        heartbeatFrequency: ozpIwc.heartBeatFrequency
    });

    if (typeof ozpIwc.acceptPostMessageParticipants === "undefined" ||ozpIwc.acceptPostMessageParticipants) {
        ozpIwc.defaultPostMessageParticipantListener = new ozpIwc.PostMessageParticipantListener({
            router: ozpIwc.defaultRouter,
            ready: new Promise(function(resolve){
                enablePostMessageParticipants = resolve;
            })
        });
    }

    ozpIwc._busInit = function() {
        if (typeof ozpIwc.runApis === "undefined" || ozpIwc.runApis) {
            ozpIwc.locksApi = new ozpIwc.LocksApi({'name': "locks.api"});
            ozpIwc.namesApi = new ozpIwc.NamesApi({'name': "names.api"});
            ozpIwc.dataApi = new ozpIwc.DataApi({'name': "data.api"});
            ozpIwc.intentsApi = new ozpIwc.IntentsApi({'name': "intents.api"});
            ozpIwc.systemApi = new ozpIwc.SystemApi({'name': "system.api"});
        }
        enablePostMessageParticipants();
    };
}


ozpIwc.util.prerender().then(ozpIwc._busInit);

//# sourceMappingURL=ozpIwc-bus.js.map
//Return the ozpIwc object
return ozpIwc;
});