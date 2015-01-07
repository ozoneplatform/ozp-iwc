
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
    scope.query = function() {
        scope.loadKey = function (key) {
            client.send({
                'dst': scope.api.address,
                'action': "get",
                'resource': key.resource
            }, function (response, done) {
                for (i in response) {
                    key[i] = response[i];
                }
                key.isLoaded = true;
                done();
            });
            client.send({
                'dst': scope.api.address,
                'action': "list",
                'resource': key.resource
            }, function (response, done) {
                if (response.response === "ok") {
                    key.children = response.entity;
                } else {
                    key.children = "Not Supported: " + response.response;
                }
                done();
            });
        };
        scope.refresh();
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
    $scope.ELECTION_TIME = ozpIwc.ELECTION_TIMEOUT;
    $scope.onElectionSelect = function(election){
        $scope.selectedElection = election;
    };
    function isNewestPacket(packet,api){
        { return api.lastElectionTS < packet.time; }
    }
    function outOfElectionWindow(packet,api){
        { return api.lastElectionTS +  $scope.ELECTION_TIME < Date.now(); }

    }

    $scope.apis = [
        {
            value: 'data.api',
            title: 'Data Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {},
            storageEvents: {},
            lastElectionTS: -Number.MAX_VALUE
        },
        {
            value: 'names.api',
            title: 'Names Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {},
            storageEvents: {},
            lastElectionTS: -Number.MAX_VALUE
        },
        {
            value: 'system.api',
            title: 'System Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {},
            storageEvents: {},
            lastElectionTS: -Number.MAX_VALUE
        },
        {
            value: 'intents.api',
            title: 'Intents Api',
            elections: new vis.DataSet(),
            electionGroups: new vis.DataSet(),
            packets: {},
            storageEvents: {},
            lastElectionTS: -Number.MAX_VALUE
        }
    ];

    $scope.clear = function(){
        for(var i in $scope.apis){
            $scope.apis[i].elections = new vis.DataSet();
            $scope.apis[i].electionGroups = new vis.DataSet();
            $scope.apis[i].packets = {};
            $scope.apis[i].storageEvents = {};
        }
        $scope.selectedElection = null;
    };

    function genTimelineDelta(packet){
        var delta = packet.debuggerTime - packet.time;
        var content = 'delta: ' + delta + ' ms';
        return {
            id: packet.time + "_delay",
            content: content,
            start: new Date(packet.time),
            end: new Date(packet.debuggerTime),
            style: "background-color: lightgray",
            group: packet.src,
            subgroup: "delay"
        }
    }
    function genTimelineData(packet){
        var state = (packet.action === "election" && typeof(packet.entity.state) !== 'undefined' && Object.keys(packet.entity.state).length > 0);
        var timelineData = {
            id: packet.time,
            content: 'Election',
            start: new Date(packet.debuggerTime),
            end: new Date(packet.time + $scope.ELECTION_TIME),
            group: packet.src,
            subgroup: "actual"
        };

        if (packet.entity.priority === -Number.MAX_VALUE){
            timelineData.style = "background-color: gray";
            timelineData.content += '<label> Quitting </label> ';
        }

        switch(packet.action){
            case "leaderQuery":
                timelineData.style = "background-color: purple";
                timelineData.content = "<label>Leader Query</label>";
                break;
            case "leaderResponse":
                timelineData.style = "background-color: purple";
                timelineData.content = "<label>Leader Response</label>";
                timelineData.end = null;
                break;
            case "victory":
                timelineData.style = "background-color: green";
                timelineData.content = "<label> Victory </label>";
                break;
        }

        if(state){
            timelineData.style = "background-color: orange";
            timelineData.content += '</br><label> Contains State </label>';
        }
        if(packet.src === packet.entity.previousLeader){
            timelineData.content += '</br><label> Was Leader </label>';

        }
        return timelineData;
    }

    function genTimelineOOS(packet){
        return {
            id: packet.time,
            content: ' Out of Sync',
            start: new Date(packet.debuggerTime),
            end: new Date(packet.time + $scope.ELECTION_TIME),
            group: packet.src,
            style: "background-color: yellow",
            subgroup: "actual"
        };
    }
    function genTimelineDrop(packet){
        return {
            id: packet.time,
            content: ' Out of Election Window',
            start: new Date(packet.debuggerTime),
            end: new Date(packet.time + $scope.ELECTION_TIME),
            group: packet.src,
            style: "background-color: red",
            subgroup: "actual"
        };
    }

    function updateApiTimeline(packet,api){
        var timelineGroup = {
            id: packet.src,
            content: packet.src
        };


        var packetData = {
            id: packet.time,
            data: packet
        };

        api.electionGroups.update(timelineGroup);

        if(isNewestPacket(packet,api)) {
            api.elections.add(genTimelineDelta(packet));
            api.elections.add(genTimelineData(packet));
        } else if(outOfElectionWindow(packet,api)){
            api.elections.add(genTimelineDelta(packet));
            api.elections.add(genTimelineDrop(packet));
        } else {
            api.elections.add(genTimelineDelta(packet));
            api.elections.add(genTimelineOOS(packet));
        }
        if(packet.action === 'victory'){
            api.lastElectionTS = packet.time;
        }
        api.packets[packetData.id] = packetData.data;
    }

    function logPacket(msg) {
        if($scope.enableOrNot === "disabled") return;
        var packet = msg.packet.data;
        packet.debuggerTime = Date.now();
        var actions = ['election','victory','leaderQuery','leaderResponse'];
        if(actions.indexOf(packet.action) < 0) return;

        switch (packet.dst) {
            case "data.api.election":
                $scope.$apply(function() {
                    updateApiTimeline(packet,$scope.apis[0]);
                });
                break;

            case "names.api.election":
                $scope.$apply(function() {
                    updateApiTimeline(packet,$scope.apis[1]);
                });
                break;

            case "system.api.election":
                $scope.$apply(function() {
                    updateApiTimeline(packet,$scope.apis[2]);
                });
                break;

            case "intents.api.election":
                $scope.$apply(function() {
                    updateApiTimeline(packet,$scope.apis[3]);
                });
                break;

            default:
                switch (packet.src) {
                    case "data.api.election":
                        $scope.$apply(function() {
                            updateApiTimeline(packet,$scope.apis[0]);
                        });
                        break;

                    case "names.api.election":
                        $scope.$apply(function() {
                            updateApiTimeline(packet,$scope.apis[1]);
                        });
                        break;

                    case "system.api.election":
                        $scope.$apply(function() {
                            updateApiTimeline(packet,$scope.apis[2]);
                        });
                        break;

                    case "intents.api.election":
                        $scope.$apply(function() {
                            updateApiTimeline(packet,$scope.apis[3]);
                        });
                        break;

                    default:
                        break;
                }
                break;
        }
    }

    var storeEvt =  function(event){
        if(event.newValue && $scope.recvToggle && $scope.enableOrNot === "enabled"){
            var date = Date.now();
            var id = date +'_'+ Math.floor(Math.random() * 10000);
            var packet = JSON.parse(event.key);
            for(var i in $scope.apis) {
                $scope.apis[i].electionGroups.update({
                    id: 'storageEvent',
                    content: 'storageEvent'
                });
                $scope.apis[i].elections.add({
                    id: id,
                    content: packet.data.action || packet.data.response,
                    style: (packet.data.action) ? "" : "background-color: yellow",
                    start: date,
                    group: 'storageEvent'
                });
                $scope.apis[i].storageEvents[id] =packet;
            }
        }
    };

    $scope.evtListener = null;
    $scope.enableOrNot = "disabled";

    $scope.toggle = function(){
        if ($scope.enableOrNot === "disabled"){
            $scope.enableOrNot = "enabled";
            $scope.evtListener = window.addEventListener("storage",storeEvt);
        } else {
            $scope.enableOrNot = "disabled";
            window.removeEventListener("storage",$scope.evtListener);
        }
        ozpIwc.defaultPeer.on("receive",logPacket);
        ozpIwc.defaultPeer.on("send",logPacket);
    };
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
                    stack:false,
                    maxHeight: "900px",
                    groupOrder: 'content'
                };

                // Create a Timeline
                $scope.timeline = new vis.Timeline($scope.container, $scope.data, $scope.options);

                $scope.timeline.on('select', function (properties) {

                    if(properties.items.length > 0){

                            var electionMsg = $scope.$parent.selectedElection.packets[properties.items[0]];
                            if(electionMsg){
                                $scope.$parent.packetContents = JSON.stringify(electionMsg,null,2);
                            } else{
                                var storageEvent = $scope.$parent.selectedElection.storageEvents[properties.items[0]];
                                $scope.$parent.packetContents = JSON.stringify(storageEvent,null,2);
                            }

                    } else {
                        $scope.$parent.packetContents = "";
                    }

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