var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.error = ozpIwc.api.error || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.error
 */
ozpIwc.api.error.BaseError = (function (util) {
    /**
     * A base class for IWC error objects.
     *
     * @class BaseError
     * @extends Error
     * @namespace ozpIwc.api.error
     * @constructor
     *
     * @type {Function}
     * @param {String} action The action of the error.
     * @param {String} message The message corresponding to the error.
     */
    var BaseError = util.extend(Error, function (action, message) {
        Error.call(this, message);

        /**
         * The name of the error.
         * @property name
         * @type {String}
         */
        this.name = "ApiError";

        /**
         * The action of the error.
         * @property errorAction
         * @type {String}
         */
        this.errorAction = action;

        /**
         * The message corresponding to the error.
         * @property message
         * @type {String}
         */
        this.message = message;
    });

    /**
     * Stringifies the error.
     *
     * @method toString
     * @return {String}
     */
    BaseError.prototype.toString = function () {
        return this.name + ":" + JSON.stringify(this.message);
    };

    /**
     * Creates a subclass of the ApiError with the given error name prefix.
     *
     * @method subclass
     * @param response
     * @return {Function}
     */
    BaseError.subclass = function (response) {
        return util.extend(BaseError, function (message) {
            BaseError.call(this, response, message);
            this.name = response + "Error";
        });
    };

    return BaseError;

}(ozpIwc.util));
