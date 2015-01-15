ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * System entity that evaluates applicable policy and renders an authorization decision.
 * @class PDP
 * @namespace ozpIwc.policyAuth
 *
 * @param {Object} config
 * @constructor
 */
ozpIwc.policyAuth.PDP = function(config){
    config=config || {};
    /**
     * An events module for the API.
     * @property events
     * @type Event
     */
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);

    /**
     * A cache of policies
     * @TODO define how desired policies will be loaded in from the back-end
     * @property policies
     */
    this.policies= config.policies || [
        ozpIwc.abacPolicies.permitWhenObjectHasNoAttributes,
        ozpIwc.abacPolicies.subjectHasAllObjectAttributes
    ];
};

/**
 *  Sends a request to the given URI to retrieve the desired Policy Set.
 *  If the set cannot be retrieved, the desired set will default to always deny.
 * @TODO
 * @method gatherPolicies
 * @param {Object} config
 * @param {String} config.policyID The unique ID of the policy to gather
 * @param {String} config.uri The uri path of where the policy is expected to be found.
 */
ozpIwc.policyAuth.PDP.prototype.gatherPolicies = function(uri){
    ozpIwc.util.ajax({
        href: uri,
        method: "GET"
    }).then(function(resp){

    })['catch'](function(er){
        // We have to catch because onload does json.parse.... and this is xml... @TODO fix...
        var xml = er.responseXML;
        var policies = [];
        for(var i  in xml.children){
            if(xml.children[i].tagName === "Policy"){
                policies.push(xml.children[i]);
            }
        }

        for(var i in policies){
            new ozpIwc.policyAuth.Policy({element: policies[i]});
        }
    });
};

/**
 * Processes an {{#crossLink "ozpIwc.policyAuth.PEP"}}{{/crossLink}} request.
 * @TODO
 * @method handleRequest
 * @param request
 * @returns {Promise}
 */
ozpIwc.policyAuth.PDP.prototype.handleRequest = function(request){
	var action=new ozpIwc.AsyncAction();

    var result=this.policies.some(function(policy) {
        return policy.call(this,request)==="permit";
    },this);


    if(result) {
        return action.resolve("success");
    } else {
		return action.resolve('failure');
    }
};

ozpIwc.authorization = new ozpIwc.policyAuth.PDP();