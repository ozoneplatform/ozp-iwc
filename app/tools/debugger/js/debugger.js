
angular.module("ozpIwc.debugger",[
    'ngRoute',
    'ui.bootstrap'
]).factory("iwcClient",function() {
    var client=new ozpIwc.InternalParticipant({name: "debuggerClient"});
    ozpIwc.defaultRouter.registerParticipant(client);
    return client;
}).controller("debuggerController",["$scope","iwcClient",function(scope,client) {
    scope.client=client;
    scope.apis=[
        {'address': "data.api"},
        {'address': "intents.api"},
        {'address': "system.api"},
        {'address': "names.api"}
    ];
}]).controller("packetLogController",["$scope",function(scope) {
    scope.logging=false;
    scope.viewFilter="";
    scope.packets=[];
    scope.maxShown=50;
    
    function logPacket(msg) {
        console.log("Logging=" + scope.logging + ", maxShown=" + scope.maxShown + ", packets=" + scope.packets.length + ", filter=" + scope.viewFilter);
        
        if(!scope.logging) {
            return;
        }
              
        var packet=msg.packet;
        scope.$apply(function() {
           scope.packets.push(packet);
        });
    };
    
    ozpIwc.defaultPeer.on("receive",logPacket);
    ozpIwc.defaultPeer.on("send",logPacket);
    
}]).controller("apiDisplayController",["$scope","iwcClient",function(scope,client) {
    scope.keys=[];
    scope.loadKey=function(key) {
        console.log("loading key " +key.resource);
        client.send({
            'dst': scope.api.address,
            'action': "get",
            'resource': key.resource
        },function(response) {
            for(i in response) {
                key[i]=response[i];
            }
            key.isLoaded=true;
        });
        client.send({
            'dst': scope.api.address,
            'action': "list",
            'resource': key.resource
        },function(response) {
            if(response.action==="ok") {
                key.children=response.entity;
            }else {
                key.children="Not Supported: " + response.action;
            }
        });
    };
    scope.refresh=function() {
        client.send({
            'dst': scope.api.address,
            'action': "list"
        },function(response) {
            scope.keys=response.entity.map(function(k) {
                var key={
                    'resource': k,
                    'isLoaded':false,
                    'isWatched':false
                };
                scope.loadKey(key);
                return key;
            });
        });
    };
    

    
    scope.watchKey=function(key) {
        console.log("Watching ",key);
        if(key.isWatched) {
            client.send({
                'dst': scope.api.address,
                'action': "watch",
                'resource': key.resource
            },function(response) {
                console.log("Key is now ",key);
                if(response.action === 'changed') {
                    scope.$evalAsync(function() {
                        key.entity=response.entity.newValue;
                        key.permissions=response.permissions;
                        key.contentType=response.contentType;
                    });
                }
                return key.isWatched;
            });
        }
    };
    scope.refresh();
}]);