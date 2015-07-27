module.exports = {
    /**
     * Root of the server. IWC library files statically served from here.
     * @property ROOT_ROUTE
     */
    ROOT_ROUTE : "/",

    /**
     * Application files statically served from here.
     * @property APPLICATION_ROUTE
     */
    APPLICATION_ROUTE : "/application",

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
    ALLOW_ORIGIN: "http://localhost:13000"
};