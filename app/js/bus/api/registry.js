var ozpIwc=ozpIwc || {};

ozpIwc.Registry=function(config) {
    var apiRoot=config.apiRoot || 'api';
    var self=this;
    self.endPoints={};
    ozpIwc.util.ajax({
        href: apiRoot,
        method: 'GET'
    })
        .success(function(data) {
            for (var ep in data._links) {
                if (ep !== 'self') {
                    self.endPoints[ep]=data._links[ep];
                }
            }
        })
        .failure(function(error) {
            console.log("AJAX load failure for " + apiRoot + ": " + error);
        });
}

ozpIwc.Registry.prototype.endPoint=function(name) {
    if (name in self.endPoints) {
        return makeWrapper(name);
    }
    return null;
};

var makeWrapper=function(name) {
    var wrapper={};
    wrapper.name=name;
    wrapper.get=function(resource) {

    };
    wrapper.save=function(resouce,value) {

    };
    return wrapper;
}