
// ozp:iwc:${action}:any:${subjectAttr}

// Participant:
//   ozp:iwc:origin = "http://example.com"
//   ozp:iwc:address = "12345.67890"

// Address:
//   ozp:iwc:address = "12345.67890"

// Multicast:
//   ozp:iwc:address = "multicast.address"
//   ozp:iwc:members = ["12345.67890","1111111.67890"]

ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/transport'] = function(request,result){
    if(request.action().containsAny("sendAs","receiveAs")) {
        return; // NotApplicable
    }
    var resourceMembers=request.resource.merge(
        "ozp:iwc:address",
        "ozp:iwc:address:permit"
    );

    result.set(resourceMembers.exists() && 
        resourceMembers.containsAny(request.subject("ozp:iwc:address"))
    );
};

// Participant:
//   ozp:iwc:origin = "http://example.com"
//   ozp:iwc:address = "12345.67890"

// Bus:
//   ozp:iwc:origin = "http://ozp.example.com"
//   ozp:iwc:origin:deny = ["http://badguy.example.com"]

// ApiNode
//   ozp:iwc:origin:permit = ["http://example.com"]

ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/byOrigin'] = function(request,result){
    var subjectOrigin=request.subject("ozp:iwc:origin");
    var permitted=request.resource("ozp:iwc:origin:permit");
    var denied=request.resource("ozp:iwc:origin:deny");
    
    if(denied.exists() && denied.contains(subjectOrigin)) {
        result.permit();
    } else if(permitted.exists() && permitted.contains(subjectOrigin)) {
        result.deny();
    } 
};

// Participant:			ozp:iwc:origin = "http://example.com"
// 	  				ozp:iwc:address = "12345.67890"
//					ozp:iwc:rbac:roles = “financial”
// /accounts/1234		ozp:iwc:rbac:requiresAny = ["financial"]
// /employee/medical	ozp:iwc:rbac:requiresAll = [“financial”,”humanResources”]
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/rbac'] = function(request,result){
    var subjectRoles=request.subject("ozp:iwc:rbac:roles");
    var allOf=request.resource.merge(
        "ozp:iwc:rbac:requiresAll",
        "ozp:iwc:rbac:requiresAll:"+request.action()
    );
    var anyOf=request.resource.merge(
        "ozp:iwc:rbac:requiresAny",
        "ozp:iwc:rbac:requiresAny:"+request.action()
    );
    
    result.set(allOf.containsAll(subjectRoles) && anyOf.containsAny(subjectRoles));
};