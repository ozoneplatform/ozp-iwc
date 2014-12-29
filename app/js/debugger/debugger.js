
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
        
        
debuggerModule.controller("packetLogController",["$scope",function(scope) {
    scope.logging=false;
    scope.viewFilter="";
    scope.packets=[];
    scope.maxShown=50;
    
    function logPacket(msg) {        
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
    
}]);
        
        
debuggerModule.controller("apiDisplayController",["$scope","iwcClient",function(scope,client) {
    scope.keys=[];
    scope.loadKey=function(key) {
        client.send({
            'dst': scope.api.address,
            'action': "get",
            'resource': key.resource
        },function(response,done) {
            for(i in response) {
                key[i]=response[i];
            }
            key.isLoaded=true;
            done();
        });
        client.send({
            'dst': scope.api.address,
            'action': "list",
            'resource': key.resource
        },function(response,done) {
            if(response.response==="ok") {
                key.children=response.entity;
            }else {
                key.children="Not Supported: " + response.response;
            }
            done();
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
        if(key.isWatched) {
            client.send({
                'dst': scope.api.address,
                'action': "watch",
                'resource': key.resource
            },function(response) {
                if(response.response === 'changed') {
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

        
debuggerModule.controller("metricsController",['$scope','$interval',function(scope,$interval) {
    scope.updateFrequency=1000;
    scope.updateActive=true;
        
    scope.refresh=function() {
        scope.metrics=ozpIwc.metrics.allMetrics().map(function(m) {
            return {
                'name' :m.name,
                'unit' : m.unit(),
                'value' : m.get()
            };
        });
    };
    
    scope.refresh();
    
    var timer=null;
    var updateTimer=function() {
        if(timer) {
            $interval.cancel(timer);
        }
        if(scope.updateActive) {
            timer=$interval(scope.refresh,scope.updateFrequency);
        }
    };
    
    
    scope.$watch('updateActive', updateTimer);
    scope.$watch('updateFrequency', updateTimer);
}]);

debuggerModule.controller('electionController',['$scope',function($scope){
    $scope.onElectionSelect = function(election){
        $scope.selectedElection = election;
    };

    $scope.apis = [
        {
            value: 'data.api',
            title: 'Data Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {}
        },
        {
            value: 'names.api',
            title: 'Names Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {}
        },
        {
            value: 'system.api',
            title: 'System Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {}
        },
        {
            value: 'intents.api',
            title: 'Intents Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {}
        }
    ];

    $scope.clear = function(){
        for(var i in $scope.apis){
            $scope.apis[i].elections = new vis.DataSet();
            $scope.apis[i].electionGroups = new vis.DataSet();
            $scope.apis[i].packets = {};
        }
        $scope.selectedElection = null;
    };

    function logPacket(msg) {
        var packet=msg.packet.data;
        var text = packet.src;
        if(packet.action === 'victory'){
            text = '<label> VICTORY </label>' + text
        }

        var timelineData = {
            id: packet.time,
            content: text,
            start: new Date(packet.time),
            end: new Date(packet.time + 250),
            group: packet.src
        };

        var timelineBG = {
            id: 'BG'+packet.time,
            content: packet.src +' timer',
            start: new Date(packet.time),
            end: new Date(packet.time + 250),
            type: 'background',
            subgroup: packet.src
        };

        var timelineGroup = {
            id: packet.src,
            content: packet.src
        };

        var packetData = {
            id: packet.time,
            data: packet
        };
        switch (packet.dst) {
            case "data.api.election":
                $scope.$apply(function() {
                    $scope.apis[0].electionGroups.update(timelineGroup);
                    $scope.apis[0].elections.add(timelineData);
                    $scope.apis[0].packets[packetData.id] = packetData.data;
                });
                break;
            case "names.api.election":
                $scope.$apply(function() {
                    $scope.apis[1].electionGroups.update(timelineGroup);
                    $scope.apis[1].elections.add(timelineData);
                    $scope.apis[1].packets[packetData.id] = packetData.data;
                });
                break;
            case "system.api.election":
                $scope.$apply(function() {
                    $scope.apis[2].electionGroups.update(timelineGroup);
                    $scope.apis[2].elections.add(timelineData);
                    $scope.apis[2].packets[packetData.id] = packetData.data;
                });
                break;
            case "intents.api.election":
                $scope.$apply(function() {
                    $scope.apis[3].electionGroups.update(timelineGroup);
                    $scope.apis[3].elections.add(timelineData);
                    $scope.apis[3].packets[packetData.id] = packetData.data;
                });
                break;
            default:
                break;
        }
    }

    ozpIwc.defaultPeer.on("receive",logPacket);
    ozpIwc.defaultPeer.on("send",logPacket);

}]).directive('visTimeline', function() {
        return {
            restrict : 'EA',
            replace : true,
            scope: {
                timelineId: '='
            },
            link: function($scope,element){
                $scope.container = element[0];
                // Create a DataSet with data (enables two way data binding)
                $scope.data = new vis.DataSet();

                // Configuration for the Timeline
                $scope.options = {
                    stack:true,
                    maxHeight: "900px",
                    groupOrder: 'content'
                };

                // Create a Timeline
                $scope.timeline = new vis.Timeline($scope.container, $scope.data, $scope.options);

                $scope.timeline.on('select', function (properties) {
                    $scope.$parent.packetContents =
                        JSON.stringify($scope.$parent.selectedElection.packets[properties.items[0]],null,2);

                });
            },
            controller: function($scope){
                $scope.$watch('$parent.selectedElection',function(newVal){
                    if(newVal) {
                        $scope.timeline.setGroups(newVal.electionGroups);
                        $scope.timeline.setItems(newVal.elections);
                        $scope.timeline.fit();
                    } else {
                        $scope.timeline.clear({items:true,groups:true});
                    }
                })
            }
        };
    });