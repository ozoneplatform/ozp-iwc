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
 * @TODO (Describe ApiError)
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

ozpIwc.ApiError.subclass=function(response) {
    return ozpIwc.util.extend(ozpIwc.ApiError,function(message) {
        ozpIwc.ApiError.call(this,response,message);
        this.name=response+"Error";
    });
};

ozpIwc.BadActionError=ozpIwc.ApiError.subclass("badAction");
ozpIwc.BadResourceError=ozpIwc.ApiError.subclass("badResource");
ozpIwc.BadRequestError=ozpIwc.ApiError.subclass("badRequest");
ozpIwc.BadContentError=ozpIwc.ApiError.subclass("badContent");

ozpIwc.NoActionError=ozpIwc.ApiError.subclass("noAction");
ozpIwc.NoResourceError=ozpIwc.ApiError.subclass("noResource");
ozpIwc.NoMatchError=ozpIwc.ApiError.subclass("noMatch");
ozpIwc.NoPermissionError=ozpIwc.ApiError.subclass("noPermission");

