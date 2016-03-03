/**
 * @submodule bus.service.Util
 */

/**
 * A Finite State Machine for in-flight intent resources. This state machine is static and manipulates the apiNodes
 * it receives given the packet context received.
 * @class InFlightIntentFSM
 * @static
 * @type {Object}
 */
ozpIwc.InFlightIntentFSM = {};
ozpIwc.InFlightIntentFSM.events=new ozpIwc.Event();
ozpIwc.InFlightIntentFSM.events.mixinOnOff(ozpIwc.InFlightIntentFSM);

//===============================================
// States.
// Called with node as scope.
//===============================================
/**
 * A collection of states in the FSM. Each state is a function that is called when a node transitions to it via
 * ozpIwc.InFlightFSM.transition.
 * Each state function is called with the node's scope.
 *
 * @property states
 * @type {Object}
 */
ozpIwc.InFlightIntentFSM.states ={};

/**
 * The initial state.
 * This state immediately determines the next state of the node based on the number of handler choices it contains.
 *
 * @method init
 * @returns {Object}
 */
ozpIwc.InFlightIntentFSM.states.init = function(){
    var choices = this.entity.handlerChoices || [];
    var nextEntity = {};

    if(choices.length === 1){
        nextEntity.handler = {
            resource: choices[0].resource,
            reason: "onlyOne"
        };
        nextEntity.state = "delivering";
        //nextEntity.handlerChosen = this.entity.handlerChoices[0];
    } else if (choices.length > 1){
        nextEntity.state = "choosing";
    } else {
        nextEntity.state = "error";
        nextEntity.error= "noChoices";
    }
    return ozpIwc.InFlightIntentFSM.transition(this,{entity: nextEntity});
};

/**
 * The error handling state.
 * This state is called when unexpected state changes and missing data occurs in the state
 * machine.
 *
 * @method error
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.error=function(entity){
    this.entity = this.entity || {};
    this.entity.reply = entity.error;
    this.entity.state = "error";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The delivering state.
 * The node is in a delivering state when it's registered handler is called to operate on the
 * intent data. The register handler will respond with "running" to signify it has received the request.
 *
 * @method delivering
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.delivering=function(entity){
    if(!entity.handler || !entity.handler.resource || !entity.handler.reason) {
        throw new ozpIwc.BadStateError("Choosing state requires a resource and reason");
    }
    this.entity.handler = entity.handler;
    this.entity.state = "delivering";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The running state.
 * The node is in a running state when the registered handler has received the request data. The
 * node will transition to the "complete" state upon receiving a response from the handler's operation.
 * @TODO currently running/complete are sent at once and no data is returned. When these states are sent the intent is handled.
 *
 * @method running
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.running=function(entity){
    if(!entity.handler || !entity.handler.address) {
        throw new ozpIwc.BadContentError("Entity lacks a 'handler.address' field");
    }
    this.entity.handler.address=entity.handler.address;
    this.entity.state = "running";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The choosing state.
 * The node is in a choosing state when:
 *  (1) the intent chooser is opened.
 *  (2) the api is gathering the preference-stored designated handler.
 *
 * The node will transition to delivering once the handler has been chosen.
 *
 * @method choosing
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.choosing=function(){
    this.entity.state = "choosing";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};

/**
 * The Complete state.
 * Once the intent has been handled or canceled the node will transition to the complete state. From here the API
 * will mark the node for deletion as it is no longer needed.
 *
 * @method complete
 * @param {Object} entity The entity of the request packet received by the Api.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.states.complete=function(entity){
    this.entity.reply=entity.reply;
    this.entity.state = "complete";
    this.version++;
    return ozpIwc.InFlightIntentFSM.stateEvent(this);
};


//===============================================
//State Transitions
//===============================================
/**
 * A collection of state transitions for the Finite State machine. The first level of properties represent current state
 * and the second level represents states that can be transitioned to.
 *
 * @property stateTransitions
 * @type {Object}
 */
ozpIwc.InFlightIntentFSM.stateTransitions ={
        "init": {
            "init": ozpIwc.InFlightIntentFSM.states.init,
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "delivering" : ozpIwc.InFlightIntentFSM.states.delivering,
            "choosing": ozpIwc.InFlightIntentFSM.states.choosing
        },
        "choosing": {
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "delivering" : ozpIwc.InFlightIntentFSM.states.delivering,
            "complete": ozpIwc.InFlightIntentFSM.states.complete
        },
        "delivering": {
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "running": ozpIwc.InFlightIntentFSM.states.running,
            "complete": ozpIwc.InFlightIntentFSM.states.complete
        },
        "running": {
            "error": ozpIwc.InFlightIntentFSM.states.error,
            "complete": ozpIwc.InFlightIntentFSM.states.complete
        },
        "complete": {},
        "error": {}
};

/**
 * The transition utility function. This determines if the requested state change from the packet is valid, then
 * calls the state transition and returns the modified node for storage.
 * @method transition
 * @param {ozpIwc.ApiNode} node
 * @param {ozpIwc.PacketContext} [packet] If not provided, FSM assumes initial state transition.
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.transition = function(node,packet){
    packet = packet || {entity:{state: "init"}};
    if(!packet.entity || !packet.entity.state) {
        throw new ozpIwc.BadContentError("Entity lacks a 'state' field");
    }
    if(node.deleted){
        throw new ozpIwc.BadContentError("Already handled.");
    }
    var transist=ozpIwc.InFlightIntentFSM.stateTransitions[node.entity.state];
    if(!transist) {
        // we're in a bad state.  pretty much unrecoverable
        return ozpIwc.InFlightIntentFSM.states.error.call(node, {
            entity: {
                error: "Inflight intent is in an invalid state.  Cannot proceed.",
            }
        });
    }

    transist=transist[packet.entity.state];
    if(!transist) {
        throw new ozpIwc.BadStateError("In-flight intent cannot transition from "+
            node.entity.state+" to "+packet.entity.state);
    }

    return transist.call(node,packet.entity);
};

/**
 * Triggers node's state event and returns the node.
 * @method stateReturn
 * @param node
 * @returns {ozpIwc.ApiNode}
 */
ozpIwc.InFlightIntentFSM.stateEvent = function(node){
    if(node.entity && node.entity.state) {
       ozpIwc.InFlightIntentFSM.events.trigger(node.entity.state,node);
    }
    return node;
};