ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.util = ozpIwc.policyAuth.util || {};

ozpIwc.policyAuth.util.generateEmptyTarget = function(){
    return new ozpIwc.policyAuth.Target({
        anyOf: [new ozpIwc.policyAuth.AnyOf({
            allOf: [new ozpIwc.policyAuth.AllOf()]
        })]
    });
};

ozpIwc.policyAuth.util.generateAttribute = function(config){
    config = config || {};

    return  new ozpIwc.policyAuth.AllOf({
        match: [new ozpIwc.policyAuth.Match({
            matchId: config.matchId,
            attributeDesignator: new ozpIwc.policyAuth.AttributeDesignator({
                attributeId: config.attributeId,
                category: config.category,
                dataType: config.dataType,
                mustBePresent: "false"
            }),
            attributeValue: new ozpIwc.policyAuth.AttributeValue({
                dataType: config.dataType,
                value: config.value
            })
        })]
    });
};

ozpIwc.policyAuth.util.generateAttributeSubject = function(config){
    config = config || {};

    config.matchId = config.matchId || "urn:oasis:names:tc:xacml:1.0:function:string-equal";
    config.dataType = config.dataType || "http://www.w3.org/2001/XMLSchema#string";

    return ozpIwc.policyAuth.util.generateAttribute({
        matchId: config.matchId,
        attributeId: "urn:oasis:names:tc:xacml:1.0:subject:subject-id",
        category: "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject",
        dataType: config.dataType,
        value: config.value
    });
};

ozpIwc.policyAuth.util.generateAttributeResource = function(config){
    config = config || {};

    config.matchId = config.matchId || "urn:oasis:names:tc:xacml:1.0:function:string-equal";
    config.dataType = config.dataType || "http://www.w3.org/2001/XMLSchema#string";

    return ozpIwc.policyAuth.util.generateAttribute({
        matchId: config.matchId,
        attributeId: "urn:oasis:names:tc:xacml:1.0:resource:resource-id",
        category: "urn:oasis:names:tc:xacml:3.0:attribute-category:resource",
        dataType: config.dataType,
        value: config.value
    });
};

ozpIwc.policyAuth.util.generateAttributeAction = function(config){
    config = config || {};

    config.matchId = config.matchId || "urn:oasis:names:tc:xacml:1.0:function:string-equal";
    config.dataType = config.dataType || "http://www.w3.org/2001/XMLSchema#string";

    return ozpIwc.policyAuth.util.generateAttribute({
        matchId: config.matchId,
        attributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
        category: "urn:oasis:names:tc:xacml:3.0:attribute-category:action",
        dataType: config.dataType,
        value: config.value
    });
};


