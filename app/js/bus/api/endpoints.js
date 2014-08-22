var ozpIwc=ozpIwc || {};

ozpIwc.Endpoint=function(config) {
    if(!config || !config.baseUrl) {
        throw new Error("BaseUrl is required");
    }
    this.baseUrl=config.baseUrl;
};

ozpIwc.Endpoint.prototype.get=function(resource) {
    return ozpIwc.util.ajax({
        href: this.baseUrl+resource,
        method: 'GET'
    });
};

ozpIwc.Endpoints=function(config) {
    config=config || {};
    var apiRoot=config.apiRoot || 'api';
    this.endPoints={};
    ozpIwc.util.ajax({
        href: apiRoot,
        method: 'GET'
    }).success(function(data) {
        for (var ep in data._links) {
            if (ep !== 'self') {
                this.endPoints[ep]=new ozpIwc.Endpoint({'baseUrl': data._links[ep]});
            }
        }
    },this).failure(function(error) {
        console.log("AJAX load failure for " + apiRoot + ": " + error);
    });
};

ozpIwc.Endpoints.prototype.endpoint=function(name) {
    if (name in this.endPoints) {
        return this.endPoints[name];
    }
    return null;
};