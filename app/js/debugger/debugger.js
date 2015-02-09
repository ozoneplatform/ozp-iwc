
var debuggerModule=angular.module("ozpIwc.debugger",[
    'ui.bootstrap'
]);
        
        
debuggerModule.factory("iwcClient",function() {
    var client=new ozpIwc.InternalParticipant({name: "debuggerClient"});
    ozpIwc.defaultRouter.registerParticipant(client);
    return client;
});
        
        
debuggerModule.controller("debuggerController",["$scope","iwcClient",function(scope,client) {
    scope.client=client;
    scope.apis=[
        {'address': "data.api",'hasChildren':true},
        {'address': "intents.api"},
        {'address': "system.api"},
        {'address': "names.api"}
    ];
}]);
