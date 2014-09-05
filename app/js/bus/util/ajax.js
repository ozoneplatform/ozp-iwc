/** @namespace */
var ozpIwc=ozpIwc || {};

/** @namespace */
ozpIwc.util=ozpIwc.util || {};

ozpIwc.util.ajax = function (config) {
    return new Promise(function(resolve,reject) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState !== 4) {
                return;
            }

            if (request.status === 200) {
                resolve(JSON.parse(this.responseText));
            } else {
                reject(this);
            }
        };
        request.open(config.method, config.href, true);

        if(config.method === "POST") {
            request.send(config.data);
        }
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Cache-Control", "no-cache");
        request.send();
    });
};
