var ServerConfig = require("../ServerConfig.js");

module.exports = {
    /**
     * Formats an payload & links into hateoas form for REST compliance.
     *
     * @method hateoas
     * @param {Object} payload
     * @param {Array} links
     * @return {Object}
     */
    hateoas: function (payload, links) {
        var wrapped = {};
        wrapped._links = links || {};

        var dataType = Object.prototype.toString.call(payload);
        if (dataType === '[object Object]') {
            for (var i in payload) {
                wrapped[i] = payload[i];
            }
        } else if (dataType === '[object Array]') {
            wrapped.item = payload;
        }

        return wrapped;
    },
    /**
     * Gets the host path matching the given request.
     * @param {Object} req
     * @return {String}
     */
    getHostUrl: function (req) {
        return req.protocol + '://' + req.get('host');
    },
    /**
     * Gets the absolute path of the given request. Will append a "/" if noFSlash is false/not provided.
     * @method getFullUrl
     * @param {Object} req
     * @param {Boolean} [noFslash]
     * @return {String}
     */
    getFullUrl: function (req, noFslash) {
        var url;
        //add trailing "/" if not present
        if (!noFslash) {
            url = (req.originalUrl.slice(-1) !== "/") ? req.originalUrl + "/" : req.originalUrl;
        } else {
            url = (req.originalUrl.slice(-1) === "/") ? req.originalUrl.slice(0, -1) : req.originalUrl;
            // remove trailing "/" if present
        }
        return this.getHostUrl(req) + url;
    },
    /**
     * Used to generate listing data. Returns a static path to the server's root.
     * @method getServerPath
     * @return {string}
     */
    getServerPath: function () {
        return ServerConfig.SERVER_PROTOCOL + "://" + ServerConfig.SERVER_DOMAIN_NAME + ":" +
            ServerConfig.SERVER_PORT;
    }

};