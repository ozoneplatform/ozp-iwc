/** @namespace */
var sibilant=sibilant || {};

/** 
 * @type {object}
 * @property {function} log - Normal log output.
 * @property {function} error - Error output.
 */
sibilant.log=sibilant.log || {
	log: function() {
		if(window.console && typeof(window.console.log)==="function") {
			window.console.log.apply(window.console,arguments);
		}
	},
	error: function() {
		if(window.console && typeof(window.console.error)==="error") {
			window.console.error.apply(window.console,arguments);
		}
	}
};
