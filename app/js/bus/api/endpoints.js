var ozpIwc=ozpIwc || {};

/**
 * @class Endpoint
 * @namespace ozpIwc
 * @param endpointRegistry Endpoint name
 * @constructor
 */
ozpIwc.Endpoint=function(endpointRegistry) {
	var config={};
	config.apiRoot=endpointRegistry;
    this.endpointRegistry=new ozpIwc.EndpointRegistry(config);
};

/**
 * @method get
 * @param resource
 * @returns {*}
 */
ozpIwc.Endpoint.prototype.get=function(resource) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if(resource.indexOf(self.baseUrl)!==0) {
            resource=self.baseUrl + resource;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'GET'
        });
    });
};

ozpIwc.Endpoint.prototype.put=function(resource, data) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if(resource.indexOf(self.baseUrl)!==0) {
            resource=self.baseUrl + resource;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'PUT',
			data: data
        });
    });
};

/**
 * @class EndpointRegistry
 * @namespace ozpIwc
 * @constructor
 *
 * @param {Object} config
 * @param {String} config.apiRoot the root of the api path.
 */
ozpIwc.EndpointRegistry=function(config) {
    config=config || {};
    var apiRoot=config.apiRoot || 'api';
    this.endPoints={};
    var self=this;
    this.loadPromise=ozpIwc.util.ajax({
        href: apiRoot,
        method: 'GET'
    }).then(function(data) {
        for (var ep in data._links) {
            if (ep !== 'self') {
                var link=data._links[ep].href;
                if(link.charAt(link.length-1) !== "/") {
                    link += "/";
                }
                self.endpoint(ep).baseUrl=link;
            }
        }
    });
};

/**
 * Finds or creates an input with the given name.
 *
 * @method endpoint
 * @param {String} name
 * @returns {ozpIwc.Endpoint}
 */
ozpIwc.EndpointRegistry.prototype.endpoint=function(name) {
    var endpoint=this.endPoints[name];
    if(!endpoint) {
        endpoint=this.endPoints[name]=new ozpIwc.Endpoint(this);
    }
    return endpoint;
};

/**
 * Initializes the Endpoint Registry with the api root path.
 *
 * @method initEndpoints
 * @param {String} apiRoot
 */
ozpIwc.initEndpoints=function(apiRoot) {
    var registry=new ozpIwc.EndpointRegistry({'apiRoot':apiRoot});
    ozpIwc.endpoint=function(name) {
        return registry.endpoint(name);
    };
};

ozpIwc.Endpoint.prototype.saveNodes=function(nodes) {
	// PUT each node individually
	// Currently, send to a fixed api point
	// Soon, switch to using the node.self endpoint and remove fixed resource
	var resource = "/data";
	for (node in nodes) {
		var tosend = JSON.stringify(nodes[node]);
		put((nodes[node].self || resource), tosend);
	}
};

