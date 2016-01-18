var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.base = ozpIwc.api.base || {};
/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.base
 * @class ozpIwc.api.base.Api
 */

ozpIwc.api.base.Api = (function (Api) {

//===============================================================
// Default Routes and Subclass Helpers
//===============================================================
    /**
     * A collection of default action handlers for an API.
     * @property defaultHandler
     * @static
     * @type {Object}
     */
    Api.defaultHandler = {
        "get": function (packet, context, pathParams) {
            var p = context.node.toPacket();
<<<<<<< HEAD
            p.collection = this.getCollection(p.pattern);
=======
            p.collection = this.getCollectionResources(p);
>>>>>>> gh-pages
            return p;
        },
        "set": function (packet, context, pathParams) {
            context.node.set(packet);
<<<<<<< HEAD
            return {response: "ok"};
=======
            return {
                response: "ok",
                entity: context.node.entity
            };
>>>>>>> gh-pages
        },
        "delete": function (packet, context, pathParams) {
            if (context.node) {
                context.node.markAsDeleted(packet);
<<<<<<< HEAD
=======
                this.removeCollector(context.node);
>>>>>>> gh-pages
            }

            return {response: "ok"};
        },
        "list": function (packet, context, pathParams) {
            var entity = this.matchingNodes(packet.resource).filter(function (node) {
                return !node.deleted;
            }).map(function (node) {
                return node.resource;
            });
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
        "bulkGet": function (packet, context, pathParams) {
            var self = this;
            var entity = this.matchingNodes(packet.resource).map(function (node) {
                var p = node.toPacket();
<<<<<<< HEAD
                p.collection = self.getCollection(p.pattern);
=======
                p.collection = self.getCollectionResources(p);
>>>>>>> gh-pages
                return p;
            });
            // TODO: roll up the permissions of the nodes, as well
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
<<<<<<< HEAD
        "watch": function (packet, context, pathParams) {
            // If a watch with a collect flag comes in for a non-existent resource, create the resource and start
            // the watch & collection. If a collect flag comes in for an existent resource, start collecting
            // based on the resources pattern property or the pattern supplied.
            if(!context.node && packet.collect){
                context.node = this.createNode({
                    resource: packet.resource,
                    pattern: packet.pattern ?
                            packet.pattern : (packet.resource === "/") ? "/" : packet.resource + "/"
                });
            } else if (context.node && packet.collect) {
                context.node.set({
                    pattern: packet.pattern ?
                            packet.pattern : (packet.resource === "/") ? "/" : packet.resource + "/"
                });
            }
=======
        "collect": function (packet, context, pathParams) {
            this.addCollector(context.node);
            var p = context.node.toPacket();
            // collect gathers the children elements rather than its own
            p.entity = this.getCollectionData(context.node);
            return p;
        },
        "watch": function (packet, context, pathParams) {
>>>>>>> gh-pages

            this.addWatcher(packet.resource, {
                src: packet.src,
                replyTo: packet.msgId
            });

<<<<<<< HEAD
            // addCollector will only succeed if the resource has a pattern set to it.
            this.addCollector(packet.resource);

            if(!context.node){
=======
            if (!context.node){
>>>>>>> gh-pages
                return {response: "ok"};
            } else {
                return context.node.toPacket();
            }
        },
        "unwatch": function (packet, context, pathParams) {
            this.removeWatcher(packet.resource, packet);

            //If no one is watching the resource any more, remove its collector if it has one to speed things up.
            if (this.watchers[packet.resource] && this.watchers[packet.resource].length === 0) {
                this.removeCollector(packet.resource);
            }

            return {response: "ok"};
        }
    };

    /**
     * A list of all of the default actions.
     * @property allActions
     * @static
     * @type {String[]}
     */
    Api.allActions = Object.keys(Api.defaultHandler);

    return Api;
<<<<<<< HEAD
}(ozpIwc.api.base.Api || {}));
=======
}(ozpIwc.api.base.Api || {}));
>>>>>>> gh-pages
