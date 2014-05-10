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
