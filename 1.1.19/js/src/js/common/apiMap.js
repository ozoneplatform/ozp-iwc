var ozpIwc = ozpIwc || {};

/**
 * @module ozpIwc
 */

/**
 * A Static collection of api to address/actions mapping.
 *
 * @class apiMap
 * @namespace ozpIwc
 * @static
 * @type {Object}
 */
ozpIwc.apiMap = {
    /**
     * @property data.api
     * @type Object
     */
    "data.api": {
        'address': 'data.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "addChild", "removeChild"]
    },

    /**
     * @property intents.api
     * @type Object
     */
    "intents.api": {
        'address': 'intents.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "register", "invoke", "broadcast"]
    },

    /**
     * @property names.api
     * @type Object
     */
    "names.api": {
        'address': 'names.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect"]
    },

    /**
     * @property system.api
     * @type Object
     */
    "system.api": {
        'address': 'system.api',
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "launch"]
    },

    /**
     * @property locks.api
     * @type Object
     */
    "locks.api": {
        'address': 'locks.api',
        'actions': ["get", "watch", "unwatch", "list", "lock", "unlock", "collect", "bulkGet"]
    }
};
