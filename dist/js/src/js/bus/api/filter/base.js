var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.filter = ozpIwc.api.filter || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.filter
 */

/**
 * @class ozpIwc.api.filter.Function
 * @type {Function}
 * @param {type} packet
 * @param {type} context
 * @param {type} pathParams
 * @param {type} next
 * @return {Function} a call to the next filter
 */

/**
 * A collection of basic filter generation functions.
 *
 * @class base
 * @namespace ozpIwc.api.filter
 * @static
 */

ozpIwc.api.filter.base = (function (api, util) {

    var base = {
        /**
         * Returns a filter function with the following features:
         * Stores the resource in context.node, creating it via the api's
         * @method createResource
         * @return {ozpIwc.api.filter.Function}
         */
        createResource: function (NodeType) {
            if (NodeType) {
                return function createTypedResource (packet, context, pathParams, next) {
                    if (!context.node) {
                        context.node = this.data[packet.resource] = new NodeType({
                            resource: packet.resource,
                            pattern: packet.pattern,
                            lifespan: packet.lifespan,
                            src: packet.src
                        });
                    } else if (context.node.deleted) {
                        context.node.set({
                            resource: packet.resource,
                            pattern: packet.pattern,
                            lifespan: packet.lifespan,
                            src: packet.src
                        });
                    }
                    return next();
                };
            } else {
                return function createBaseResource (packet, context, pathParams, next) {
                    if (!context.node) {
                        context.node = this.createNode({
                            resource: packet.resource,
                            contentType: packet.contentType,
                            pattern: packet.pattern,
                            lifespan: packet.lifespan,
                            src: packet.src
                        });
                    }
                    if (!context.node) {
                        throw new api.error.BadContentError({
                            'provided': packet.contentType
                        });
                    }
                    return next();
                };
            }
        },

        /**
         * Returns a filter function with the following features:
         * Adds the resource as a collector to the API, it will now get updates based on its pattern property.
         * @method checkCollect
         * @return {ozpIwc.api.filter.Function}
         */
        checkCollect: function () {

            return function checkCollect (packet, context, pathParams, next) {
                var pattern = packet.pattern;
                // If no pattern supplied in the packet determine the
                // default pattern
                if (!pattern) {
                    if (packet.resource === "/") {
                        pattern = packet.resource;
                    } else if (packet.resource) {
                        pattern = packet.resource + "/";
                    } else {
                        pattern = "/";
                    }
                }

                // If the node exists and a new pattern is provided, update
                // the pattern
                if (context.node && packet.pattern) {
                    if (context.node.pattern !== packet.pattern) {
                        context.node.set({
                            pattern: packet.pattern
                        });
                    }
                } else if (context.node && !context.node.pattern) {
                    //If the node exists and it doesn't have a pattern set it
                    context.node.set({
                        pattern: pattern
                    });
                }

                // If no node and a collect is set, generate the node
                if (!context.node && packet.collect) {
                    context.node = this.createNode({
                        resource: packet.resource,
                        pattern: pattern
                    });
                }

                // If collect was set (node now exists)
                if (packet.collect) {
                    this.addCollector(context.node);
                }

                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Stores the resource in context.node or throws NoResourceError if it does not exist.
         * @method requireResource
         * @return {ozpIwc.api.filter.Function}
         */
        requireResource: function () {
            return function requireResource (packet, context, pathParams, next) {
                if (!context.node || context.node.deleted) {
                    throw new api.error.NoResourceError(packet);
                }
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Checks that the subject within the context is authorized for the action on the resource node.
         * @method checkAuthorization
         * @return {ozpIwc.api.filter.Function}
         */
        checkAuthorization: function (action) {
            return function checkAuthorization (packet, context, pathParams, next) {
                this.checkAuthorization(context.node, context, packet, action || packet.action);
                return next();
            };
        },

        /**
         * An empty filter
         *
         * @method nullFilter
         * @param packet
         * @param context
         * @param pathParams
         * @param next
         * @return {ozpIwc.api.filter.Function} a call to the next filter
         */
        nullFilter: function (packet, context, pathParams, next) {
            return next();
        },

        /**
         * Returns a filter function with the following features:
         * Checks that the content type is one that is authorized for the api resource.
         * @method checkContentType
         * @return {ozpIwc.api.filter.Function}
         */
        checkContentType: function (contentType) {
            if (!contentType) {
                return base.nullFilter;
            }
            contentType = util.ensureArray(contentType);
            return function checkContentType (packet, context, pathParams, next) {
                if (!contentType.some(function (t) {
                        return t === packet.contentType ||
                            (Object.prototype.toString.call(contentType) === '[object RegExp]' &&
                            t.test(packet.contentType));
                    })
                ) {
                    throw new api.error.BadContentError({
                        'provided': packet.contentType,
                        'allowedTypes': contentType
                    });
                }
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Marks the resource as changed.
         * @method markResourceAsChanged
         * @return {ozpIwc.api.filter.Function}
         */
        markResourceAsChanged: function () {
            return function markResourceAsChanged (packet, context, pathParams, next) {
                this.markForChange(packet);
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * If the packet does not contain a pattern property create one from the packet resource + "/". This filter is
         * to be used only in node creation as it can overwrite the nodes pattern property if different than resource +
         * "/".
         * @method fixPattern
         * @return {ozpIwc.api.filter.Function}
         */
        fixPattern: function () {
            return function fixPattern (packet, context, pathParams, next) {
                var pattern;
                if (context.node) {
                    pattern = context.node.pattern;
                }
                if (packet.resource) {
                    packet.pattern = packet.pattern || pattern || packet.resource + "/";
                }
                return next();
            };
        },

        /**
         * Returns a filter function with the following features:
         * Checks the version of the packet against the context.
         * @method checkVersion
         * @return Function}
         */
        checkVersion: function () {
            return function checkVersion (packet, context, pathParams, next) {
                // if there is no resource node, then let the request through
                if (packet.ifTag && packet.ifTag !== context.node.version) {
                    throw new api.error.NoMatchError({
                        expectedVersion: packet.ifTag,
                        actualVersion: context.node.version
                    });
                }
                return next();
            };
        }
    };

    return base;
}(ozpIwc.api, ozpIwc.util));
