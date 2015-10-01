var bouncing = bouncing || {};
bouncing.balls= bouncing.balls || {};
bouncing.ourBalls = bouncing.ourBalls || [];
bouncing.currentColor=bouncing.currentColor || "black";

$(document).ready(function(){
    var colors=$("#ballColor option");

    var params=ozpIwc.util.parseQueryParams();

    bouncing.currentColor=params['color'] || colors[Math.floor(Math.random() * colors.length)].value;
    $("#ballColor").val(bouncing.currentColor);

    var setBallsColor=function(color) {
        $('#viewport rect')[0].setAttribute("fill",color);
        for(var i=0;i<bouncing.ourBalls.length;++i) {
            bouncing.ourBalls[i].state.color=color;
        }
    };

    setBallsColor(bouncing.currentColor);

    $("#ballColor").change(function(e) {
        var color=e.target.value;
        setBallsColor(color);
    });


    ozpIwc.util.setInterval(function() {
		var elapsed=(ozpIwc.util.now()-client.startTime)/1000;

		$('#averageLatencies').text(
			"Pkt/sec [sent: " + (client.sentPackets/elapsed).toFixed(1) + ", " +
			"received: " + (client.receivedPackets/elapsed).toFixed(1) + "]"
		);
	},1000);
});

var client=new ozpIwc.Client({
    peerUrl:"http://" + window.location.hostname + ":13000",
    enhancedTimers: true
});
client.connect().then(function(){
	// setup
	var viewPort=$('#viewport');
    var fps=20;
    $('#myAddress').text(client.address);
    $('#fps').text(""+fps);
	//=================================================================
	// cleanup when we are done
	window.addEventListener("beforeunload",function() {
		for(var i=0;i<bouncing.ourBalls.length;++i) {
            bouncing.ourBalls[i].cleanup();
		}
	});

	//=================================================================
	// Animate our balls
	var lastUpdate=new Date().getTime();
	var animate=function() {
		var now=new Date().getTime();
		var delta=(now-lastUpdate)/1000.0;
		for(var i=0;i<bouncing.ourBalls.length;++i) {
            bouncing.ourBalls[i].tick(delta);
		}
		lastUpdate=now;
	};

	ozpIwc.util.setInterval(animate,1000/fps);


    //=================================================================
    // add our ball
    //=================================================================
    client.data().addChild("/balls",{}).then(function(packet){
        bouncing.ourBalls.push(new BallPublisher({
            resource:packet.entity.resource,
            iwcClient: client
        }));
    })['catch'](function(err){
        console.log("Failed to push our ball: " + JSON.stringify(err,null,2));
    });

	//=================================================================
	// listen for balls changing
    //=================================================================
	var onBallsChanged=function(reply) {
        reply.entity.newCollection.forEach(function(b) {
            //If the ball does not exist, create it.
            bouncing.balls[b]= bouncing.balls[b] || new Ball(b,viewPort,client);
        });

	};

    client.data().watch("/balls",{pattern: "/balls/"},onBallsChanged).then(function(reply){
        //watch request resolve the resource if it exists
        reply.collection.forEach(function(b) {
            //If the ball does not exist, create it.
            bouncing.balls[b]= bouncing.balls[b] || new Ball(b,viewPort,client);
        });
    });
});
