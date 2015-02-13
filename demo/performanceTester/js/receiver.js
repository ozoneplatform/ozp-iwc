$(function() {
var now = function() { return Date.now();};
//if(typeof performance.now === "function") {
//    now=function() { return performance.now();};
//}


var dataSet=new vis.DataSet();

var LS_LATENCY=1;
var LS_RATE=2;
    
var groups=new vis.DataSet([{
  id: LS_LATENCY,
  content: "LocalStorage latency"
},{
    id: LS_RATE,
    content: "LocalStorage pkts/sec",
    options: {
        yAxisOrientation: 'right', // right, left
        drawPoints: false
    }
}]);

var graphOptions={
    legend: true,
    start: new Date(),
    end: new Date(Date.now() + 60000),
    zoomMax: 60000
};

var graph=new vis.Graph2d(document.getElementById('graph'),dataSet,groups,graphOptions);

window.setInterval(function() {
    graph.moveTo(new Date());
},1000);


var startTime=null;
var lsCount=0;
window.addEventListener('storage', function(event) {
    if(!event.newValue || event.key ==="pong") { return; }
    var n=now();
    if(!startTime) { startTime=n;}
    lsCount++;
    if(event.key === "ping") {
        localStorage.setItem("pong",n);
        localStorage.removeItem("pong");
    }
    
    var sent=parseFloat(event.newValue);
    var latency = n - sent;
    var nowDate=new Date();
    dataSet.add({
        group: LS_LATENCY,
        x: nowDate,
        y: latency
    });
    var elapsed=(n-startTime);
    if(elapsed > 500) {
        dataSet.add({
            group: LS_RATE,
            x: nowDate,
            y: (lsCount*1000.0)/elapsed
        });
    }
    
}, false);



//window.addEventListener('message', function(event) {
//    var latency = now() - event.data;
//    
//}, false);

});