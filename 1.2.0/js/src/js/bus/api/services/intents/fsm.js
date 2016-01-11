var ozpIwc = ozpIwc || {};
ozpIwc.api = ozpIwc.api || {};
ozpIwc.api.intents = ozpIwc.api.intents || {};

/**
 * @module ozpIwc.api
 * @submodule ozpIwc.api.intents
 */


ozpIwc.api.intents.FSM = (function (api, util) {
    /**
     * A Finite State Machine for in-flight intent resources. This state machine is static and manipulates the apiNodes
     * it receives given the packet context received.
     * @class FSM
     * @namespace ozpIwc.api.intents
     * @uses ozpIwc.util.Event
     * @static
     * @type {Object}
     */
    var FSM = {};

    FSM.events = new util.Event();
    FSM.events.mixinOnOff(FSM);

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
    FSM.states = {};

    /**
     * The initial state.
     * This state immediately determines the next state of the node based on the number of handler choices it contains.
     *
     * @method init
     * @return {Object}
     */
    FSM.states.init = function () {
        var choices = this.entity.handlerChoices;
        var nextEntity = {};

        if (!choices || choices === []) {
            nextEntity.state = "error";
            nextEntity.error = "noChoices";
            return FSM.transition(this, {entity: nextEntity});
        }

        if (Array.isArray(choices)) {
            //If there is only 1 choice & its a launcher, enforce the popup to choose it (similar to Windows chooser
            // feel).
            var onlyLauncher = (choices.length === 1 && choices[0] && choices[0].entity && choices[0].entity.invokeIntent &&
            choices[0].entity.invokeIntent.action === "launch");
            if (choices.length === 1 && !onlyLauncher) {
                nextEntity.handler = {
                    resource: choices[0].resource,
                    reason: "onlyOne"
                };
                nextEntity.state = "delivering";
            } else {
                nextEntity.state = "choosing";
            }
        } else if (typeof choices === "object") {
            nextEntity.handler = {
                resource: choices.resource,
                reason: "onlyOne"
            };
            nextEntity.state = "delivering";
        } else {
            nextEntity.state = "error";
            nextEntity.error = "unknown choices.";
        }

        return FSM.transition(this, {entity: nextEntity});
    };

    /**
     * The error handling state.
     * This state is called when unexpected state changes and missing data occurs in the state
     * machine.
     *
     * @method error
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.error = function (entity) {
        var reply = entity.reply || {};
        reply.entity = reply.entity || "Unknown Error.";
        reply.contentType = reply.contentType || "text/plain";

        this.entity = this.entity || {};
        this.entity.reply = reply;
        this.entity.state = "error";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The delivering state.
     * The node is in a delivering state when it's registered handler is called to operate on the
     * intent data. The register handler will respond with "running" to signify it has received the request.
     *
     * @method delivering
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.delivering = function (entity) {
        if (!entity.handler || !entity.handler.resource || !entity.handler.reason) {
            throw new api.error.BadStateError("Choosing state requires a resource and reason");
        }
        this.entity.handler = entity.handler;
        this.entity.state = "delivering";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The running state.
     * The node is in a running state when the registered handler has received the request data. The
     * node will transition to the "complete" state upon receiving a response from the handler's operation.
     * @TODO currently running/complete are sent at once and no data is returned. When these states are sent the intent
     *     is handled.
     *
     * @method running
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.running = function (entity) {
        if (!entity.handler || !entity.handler.address) {
            throw new api.error.BadContentError("Entity lacks a 'handler.address' field");
        }
        this.entity.handler.address = entity.handler.address;
        this.entity.state = "running";
        this.version++;
        return FSM.stateEvent(this);
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
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.choosing = function () {
        this.entity.state = "choosing";
        this.version++;
        return FSM.stateEvent(this);
    };

    /**
     * The Complete state.
     * Once the intent has been handled or canceled the node will transition to the complete state. From here the API
     * will mark the node for deletion as it is no longer needed.
     *
     * @method complete
     * @param {Object} entity The entity of the request packet received by the Api.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.states.complete = function (entity) {
        this.entity.reply = entity.reply;
        this.entity.state = "complete";
        this.version++;
        return FSM.stateEvent(this);
    };


//===============================================
//State Transitions
//===============================================
    /**
     * A collection of state transitions for the Finite State machine. The first level of properties represent current
     * state and the second level represents states that can be transitioned to.
     *
     * @property stateTransitions
     * @type {Object}
     */
    FSM.stateTransitions = {
        "init": {
            "init": FSM.states.init,
            "error": FSM.states.error,
            "delivering": FSM.states.delivering,
            "choosing": FSM.states.choosing
        },
        "choosing": {
            "error": FSM.states.error,
            "delivering": FSM.states.delivering,
            "complete": FSM.states.complete
        },
        "delivering": {
            "error": FSM.states.error,
            "running": FSM.states.running,
            "complete": FSM.states.complete
        },
        "running": {
            "error": FSM.states.error,
            "complete": FSM.states.complete
        },
        "complete": {},
        "error": {}
    };

    /**
     * The transition utility function. This determines if the requested state change from the packet is valid, then
     * calls the state transition and returns the modified node for storage.
     * @method transition
     * @param {ozpIwc.api.base.Node} node
     * @param {ozpIwc.PacketContext} [packet] If not provided, FSM assumes initial state transition.
     * @return {ozpIwc.api.base.Node}
     */
    FSM.transition = function (node, packet) {
        packet = packet || {entity: {state: "init"}};
        if (!packet.entity || !packet.entity.state) {
            throw new api.error.BadContentError("Entity lacks a 'state' field");
        }
        if (node.deleted) {
            throw new api.error.BadContentError("Already handled.");
        }
        var transist = FSM.stateTransitions[node.entity.state];
        if (!transist) {
            // we're in a bad state.  pretty much unrecoverable
            return FSM.states.error.call(node, {
                entity: {
                    error: "Inflight intent is in an invalid state.  Cannot proceed.",
                }
            });
        }

        transist = transist[packet.entity.state];
        if (!transist) {
            throw new api.error.BadStateError("In-flight intent cannot transition from " +
                node.entity.state + " to " + packet.entity.state);
        }

        return transist.call(node, packet.entity);
    };

    /**
     * Triggers node's state event and returns the node.
     * @method stateReturn
     * @param node
     * @return {ozpIwc.api.base.Node}
     */
    FSM.stateEvent = function (node) {
        if (node.entity && node.entity.state) {
            FSM.events.trigger(node.entity.state, node);
        }
        return node;
    };

    return FSM;
}(ozpIwc.api, ozpIwc.util));