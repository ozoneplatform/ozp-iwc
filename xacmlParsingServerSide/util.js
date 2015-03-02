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

ozpIwc.policyAuth.util.generateAttributeSubjects = function(config){
    config = config || [];
    config = Array.isArray(config) ? config : [config];

    var attributes = [];
    for (var i in config) {
        config[i].matchId = config[i].matchId || "urn:oasis:names:tc:xacml:1.0:function:string-equal";
        config[i].dataType = config[i].dataType || "http://www.w3.org/2001/XMLSchema#string";

        var attr = ozpIwc.policyAuth.util.generateAttribute({
            matchId: config[i].matchId,
            attributeId: "urn:oasis:names:tc:xacml:1.0:subject:subject-id",
            category: "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject",
            dataType: config[i].dataType,
            value: config[i].value
        });
        attributes.push(attr);
    }
    return attributes;
};

ozpIwc.policyAuth.util.generateAttributeResources = function(config){
    config = config || [];
    config = Array.isArray(config) ? config : [config];

    var attributes = [];
    for (var i in config){
        config[i].matchId = config[i].matchId || "urn:oasis:names:tc:xacml:1.0:function:string-equal";
        config[i].dataType = config[i].dataType || "http://www.w3.org/2001/XMLSchema#string";

        var attr = ozpIwc.policyAuth.util.generateAttribute({
            matchId: config[i].matchId,
            attributeId: "urn:oasis:names:tc:xacml:1.0:resource:resource-id",
            category: "urn:oasis:names:tc:xacml:3.0:attribute-category:resource",
            dataType: config[i].dataType,
            value: config[i].value
        });
        attributes.push(attr);
    }
    return attributes;

};

ozpIwc.policyAuth.util.generateAttributeActions = function(config){
    config = config || [];
    config = Array.isArray(config) ? config : [config];

    var attributes = [];
    for (var i in config) {
        config[i].matchId = config[i].matchId || "urn:oasis:names:tc:xacml:1.0:function:string-equal";
        config[i].dataType = config[i].dataType || "http://www.w3.org/2001/XMLSchema#string";

        var attr = ozpIwc.policyAuth.util.generateAttribute({
            matchId: config[i].matchId,
            attributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
            category: "urn:oasis:names:tc:xacml:3.0:attribute-category:action",
            dataType: config[i].dataType,
            value: config[i].value
        });
        attributes.push(attr);
    }
    return attributes;
};


