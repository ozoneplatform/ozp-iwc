/**
 * @class NamesApiValue
 * @module api
 * @submodule api.Value
 * @extends CommonApiValue
 *
 * @type {Function|*}
 */
ozpIwc.NamesApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    if(!config || !config.allowedContentTypes) {
        throw new Error("NamesAPIValue must be configured with allowedContentTypes.");
    }
	ozpIwc.CommonApiValue.apply(this,arguments);
});
