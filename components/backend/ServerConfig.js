module.exports = {
    /**
     * Root of the server. IWC library files statically served from here.
     * @property ROOT_ROUTE
     */
    ROOT_ROUTE: "/",
    DEBUGGER_ROUTE: "/debugger",
    /**
     * Application files statically served from here.
     * @property APPLICATION_ROUTE
     */
    APPLICATION_ROUTE: "/application",

    API_ROOT_ROUTE: "/api",
    /**
     * Data Api route.
     * Relative to the API_ROOT_ROUTE.
     * @property DATA_ROUTE
     */
    DATA_ROUTE: "/data",

    /**
     * System Api Application Listing route.
     * Relative to the API_ROOT_ROUTE.
     * @property LISTING_ROUTE
     */
    LISTING_ROUTE: "/listing",

    /**
     * CORS Access-Control-Allow-Origin property.
     * @property ALLOW_ORIGIN
     */
    ALLOW_ORIGINS: ["http://localhost:13000", "http://localhost:9000"],

    /**
     * Port which the backend runs on
     * @property SERVER_PORT
     */
    SERVER_PORT: 13000,

    /**
     * Domain name of the server.
     * @property SERVER_DOMAIN_NAME
     */
    SERVER_DOMAIN_NAME: 'localhost',

    /**
     * Protocol used for server communication
     * @proerty SERVER_PROTOCOL
     */
    SERVER_PROTOCOL: 'http'
};