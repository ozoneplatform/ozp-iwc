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
   * @param  {Object} globalScope
   * @static
   * @return {Object} reference to global scope, works in node,browser,workers.
   */
    util.globalScope = (function(){
      return this;
    })();


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
        util.globalScope.addEventListener(type, listener);
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
        util.globalScope.removeEventListener(type, listener);
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
                util.globalScope.removeEventListener(type, listener);
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
     * @param toWindow a window on which to invoke postMessage
     * @param msg the message to be sent
     * @param origin the target origin. The message will be sent only if it matches the origin of window.
     */
    util.safePostMessage = function (toWindow, msg, origin) {
        try {
            var data = msg;
            if (!util.structuredCloneSupport && typeof data !== 'string') {
                data = JSON.stringify(msg);
            }
            toWindow.postMessage(data, origin);
        } catch (e) {
            try {
                toWindow.postMessage(JSON.stringify(msg), origin);
            } catch (e) {
                ozpIwc.log.debug("Invalid call to postMessage: " + e.message);
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
     * @property {Boolean} structuredCloneSupport
     */
    util.structuredCloneSupport = (function () {
        var cloneSupport = 'postMessage' in util.globalScope;
        //If the browser doesn't support structured clones, it will call toString() on the object passed to postMessage.
        try {
            util.globalScope.postMessage({
                toString: function () {
                    cloneSupport = false;
                }
            }, "*");
        } catch (e) {
            //exception expected: objects with methods can't be cloned
            //e.DATA_CLONE_ERR will exist only for browsers with structured clone support, which can be used as an
            // additional check if needed
        }
        return cloneSupport;
    }());

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
        query = query || util.globalScope.location.search;
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
        if (util.runningInWorker) {
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

    /**
     * A utility to determine if this code is running in a HTML5 Worker. Used to decide on browser technologies
     * to use.
     * @property {Boolean} runningInWorker
     * @static
     */
    util.runningInWorker = (typeof WorkerGlobalScope !== 'undefined' &&
            this instanceof WorkerGlobalScope);

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
            util.globalScope.open(url, windowName, features);
        } catch (e) {
            //fallback for IE
            util.globalScope.open(url + "?" + windowName, null, features);
        }
    };

    /**
     * Returns a promise that will resolve after the given delay with any additional arguments passed
     * @param {Number} delay miliseconds to delay
     * @returns {Promise}
     */
    util.promiseDelay = function (delay) {
        return new Promise(function (res) {
            setTimeout(function () { res();}, delay);
        });
    };

    /**
     * Returns the specified default value if the given value is undefined. safer than "x = x || 500" because it checks
     * for being defined, rather than its truly/falsey value.

     * @method ifUndef
     * @static
     * @param {*} value
     * @param {*} defaultVal
     * @return {*}
     */
    util.ifUndef = function (value, defaultVal) {
        return (typeof value === 'undefined') ? defaultVal : value;
    };

    /**
     * IE 10 does not play well gathering location.origin.
     * 
     * @method getOrigin
     * @static
     * @return {String} The origin this script is running in
     */
    util.getOrigin = function() {
        if (!location.origin) {
          return location.protocol + "//" + location.hostname + (location.port ? ':' + location.port: '');
        }
        return location.origin;
    };
    return util;
}(ozpIwc.util || {}));
