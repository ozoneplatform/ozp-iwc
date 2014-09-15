/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.util
 */

/**
 * A logging wrapper for the ozpIwc namespace
 * @class log
 * @static
 * @namespace ozpIwc
 */
ozpIwc.log=ozpIwc.log || {
    /**
     * A wrapper for log messages. Forwards to console.log if available.
     * @property log
     * @type Function
     */
	log: function() {
		if(window.console && typeof(window.console.log)==="function") {
			window.console.log.apply(window.console,arguments);
		}
	},
    /**
     * A wrapper for error messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
	error: function() {
		if(window.console && typeof(window.console.error)==="function") {
			window.console.error.apply(window.console,arguments);
		}
	}
};
