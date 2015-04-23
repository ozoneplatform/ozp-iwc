//
//// ozp:iwc:${action}:any:${subjectAttr}
//
//// Participant:
////   ozp:iwc:origin = "http://example.com"
////   ozp:iwc:address = "12345.67890"
//
//// Address:
////   ozp:iwc:address = "12345.67890"
//
//// Multicast:
////   ozp:iwc:address = "multicast.address"
////   ozp:iwc:members = ["12345.67890","1111111.67890"]
//
//ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/transport'] = function(request,result){
//    var resourceMembers=request.resource.merge("ozp:iwc:address","ozp:iwc:members");
//    
//    result.set(resourceMembers.exists() && 
//        request.action().containsAny("sendAs","receiveAs") &&
//        resourceMembers.contains(request.subject("ozp:iwc:address"))
//    );
//    
//};
//
//// Participant:
////   ozp:iwc:origin = "http://example.com"
////   ozp:iwc:address = "12345.67890"
//
//// Bus:
////   ozp:iwc:origin = "http://ozp.example.com"
////   ozp:iwc:origin:deny = ["http://badguy.example.com"]
//
//// ApiNode
////   ozp:iwc:origin:permit = ["http://example.com"]
//
//ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/byOrigin'] = function(request){
//    var subjectOrigin=request.subject("ozp:iwc:origin");
//
//    if(request.resource("ozp:iwc:origin:permit").contains(subjectOrigin)) {
//        return "Permit";
//    } else if(request.resource("ozp:iwc:origin:deny").contains(subjectOrigin)) {
//        return "Deny";
//    }
//
//    return "NotApplicable";
//};
//
//ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/rbac'] = function(request,result){
//    var subjectRoles=request.subject("ozp:iwc:roles");
//    var allOf=request.resource.merge(
//        "ozp:iwc:rbac:requiresAll",
//        "ozp:iwc:rbac:requiresAll:"+request.action()
//    );
//    var anyOf=request.resource.merge(
//        "ozp:iwc:rbac:requiresAny",
//        "ozp:iwc:rbac:requiresAny:"+request.action()
//    );
//    
//    result.set(allOf.containsAll(subjectRoles) && anyOf.containsAny(subjectRoles));
//};