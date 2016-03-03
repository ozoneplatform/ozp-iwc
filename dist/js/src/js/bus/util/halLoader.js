var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.util = ozpIwc.util || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 * @class ozpIwc.api.base.Api
 */

ozpIwc.util.halLoader = (function (api, log, util) {

    var Loader = {};


    //-----------------------------------------------
    // Public Methods
    //-----------------------------------------------

    Loader.load = function (path, headers, onResource) {
        var endpoint = api.endpoint(path);
        return loadRecurse(endpoint, "/", headers, onResource);
    };

    //-----------------------------------------------
    // Private Methods
    //-----------------------------------------------

    var loadRecurse = function (endpoint, path, headers, onResource) {

        return endpoint.get(path, headers).then(function (data) {
            data.response._embedded = data.response._embedded || {};
            data.response._links = data.response._links || {};
            data.response._links.self = data.response._links.self || {};
            data.response._links.self.type = data.response._links.self.type || data.header['Content-Type'];
            data.response._links.self.href = data.response._links.self.href || data.url;

            onResource(data.response);

            return handleEmbedded(endpoint, data.response._embedded, headers, onResource).then(function () {
                return handleLinks(endpoint, data.response._links, headers, onResource);
            });
        }).catch(function (err) {
            log.error(api.logPrefix + "[" + endpoint.name + "] [" + path + "] Failed to load: ", err.status);
        });
    };


    /**
     * Recursive HAL _embedded parser
     *
     * @method handleLinks
     * @private
     * @static
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} _embedded the _embedded object of the HAL resource
     */
    var handleEmbedded = function (endpoint, _embedded, headers, onResource) {
        var embeddedItems = util.ensureArray((_embedded && _embedded.item) || []);
        var embeddedGather = function (obj) {
            obj._links = obj._links || {};
            obj._links.self = obj._links.self || {};
            // We can only knowingly handle an embedded object if we know its type.
            if (obj._links.self.type) {
                onResource(endpoint, obj, headers);
                return handleEmbedded(endpoint, obj._embedded, headers, onResource).then(function () {
                    return handleLinks(endpoint, obj._links, headers, onResource);
                });
            } else {
                return Promise.resolve();
            }
        };
        return Promise.all(embeddedItems.map(embeddedGather));
    };


    /**
     * Recursive HAL _links parser
     *
     * @method handleLinks
     * @private
     * @static
     * @param {Api} api
     * @param {ozpIwc.api.endpoint} endpoint
     * @param {Object} _links the _links object of the HAL resource
     */
    var handleLinks = function (endpoint, _links, headers, onResource) {
        var linkedItems = util.ensureArray((_links && _links.item) || []);
        var unknownLinks = linkedItems.filter(function (link) {
            return util.object.values(api.data, function (k, node) {
                    node.self = node.self || {};
                    return node.self.href === link.href;
                }).length === 0;
        });

        var linkGather = function (obj) {
            var hdrs = headers.slice(0);
            if (obj.type) {
                hdrs.push({'name': "Accept", 'value': obj.type});
            }
            return loadRecurse(endpoint, obj.href, hdrs, onResource).catch(function (err) {
                log.info("failed to gather link: ", obj.href, " reason: ", err);
            });
        };

        if (unknownLinks.length) {
            log.info(api.logPrefix + " Processing " + unknownLinks.length + " linked items.");
        }

        return Promise.all(unknownLinks.map(linkGather));
    };

    return Loader;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));