var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
/**
 * @module ozpIwc
 * @submodule ozpIwc.api
 */


/**
 * @class api
 * @static
 * @namespace ozpIwc
 */
ozpIwc.api = (function (api) {
    /**
     * Initializes the Endpoint Registry with the api root path.
     *
     * @method initEndpoints
     * @static
     * @param {String} apiRoot
     */
    api.initEndpoints = function (config) {
        config = config || {};

        var registry = new api.EndpointRegistry(config);
        /**
         * A static method for gathering an endpoint from the EndpointRegistry.
         * @method endpoint
         * @static
         * @param {String} name the endpoint name to gather
         * @returns {ozpIwc.api.Endpoint}
         */
        api.endpoint = function (name) {
            return registry.endpoint(name);
        };

        /**
         * A static method for gathering the uri template of an endpoint name in the EndpointRegistry
         * @param {String} name
         * @returns {Object}
         */
        api.uriTemplate = function (name) {
            return registry.template[name];
        };

        api.endpointPromise = registry.loadPromise;

        return api.endpointPromise;
    };

    /**
     * Creates a subclass of base api and adds some static helper functions.
     *
     * @method createApi
     * @static
     * @param {Object} config
     * @param {String} config.name
     * @param {ozpIwc.transport.Router} config.router
     * @param {Function} init the constructor function for the class
     * @return {Object} A new API class that inherits from the base api class.
     */
    api.createApi = function (name, init) {

        var createdApi = ozpIwc.util.extend(api.base.Api, function () {

            //Hijack the arguments and set the api name if not given in the config
            var config = arguments[0];
            config.name = config.name || name;

            api.base.Api.apply(this, [config]);
            return init.apply(this, arguments);
        });
        ozpIwc.util.PacketRouter.mixin(createdApi);
        createdApi.useDefaultRoute = function (actions, resource) {
            resource = resource || "{resource:.*}";
            actions = ozpIwc.util.ensureArray(actions);
            actions.forEach(function (a) {
                var filterFunc = api.filter.standard.forAction(a);
                createdApi.declareRoute({
                        action: a,
                        resource: resource,
                        filters: (filterFunc ? filterFunc() : [])
                    }, api.base.Api.defaultHandler[a]
                );
            });
        };

        createdApi.declareRoute({
            action: ["bulkSend"],
            resource: "{resource:.*}",
            filters: []
        }, function (packet, context, pathParams) {
            var messages = packet.entity || [];

            messages.forEach(function (message) {
                var packetContext = new ozpIwc.transport.PacketContext({
                    'packet': message.packet,
                    'router': this.router,
                    'srcParticipant': message.packet.src,
                    'dstParticipant': this.address
                });
                this.receivePacketContext(packetContext);
            }, this);
            return {response: "ok"};
        });
        return createdApi;
    };

    return api;
}(ozpIwc.api));