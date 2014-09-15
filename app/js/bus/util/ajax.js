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
 * 
 * @returns {Promise}
 */
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
