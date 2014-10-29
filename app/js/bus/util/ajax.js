/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * Utility methods used on the IWC bus.
 * @module bus
 * @submodule bus.util
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Sends an AJAX request. A promise is returned to handle the response.
 *
 * @method ajax
 * @static
 * @param {Object} config
 * @param {String} config.method
 * @param {String} config.href
 * @param [Object] config.headers
 * @param {String} config.headers.name
 * @param {String} config.headers.value
 * @param {boolean} config.withCredentials
 *
 * @returns {Promise}
 */
ozpIwc.util.ajax = function (config) {
    return new Promise(function(resolve,reject) {
        var request = new XMLHttpRequest();
        request.withCredentials = config.withCredentials;
        request.open(config.method, config.href, true, config.user, config.password);
//        request.setRequestHeader("Content-Type", "application/json");
        if (Array.isArray(config.headers)) {
            config.headers.forEach(function(header) {
                request.setRequestHeader(header.name, header.value);
            });
        }
        //Setting username and password as params to open() per the API does not work. setting them
        //explicitly in the Authorization header works (but only for BASIC authentication)
        request.setRequestHeader("Authorization", "Basic " + btoa(config.user + ":" + config.password));

        request.onload = function () {
            try {
                resolve(JSON.parse(this.responseText));
            }
            catch (e) {
                reject(this);
            }
        };

        request.onerror = function (e) {
            reject(this);
        };

        if((config.method === "POST") || (config.method === "PUT")) {
            request.send(config.data);
        }
        else {
            request.send();
        }
    });
};
