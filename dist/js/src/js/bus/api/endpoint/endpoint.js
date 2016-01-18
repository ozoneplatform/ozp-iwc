var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */

ozpIwc.api.Endpoint = (function (util) {
    /**
     * @class Endpoint
     * @namespace ozpIwc.api
     * @param {ozpIwc.api.EndpointRegistry} endpointRegistry Endpoint name
     * @constructor
     */
    var Endpoint = function (endpointRegistry) {

        /**
         * @property endpointRegistry
         * @type ozpIwc.api.EndpointRegistry
         */
        this.endpointRegistry = endpointRegistry;
        this.ajaxQueue = endpointRegistry.ajaxQueue;
    };


    //----------------------------------------
    // Content Type formatting helpers
    //----------------------------------------
    /**
     * removes whitespace of the given content-type.
     * @method trimWhiteSpace
     * @private
     * @tatic
     * @param ct
     * @returns {*}
     */
    var trimWhiteSpace = function (ct) {
        return ct.replace(/ /g, '');
    };

    /**
     * Sets the template content-type as the preferred content type in the Accept header.
     * Returns formatted header array.
     * @method preferContentType
     * @private
     * @static
     * @param contentType
     * @param endpoint
     * @param headers
     * @returns {*}
     */
    var preferContentType = function (contentType, endpoint, headers) {
        contentType = contentType.replace(/ /g, '');

        if (headers.length === 0) {
            //Also add this endpoint's content type as we want to accept lists of lists of resources.
            headers.push({'name': "Accept", 'value': contentType});
        } else {
            var filterCt = function (ct) {
                return (ct.replace(/ /g, '') !== contentType);
            };
            for (var i in headers) {
                if (headers[i].name === "Accept") {
                    if (headers[i].value) {
                        var arr = headers[i].value.split(',').map(trimWhiteSpace);

                        var filtered = arr.filter(filterCt);
                        filtered.unshift(contentType);

                        headers[i].value = filtered.join(',');
                    } else {
                        headers[i].value = contentType;
                    }
                }
            }
        }
        return headers;
    };

    /**
     * Appends the endpoint type if it exists and not already in the Accept header.
     * Returns formatted header array.
     * @method appendEndpointType
     * @private
     * @static
     * @param endpoint
     * @param headers
     * @returns {Array}
     */
    var appendEndpointType = function (endpoint, headers) {
        if (headers.length === 0) {
            headers.push({'name': "Accept", 'value': endpoint.type});
        } else {
            for (var i in headers) {
                if (headers[i].name === "Accept") {
                    if (headers[i].value) {
                        var arr = headers[i].value.split(',').map(trimWhiteSpace);

                        if (arr.indexOf(endpoint.type) === -1) {
                            arr.push(endpoint.type);
                        }
                        headers[i].value = arr.join(',');
                    } else {
                        headers[i].value = endpoint.type;
                    }
                }
            }
        }
        return headers;
    };

    /**
     * Returns necessary Accept headers for a given endpoint path. Mixes accept header of the path with any supplied
     * Accept headers.
     *
     * @method templateContentType
     * @static
     * @private
     * @param {Endpoint} endpoint
     * @param {String} path
     * @param {Array} headers
     * @returns {Array}
     */
    var templateContentType = function (endpoint, path, headers) {
        headers = headers || [];
        var contentType = endpoint.findContentType(path);

        if (contentType) {
            headers = preferContentType(contentType, endpoint, headers);
        }
        if (endpoint.type) {
            headers = appendEndpointType(endpoint, headers);
        }
        return headers;
    };

    /**
     * Performs an AJAX request of GET for specified resource href.
     *
     * @method get
     * @param {String} resource
     * @param [Object] requestHeaders
     * @param {String} requestHeaders.name
     * @param {String} requestHeaders.value
     *
     * @return {Promise}
     */
    Endpoint.prototype.get = function (resource, requestHeaders) {
        var self = this;
        resource = resource || '';
        return this.endpointRegistry.loadPromise.then(function () {
            //If a template states the content type to gather let it be enforced

            var templateHeaders = templateContentType(self, resource, requestHeaders);

            if (!self.endpointRegistry.loaded) {
                throw Error("Endpoint " + self.endpointRegistry.apiRoot + " could not be reached. Skipping GET of " + resource);
            }

            if (resource === '/' || resource === '') {
                resource = self.baseUrl;
            }
            if (!resource) {
                return Promise.reject("no url assigned to endpoint " + self.name);
            }
            return self.ajaxQueue.queueAjax({
                href: resource,
                method: 'GET',
                headers: templateHeaders
            });
        });
    };

    /**
     *
     * Performs an AJAX request of PUT for specified resource href.
     *
     * @method put
     * @param {String} resource
     * @param {Object} data\
     * @param [Object] requestHeaders
     * @param {String} requestHeaders.name
     * @param {String} requestHeaders.value
     *
     * @return {Promise}
     */
    Endpoint.prototype.put = function (resource, data, requestHeaders) {
        var self = this;

        return this.endpointRegistry.loadPromise.then(function () {


            if (resource.indexOf(self.baseUrl) !== 0) {
                resource = self.baseUrl + resource;
            }

            return self.ajaxQueue.queueAjax({
                href: resource,
                method: 'PUT',
                data: data,
                headers: requestHeaders
            });
        });
    };

    /**
     *
     * Performs an AJAX request of DELETE for specified resource href.
     *
     * @method put
     * @param {String} resource
     * @param [Object] requestHeaders
     * @param {String} requestHeaders.name
     * @param {String} requestHeaders.value
     *
     * @return {Promise}
     */
    Endpoint.prototype.delete = function (resource, data, requestHeaders) {
        var self = this;

        return this.endpointRegistry.loadPromise.then(function () {

            if (!self.baseUrl) {
                throw Error("The server did not define a relation of type " + this.name + " for retrivieving " + resource);
            }
            if (resource.indexOf(self.baseUrl) !== 0) {
                resource = self.baseUrl + resource;
            }
            return self.ajaxQueue.queueAjax({
                href: resource,
                method: 'DELETE',
                headers: requestHeaders
            });
        });
    };

    /**
     * Sends AJAX requests to PUT the specified nodes into the endpoint.
     * @todo PUTs each node individually. Currently sends to a fixed api point switch to using the node.self endpoint
     * @todo    and remove fixed resource
     * @method saveNodes
     * @param {ozpIwc.CommonApiValue[]} nodes
     */
    Endpoint.prototype.saveNodes = function (nodes) {
        var resource = "/data";
        for (var node in nodes) {
            var nodejson = JSON.stringify(nodes[node]);
            this.put((nodes[node].self || resource), nodejson);
        }
    };

    /**
     * Checks the path against the endpoint templates to see if an enforced content type exists. Returns
     * the content type if a match is found.
     * @method findContentType
     * @param {String} path
     * @returns {String}
     */
    Endpoint.prototype.findContentType = function (path) {
        for (var i in this.endpointRegistry.template) {
            var check = this.endpointRegistry.template[i].isMatch(path) ||
                this.endpointRegistry.template[i].isMatch(path.substring(path.indexOf(ozpIwc.config.apiRootUrl)));
            if (check) {
                return this.endpointRegistry.template[i].type;
            }
        }
    };

    return Endpoint;
}(ozpIwc.util));