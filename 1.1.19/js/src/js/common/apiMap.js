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
<<<<<<< HEAD
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "addChild", "removeChild"]
=======
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "addChild", "removeChild"]
>>>>>>> gh-pages
    },

    /**
     * @property intents.api
     * @type Object
     */
    "intents.api": {
        'address': 'intents.api',
<<<<<<< HEAD
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "register", "invoke", "broadcast"]
=======
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "register", "invoke", "broadcast"]
>>>>>>> gh-pages
    },

    /**
     * @property names.api
     * @type Object
     */
    "names.api": {
        'address': 'names.api',
<<<<<<< HEAD
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet"]
=======
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect"]
>>>>>>> gh-pages
    },

    /**
     * @property system.api
     * @type Object
     */
    "system.api": {
        'address': 'system.api',
<<<<<<< HEAD
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "launch"]
=======
        'actions': ["get", "set", "delete", "watch", "unwatch", "list", "bulkGet", "collect", "launch"]
>>>>>>> gh-pages
    },

    /**
     * @property locks.api
     * @type Object
     */
    "locks.api": {
        'address': 'locks.api',
<<<<<<< HEAD
        'actions': ["get", "watch", "unwatch", "list", "lock", "unlock"]
    }
};
=======
        'actions': ["get", "watch", "unwatch", "list", "lock", "unlock", "collect", "bulkGet"]
    }
};
>>>>>>> gh-pages
