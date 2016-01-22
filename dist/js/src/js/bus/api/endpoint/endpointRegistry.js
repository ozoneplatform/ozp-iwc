var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
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
        if (!config.ajaxQueue) {
            throw "Endpoints require AjaxPersistenceQueue.";
        }

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
            for (var i in config.templates) {
                var template = ozpIwc.config.templates[i];
                var url = false;

                if (template.endpoint && template.pattern) {
                    var baseUrl = self.endpoint(template.endpoint).baseUrl;
                    if (baseUrl) {
                        url = baseUrl + template.pattern;
                    }
                }

                if (!url) {
                    url = template.href;
                }

                generateTemplate(self, {
                    name: i,
                    href: url,
                    type: template.type
                });
            }

            // UGLY HAX
            var dataURL = self.endpoint("ozp:user-data").baseUrl;
            if (!self.template["ozp:data-item"] && dataURL) {
                generateTemplate(self, {
                    name: "ozp:data-item",
                    href: dataURL + "/{+resource}",
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
    var generateTemplate = function (registry, config) {
        config = config || {};
        if (typeof config.href !== "string") {
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