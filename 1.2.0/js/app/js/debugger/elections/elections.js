/* global debuggerModule */

debuggerModule.controller('ElectionCtrl', ['$scope', 'iwcClient', function (scope, client) {
    scope.logging = false;
    scope.blockBtns = false;
    scope.recvToggle = false;
    scope.ELECTION_TIME = ozpIwc.config.consensusTimeout;

    function isNewestPacket(packet, api) {
        {
            return api.lastElectionTS < packet.time;
        }
    }

    scope.graphData = {
        value: 'locks.api',
        title: 'locks Api',
        elections: new vis.DataSet(),
        electionGroups: new vis.DataSet(),
        electionPackets: {},
        busPackets: {},
        lastElectionTS: -Number.MAX_VALUE
    };

    scope.selectedElection = scope.graphData;

    scope.clear = function () {
        scope.graphData.elections.clear();
        scope.graphData.electionGroups.clear();
        scope.graphData.electionPackets = {};
        scope.graphData.busPackets = {};
    };

    function genTimelineData(packet) {
        var state = (packet.action === "election" && typeof(packet.entity.state) !== 'undefined' && Object.keys(packet.entity.state).length > 0);
        var timelineData = {
            id: packet.time,
            content: 'Election',
            start: new Date(packet.debuggerTime),
            end: new Date(packet.time + scope.ELECTION_TIME),
            group: packet.src,
            subgroup: "actual"
        };

        if (packet.entity.priority === -Number.MAX_VALUE) {
            timelineData.style = "background-color: gray";
            timelineData.content += '<label> Quitting </label> ';
        }

        switch (packet.action) {
            case "query":
                timelineData.style = "background-color: purple";
                timelineData.content = "<label>Leader Query</label>";
                break;
            case "victory":
                timelineData.style = "background-color: green";
                timelineData.content = "<label> Victory </label>";
                break;
        }

        if (state) {
            timelineData.style = "background-color: orange";
            timelineData.content += '</br><label> Contains State </label>';
        }
        if (packet.src === packet.entity.previousLeader) {
            timelineData.content += '</br><label> Was Leader </label>';

        }
        return timelineData;
    }

    function genTimelineOOS(packet) {
        return {
            id: packet.time,
            content: ' Out of Sync',
            start: new Date(packet.debuggerTime),
            end: new Date(packet.time + scope.ELECTION_TIME),
            group: packet.src,
            style: "background-color: yellow",
            subgroup: "actual"
        };
    }

    function updateApiTimeline(packet, api) {
        var timelineGroup = {
            id: packet.src,
            content: packet.src
        };


        var packetData = {
            id: packet.time,
            data: packet
        };

        api.electionGroups.update(timelineGroup);

        if (isNewestPacket(packet, api)) {
            api.elections.add(genTimelineData(packet));
            //} else if(outOfElectionWindow(packet,api)){
            //    api.elections.add(genTimelineDrop(packet));
        } else {
            api.elections.add(genTimelineOOS(packet));
        }
        if (packet.action === 'victory') {
            api.lastElectionTS = packet.time;
        }
        api.electionPackets[packetData.id] = packetData.data;
    }

    function logPacket(msg) {
        if (!scope.logging) {
            return;
        }
        var packet = msg.data;
        packet.debuggerTime = Date.now();
        var actions = ['election', 'victory', 'query'];
        if (actions.indexOf(packet.action) < 0) {
            if (scope.recvToggle) {
                plotNonElection(packet);
            }
            return;
        }

        if (packet.dst === "locks.api.consensus" || packet.src === "locks.api.consensus") {
            scope.$apply(function () {
                updateApiTimeline(packet, scope.graphData);
            });
        }
    }

    scope.evtListener = null;

    function plotNonElection(packet) {
        var date = Date.now();
        var id = date + '_' + Math.floor(Math.random() * 10000);
        scope.graphData.electionGroups.update({
            id: 'busPacket',
            content: 'Non-Election Packet'
        });
        scope.graphData.elections.add({
            id: id,
            content: packet.action || packet.response,
            style: (packet.action) ? "" : "background-color: yellow",
            start: date,
            group: 'busPacket'
        });
        scope.graphData.busPackets[id] = packet;
    }

    scope.logToggle = function(){
        scope.blockBtns = true;
        scope.logging = !scope.logging;
        var promise;
        if(scope.logging){
            promise = client.logTraffic(logPacket).then(function(msgId){
                scope.logId = msgId;
            });
        } else {
            promise = client.cancelLogTraffic(scope.logId);
        }

        promise.then(function(){
            scope.$apply(function(){
                scope.blockBtns = false;
            });
        });
    };
}]);

debuggerModule.directive("elections", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/elections.tpl.html'
    };
}]);

debuggerModule.directive("electionsContent", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/electionsContent.tpl.html'
    };
}]);

debuggerModule.directive("electionsToolbar", [function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/electionsToolbar.tpl.html'
    };
}]);
