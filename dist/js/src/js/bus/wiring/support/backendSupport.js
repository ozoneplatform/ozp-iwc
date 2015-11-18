/**
 * If backend support is disabled the following functionality changes:
 *
 * - API endpoint communication is removed //@TODO stub in Promise resolutions
 * - API endpoints are removed
 *
 */
if (!ozpIwc.config.backendSupport) {
    /**
     * APIs that use endpoints do a check on their endpoint property to go out and gather.
     * If set to an empty array the endpoints will not be gathered.
     *
     * @namespace ozpIwc
     * @property endpointConfig
     * @private
     * @type Object
     */
    ozpIwc.endpointConfig = {
        'dataApi': [],
        'systemApi': [],
        'intentsApi': []
    };
}
