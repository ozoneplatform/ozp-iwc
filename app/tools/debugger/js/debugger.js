
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
        {
            'address': "data.api"
        },
        {
            'address': "intents.api"
        },
        {
            'address': "system.api"
        },
        {
            'address': "names.api"
        }
    ];
}]).controller("packetLogController",["$scope",function(scope) {
    scope.logging=false;
    scope.filter="";
    scope.packets=[];
    scope.maxBuffer=100;
    
    function logPacket(msg) {
        if(!scope.logging) {
            return;
        }
        var packet=msg.packet;
        scope.$apply(function() {
           scope.packets.push(packet);
           if(scope.packets.length > scope.maxBuffer) {
               scope.packets.splice(0,scope.packets.length-scope.maxBuffer);
           }
        });
    };
    
    ozpIwc.defaultPeer.on("receive",logPacket);
    ozpIwc.defaultPeer.on("send",logPacket);
    
}]).controller("apiDisplayController",["$scope","iwcClient",function(scope,client) {
    scope.keys=[];

    scope.refresh=function() {
        client.send({
            'dst': scope.api.address,
            'action': "list"
        },function(response) {
            scope.keys=response.entity.map(function(k) {
                return {
                    'resource': k,
                    'isLoaded':false,
                    'isWatched':false
                };
            });
        });
    };
    
    scope.loadKey=function(key) {
        client.send({
            'dst': scope.api.address,
            'action': "get",
            'resource': key.resource
        },function(response) {
            console.log("For '" + key.resource + "' loaded value ",response);
            for(i in response) {
                key[i]=response[i];
            }
            key.isLoaded=true;
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