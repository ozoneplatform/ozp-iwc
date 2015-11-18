var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */
/**
 * @class Lifespan
 * @static
 * @namespace ozpIwc
 */
ozpIwc.api.Lifespan = (function (Lifespan) {


    /**
     * A object formatter for the node's lifespan. If passed as just a string, format it to the object notation.
     * @method getLifespan
     * @static
     * @param {Object} node
     * @param {object} config
     * @return {Object|undefined}
     */
    Lifespan.getLifespan = function (node, config) {
        if (!config || !config.lifespan) {
            return;
        }
        if (typeof config.lifespan === "string") {
            var type = config.lifespan;
            config.lifespan = {
                'type': type
            };
        }
        if (!config.lifespan.type) {
            return;
        }

        var lifespanObj = config.lifespan;
        lifespanObj.type = lifespanObj.type.charAt(0).toUpperCase() + lifespanObj.type.slice(1);

        if (lifespanObj.type === "Bound") {
            if (!lifespanObj.addresses) {
                if (!config.src) {
                    return;
                }
                lifespanObj.addresses = [config.src];
            }
            if (node.lifespan && node.lifespan.type === "Bound") {
                node.lifespan.addresses = node.lifespan.addresses || [];
                node.lifespan.addresses.forEach(function (address) {
                    if (lifespanObj.addresses.indexOf(address) === -1) {
                        lifespanObj.addresses.push(address);
                    }
                });
            }
        }
        return lifespanObj;
    };


    /**
     * Returns the lifespan functionality given the lifespan object given.
     * @method getLifespanFunctionality
     * @static
     * @param {Object} lifespanObj
     * @param {String} lifespanObj.type
     * @return {{shouldPersist: Function, shouldDelete: Function}|*}
     */
    Lifespan.getLifespanFunctionality = function (lifespanObj) {

        switch (lifespanObj.type) {
            case "Ephemeral":
                return Lifespan.ephemeralFunctionality;
            case "Persistent":
                return Lifespan.persistentFunctionality;
            case "Bound":
                return Lifespan.boundFunctionality;
            default:
                throw new Error("Received a malformed Lifespan, resource will be dropped: ", lifespanObj);
        }
    };

    /**
     * Functionality for ephemeral lifespans.
     * @method ephemeralFunctionality
     * @static
     * @type {{shouldPersist: Function, shouldDelete: Function}}
     */
    Lifespan.ephemeralFunctionality = {
        shouldPersist: function () { return false; },
        shouldDelete: function () { return false; }
    };

    /**
     * Functionality for persistant lifespans.
     * @method ephemeralFunctionality
     * @static
     * @type {{shouldPersist: Function, shouldDelete: Function}}
     */
    Lifespan.persistentFunctionality = {
        shouldPersist: function () { return true; },
        shouldDelete: function () { return false; }
    };


    /**
     * Functionality for bound lifespans.
     * @method ephemeralFunctionality
     * @static
     * @type {{shouldPersist: Function, shouldDelete: Function}}
     */
    Lifespan.boundFunctionality = {
        shouldPersist: function () { return false; },
        shouldDelete: function (lifespan, address) {
            var len = address.length;
            lifespan.addresses = lifespan.addresses || [];
            lifespan.addresses = lifespan.addresses.filter(function (addr) {
                return (addr.substr(-len) !== address);
            });

            return (lifespan.addresses.length === 0);
        }
    };

    /**
     * Creates a persistent lifespan object
     * @Class Persistent
     * @namespace ozpIwc.api.Lifespan
     * @constructor
     */
    Lifespan.Persistent = function () {
        this.type = "Persistent";
    };

    /**
     * Creates an ephemeral lifespan object
     * @Class Ephemeral
     * @namespace ozpIwc.api.Lifespan
     * @constructor
     */
    Lifespan.Ephemeral = function () {
        this.type = "Ephemeral";
    };

    /**
     * Creates a bound lifespan object
     * @Class Bound
     * @namespace ozpIwc.api.Lifespan
     * @property {Object} config
     * @property {String[]} config.addresses
     * @constructor
     *
     */
    Lifespan.Bound = function (config) {
        config = config || {};
        this.type = "Bound";
        this.addresses = config.addresses || [];
    };

    return Lifespan;
}(ozpIwc.api.Lifespan || {}));