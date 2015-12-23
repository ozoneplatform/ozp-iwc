var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.error = ozpIwc.api.error || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.error
 */

ozpIwc.api.error = (function (error) {
    /**
     * Thrown when an invalid action is called on an api.
     *
     * @class BadActionError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadActionError = error.BaseError.subclass("badAction");

    /**
     * Thrown when an invalid resource is called on an api.
     *
     * @class BadResourceError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadResourceError = error.BaseError.subclass("badResource");

    /**
     * Thrown when an invalid request is made against an api.
     *
     * @class BadRequestError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadRequestError = error.BaseError.subclass("badRequest");

    /**
     * Thrown when an invalid contentType is used in a request against an api.
     *
     * @class BadContentError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadContentError = error.BaseError.subclass("badContent");

    /**
     * Thrown when the action or entity is not valid for the resource's state.
     *
     * @class BadStateError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.BadStateError = error.BaseError.subclass("badState");

    /**
     * Thrown when no action is given in a request against an api.
     *
     * @class NoActionError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.NoActionError = error.BaseError.subclass("noAction");

    /**
     * Thrown when no resource is given in a request against an api.
     *
     * @class NoResourceError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     * @static
     */
    error.NoResourceError = error.BaseError.subclass("noResource");

    /**
     * Thrown if an api request packets ifTag exists but does not match the node's version property.
     *
     * @class NoMatchError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.NoMatchError = error.BaseError.subclass("noMatch");

    /**
     * Thrown when an api request is not permitted.
     *
     * @class NoPermissionError
     * @namespace ozpIwc.api.error
     * @extends ozpIwc.api.error.BaseError
     */
    error.NoPermissionError = error.BaseError.subclass("noPermission");

    return error;
}(ozpIwc.api.error));