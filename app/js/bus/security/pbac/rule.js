ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};


/**
 * 3.3.1 Rule
 * A rule is the most elementary unit of policy.  It may exist in isolation only within one of the major actors of
 * the XACML domain.  In order to exchange rules between major actors, they must be encapsulated in a policy.
 * A rule can be evaluated on the basis of its contents.  The main components of a rule are:
 *
 * The <Rule> element is of RuleType complex type.
 *
 * @class Rule
 * @namespace ozpIwc.policyAuth
 *
 * @param {Object} config
 * @param {Object} config.target
 * @param {String} config.effect
 * @param {Array<Function>} config.obligations
 * @param {Array<Function>} config.advices
 *
 * @constructor
 */
ozpIwc.policyAuth.Rule = function(config){
    config=config || {};

    /**
     * A string identifying this rule.
     * @property ruleId
     * @type String
     * @default null
     */
    this.ruleId = config.ruleId;

    /**
     * A category-keyed collection of attributes.
     * @property ruleId
     * @type String
     * @default null
     */
    this.category = config.category;

    /**
     * The rule-writer's intended consequence of a "True" evaluation for the rule.
     * Two values are allowed: "Permit" and "Deny".
     * @property effect
     * @type String
     * @default "Permit"
     */
    this.setEffect(config.effect);
};

/**
 * 3.3.1.2 Effect
 * The effect of the rule indicates the rule-writer's intended consequence of a "True" evaluation for the rule.
 * Two values are allowed: "Permit" and "Deny".
 *
 * @method setEffect
 * @param {String} effect
 */
ozpIwc.policyAuth.Rule.prototype.setEffect = function(effect){
    switch(effect){
        case "Permit":
            this.effect = effect;
            break;
        case "Deny":
            this.effect = effect;
            break;
        default:
            this.effect = "Permit";
    }
};

ozpIwc.policyAuth.Rule.prototype.getNegativeEffect = function(){
    switch(this.effect){
        case "Deny":
            return "Permit";
        default:
            return "Deny";
    };
};

ozpIwc.policyAuth.Rule.prototype.evaluate = function(request){
    var reqCategory = request.category;

    // Iterate over each category
    for(var i in this.category){
        // If the request doesn't have the category, fail it
        if(!reqCategory[i]){
            //@TODO
            return this.getNegativeEffect();
        } else {

            var attributeDesignator = this.category[i].attributeDesignator;
            var attributeValues = this.category[i].attributeValue;
            // iterate over each attribute in the request
            for(var j in reqCategory[i]){
                var matchFound = false;
                var currentReqAttribute = reqCategory[i][j];
                if(currentReqAttribute.dataType === attributeDesignator.dataType){
                    for(var k in attributeValues){
                        if(currentReqAttribute.attributeValue === attributeValues[k]){
                            matchFound = true;
                            break;
                        }
                    }
                }
                if(!matchFound){
                    return this.getNegativeEffect()
                }
            }
        }
    }
    return this.effect;
};

