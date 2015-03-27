
ozpIwc.apiFilter={

    /**
     * Stores the resource in context.node, creating it via the api's
     * createResource function if it doesn't exist.
     * @param {type} packet
     * @param {type} context
     * @param {type} pathParams
     * @param {type} next
     * @returns {unresolved}
     */
    createResource: function(NodeClass) {
        NodeClass=NodeClass || ozpIwc.ApiNode;
        return function(packet,context,pathParams,next) {
            if(!context.node) {
                context.node=this.data[packet.resource]=new NodeClass({
                    resource: packet.resource
                });
            }
            return next();
        };
    },
    
    /**
     * Stores the resource in context.node or throws NoResourceError if it does not exist.
     * @param {type} packet
     * @param {type} context
     * @param {type} pathParams
     * @param {type} next
     * @returns {unresolved}
     */
    requireResource: function() { 
        return function(packet,context,pathParams,next) {
        if(!context.node || context.node.deleted) {
            throw new ozpIwc.NoResourceError(packet);
        }
        return next();
    };},
    
    /**
     * Checks that the subject within the context is authorized for the action
     * on the resource node.
     * 
     * @param {type} packet
     * @param {type} context
     * @param {type} pathParams
     * @param {type} next
     * @returns {unresolved}
     */
    
    checkAuthorization: function(action) {
        return function(packet,context,pathParams,next) {
            this.checkAuthorization(context.node,context,packet,action || packet.action);
            return next();
        };
    },
    
    markResourceAsChanged: function() { 
        return function(packet,context,pathParams,next) {
            this.markForChange(packet);
            return next();
    };},
    
    checkVersion: function() { 
        return function(packet,context,pathParams,next) {
        // if there is no resource node, then let the request through
        if(packet.ifTag && packet.ifTag!==context.node.version) {
            throw new ozpIwc.NoMatchError({
                expectedVersion: packet.ifTag,
                actualVersion: context.node.version
            });
        }
        return next();
    };}
    
};