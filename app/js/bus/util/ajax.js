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
        request.open(config.method, config.href, true);
        request.setRequestHeader("Content-Type", "application/json");

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

        if(config.method === "POST") {
            request.send(config.data);
        }
        else {
            request.send();
        }
    });
};
