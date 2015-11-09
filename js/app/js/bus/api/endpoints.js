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
    var trimWhiteSpace = function(ct){
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
    var preferContentType = function(contentType,endpoint,headers){
        contentType = contentType.replace(/ /g, '');

        if(headers.length === 0){
            //Also add this endpoint's content type as we want to accept lists of lists of resources.
            headers.push({ 'name': "Accept", 'value': contentType});
        } else {
            var filterCt = function(ct){
                return (ct.replace(/ /g, '') !== contentType);
            };
            for (var i in headers) {
                if (headers[i].name === "Accept") {
                    if(headers[i].value) {
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
    var appendEndpointType = function(endpoint,headers){
        if(headers.length === 0){
            headers.push({ 'name': "Accept", 'value': endpoint.type});
        }else {
            for(var i in headers){
                if (headers[i].name === "Accept") {
                    if(headers[i].value) {
                        var arr = headers[i].value.split(',').map(trimWhiteSpace);

                        if(arr.indexOf(endpoint.type) === -1){
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
    var templateContentType = function(endpoint,path,headers){
        headers = headers || [];
        var contentType = endpoint.findContentType(path);

        if(contentType) {
            headers = preferContentType(contentType,endpoint,headers);
        }
        if(endpoint.type){
            headers = appendEndpointType(endpoint,headers);
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
    Endpoint.prototype.findContentType = function(path){
        for(var i in this.endpointRegistry.template){
            var check = this.endpointRegistry.template[i].isMatch(path) ||
                this.endpointRegistry.template[i].isMatch(path.substring(path.indexOf(ozpIwc.config.apiRootUrl)));
            if(check){
                return this.endpointRegistry.template[i].type;
            }
        }
    };
    return Endpoint;
}(ozpIwc.util));


ozpIwc.api.EndpointRegistry = (function (api, log, util) {
    /**
     * @class EndpointRegistry
     * @namespace ozpIwc.api
     * @constructor
     *
     * @param {Object} config
     * @param {String} config.apiRoot the root of the api path.
     */
    var EndpointRegistry = function (config) {
        config = config || {};
        if(!config.ajaxQueue) { throw "Endpoints require AjaxPersistenceQueue.";}

        var apiRoot = config.apiRoot || '/api';

        /**
         * The root path of the specified apis
         * @property apiRoot
         * @type String
         * @default '/api'
         */
        this.apiRoot = apiRoot;


        /**
         * @property ajaxQueue
         * @type {ozpIwc.util.AjaxPersistenceQueue}
         */
        this.ajaxQueue = config.ajaxQueue;

        /**
         * The collection of api endpoints
         * @property endPoints
         * @type Object
         * @default {}
         */
        this.endPoints = {};

        /**
         * The collection of uri templates for endpoints.
         * @property template
         * @type Object
         * @default {}
         */
        this.template = {};

        var self = this;

        /**
         * An AJAX GET request fired at the creation of the Endpoint Registry to gather endpoint data.
         * @property loadPromise
         * @type Promise
         */
        this.loadPromise = this.ajaxQueue.queueAjax({
            href: apiRoot,
            method: 'GET'
        }).then(function (data) {
            self.loaded = true;
            var payload = data.response || {};
            payload._links = payload._links || {};
            payload._embedded = payload._embedded || {};

            //Generate any endpoints/templates from _links
            for (var linkEp in payload._links) {
                if (linkEp !== 'self') {
                    var link = payload._links[linkEp];
                    if (Array.isArray(payload._links[linkEp])) {
                        link = payload._links[linkEp][0].href;
                    }
                    if (link.templated) {
                        generateTemplate(self, {
                            name: linkEp,
                            type: link.type,
                            href: link.href
                        });
                    } else {
                        self.endpoint(linkEp).baseUrl = link.href;
                        self.endpoint(linkEp).type = link.type;
                    }
                }
            }

            //Generate any endpoints/templates from _embedded links
            for (var embEp in payload._embedded) {
                var embSelf = payload._embedded[embEp]._links.self;
                self.endpoint(embEp).baseUrl = embSelf.href;
                self.endpoint(embEp).type = embSelf.type;
            }

            //Generate any templates from the ozpIwc.conf.js file
            for(var i in config.templates){
                var template = ozpIwc.config.templates[i];
                var url = false;

                if(template.endpoint && template.pattern){
                    var baseUrl= self.endpoint(template.endpoint).baseUrl;
                    if(baseUrl) {
                        url = baseUrl + template.pattern;
                    }
                }

                if (!url){
                    url = template.href;
                }

                generateTemplate(self, {
                    name: i,
                    href: url,
                    type: template.type
                });
            }

            // UGLY HAX
            if (!self.template["ozp:data-item"]) {
                generateTemplate(self, {
                    name: "ozp:data-item",
                    href: self.endpoint("ozp:user-data").baseUrl + "/{+resource}",
                    type: api.data.node.Node.serializedContentType
                });
            }

            if (!self.template["ozp:application-item"]) {
                generateTemplate(self, {
                    name: "ozp:application-item",
                    href: self.endpoint().endpointRegistry.apiRoot + "/listing/{+resource}",
                    type: api.system.node.ApplicationNode.serializedContentType
                });
            }
            //END HUGLY HAX
        })['catch'](function (err) {
            log.debug(Error("Endpoint " + self.apiRoot + " " + err.statusText + ". Status: " + err.status));
            self.loaded = false;
        });
    };

    /**
     * Creates a template in the given registry given a name, href, and type.
     * @method generateTemplate
     * @private
     * @static
     * @param {EndpointRegistry} registry
     * @param {Object} config
     * @param {String} config.href
     * @param {String} config.name
     * @param {String} config.type
     */
    var generateTemplate = function(registry, config){
        config = config || {};
        if(typeof config.href !== "string"){
            return;
        }

        registry.template[config.name] = {
            href: config.href,
            type: config.type,
            isMatch: util.PacketRouter.uriTemplate(config.href)
        };
    };

    /**
     * Finds or creates an input with the given name.
     *
     * @method endpoint
     * @param {String} name
     * @return {ozpIwc.api.Endpoint}
     */
    EndpointRegistry.prototype.endpoint = function (name) {
        var endpoint = this.endPoints[name];
        if (!endpoint) {
            endpoint = this.endPoints[name] = new api.Endpoint(this);
            endpoint.name = name;
        }
        return endpoint;
    };

    return EndpointRegistry;
}(ozpIwc.api, ozpIwc.log, ozpIwc.util));