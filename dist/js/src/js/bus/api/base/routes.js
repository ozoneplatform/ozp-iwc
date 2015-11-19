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
            p.collection = this.getCollection(p.pattern);
            return p;
        },
        "set": function (packet, context, pathParams) {
            context.node.set(packet);
            return {response: "ok"};
        },
        "delete": function (packet, context, pathParams) {
            if (context.node) {
                context.node.markAsDeleted(packet);
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
                p.collection = self.getCollection(p.pattern);
                return p;
            });
            // TODO: roll up the permissions of the nodes, as well
            return {
                "contentType": "application/json",
                "entity": entity
            };
        },
        "watch": function (packet, context, pathParams) {
            this.addWatcher(packet.resource, {
                src: packet.src,
                replyTo: packet.msgId
            });

            //Only if the node has a pattern applied will it actually be added as a collector.
            this.addCollector(packet.resource);

            if (context.node) {
                var p = context.node.toPacket();
                p.collection = this.getCollection(p.pattern);
                return p;
            } else {
                return {response: "ok"};
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
}(ozpIwc.api.base.Api || {}));