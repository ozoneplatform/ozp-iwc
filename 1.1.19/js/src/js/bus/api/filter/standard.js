var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.filter = ozpIwc.api.filter || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.filter
 */

/**
 * Wrappers that return the list of filters for the standard actions supported by the base api.
 *
 * @class standard
 * @namespace ozpIwc.api.filter
 * @static
 */
ozpIwc.api.filter.standard = (function (filter) {
    var standard = {
        /**
         * Returns the filter collection generator for the given action.
         * @method forAction
         * @param {String} a
         * @return {Function}
         */
        forAction: function (a) {
            return standard[a + "Filters"];
        },

        /**
         * Filters for the set action.
         * @method setFilters
         * @param nodeType
         * @param contentType
         * @return {Function[]} array of filters
         */
        setFilters: function (nodeType, contentType) {
            return [
                filter.base.checkAuthorization(),
                filter.base.createResource(nodeType),
                filter.base.checkContentType(contentType),
                filter.base.checkVersion(),
                filter.base.checkCollect(),
                filter.base.markResourceAsChanged()
            ];
        },

        /**
         * Filters for the delete action.
         * @method deleteFilters
         * @return {Function[]} array of filters
         */
        deleteFilters: function () {
            return [
                filter.base.checkAuthorization(),
                filter.base.checkVersion(),
                filter.base.markResourceAsChanged()
            ];
        },

        /**
         * Filters for the get action.
         * @method getFilters
         * @return {Function[]} array of filters
         */
        getFilters: function () {
            return [
                filter.base.requireResource(),
                filter.base.checkAuthorization(),
                filter.base.checkCollect()
            ];
        },
        watchFilters: function() {
            return [
                filter.base.checkAuthorization(),
                filter.base.checkCollect()
            ];
        },
        collectFilters: function(nodeType, contentType) {
            return [
                filter.base.checkAuthorization(),
                filter.base.createResource(nodeType),
                filter.base.checkContentType(contentType),
                filter.base.checkVersion(),
                filter.base.checkCollect()
            ];
        },
        /**
         * Filters for set-like actions that need to mark the resource as a collector.
         * @method getFilters
         * @return {Function[]} array of filters
         */
        createAndCollectFilters: function (nodeType, contentType) {
            return [
                filter.base.checkAuthorization(),
                filter.base.createResource(nodeType),
                filter.base.checkCollect(),
                filter.base.checkContentType(contentType),
                filter.base.checkVersion()
            ];
        }
    };

    return standard;
}(ozpIwc.api.filter));
