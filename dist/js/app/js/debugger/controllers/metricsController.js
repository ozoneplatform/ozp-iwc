/* global debuggerModule */
debuggerModule.controller("metricsController",['$scope','$interval',function(scope,$interval) {
    scope.updateFrequency=1000;
    scope.updateActive=true;
    scope.metrics=[];
    var metricsByName={};
    
    var ensureGroup=function(name) {
//        if(scope.groupVisibility[name]===undefined) {
//            scope.groupVisibility[name]=(name.match("participants.*receivedPackets.rate1m")!==null);
//        }
        if(metricsByName[name]===undefined) {
            var metricDef={
                name: name,
                visible: false
            };
            scope.metrics.push(metricDef);
            metricsByName[name]=metricDef;
        }

    };
    var pushDataPoint=function(dataPoints,name,time,value) {
        ensureGroup(name);
        dataPoints.push({
            group: name,
            x: time,
            y: value
        });
    };
    scope.refresh=function(){
        var dataPoints=[];
        var nowDate=new Date();
        ozpIwc.metrics.allMetrics().forEach(function(m) {
            var value=m.get();
            if(typeof value==="object") {
                for(var k in value) {
                    pushDataPoint(dataPoints,m.name+"."+k,nowDate,value[k]);
                }
            } else {
                pushDataPoint(dataPoints,m.name,nowDate,value);
            }
        });
        scope.$broadcast('timeSeriesData',dataPoints);
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
