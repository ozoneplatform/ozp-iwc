

var Ball=function(ballRef,svgElement) {
	this.svg=svgElement;
	this.el=this.svg.append('circle');
	this.ballResource=ballRef;

	var watchRequest={
		dst: "keyValue.api",
		action: "watch",
		resource: ballRef
	};
	
	var packet=client.send(watchRequest,function(packet) {
		self.draw(packet.entity);
	});
	
	this.watchId=packet.msgId;	
};

Ball.prototype.draw=function(info) {
	this.el.attr("cx",info.x);
	this.el.attr("cy",info.y);
	this.el.attr("r",info.r);
	this.el.style("background-color",info.color);
};

Ball.prototype.remove=function() {
	client.send({
		dst: "keyValue.api",
		action: "unwatch",
		replyTo: this.watchId
	});
	this.el.remove();
};


var client=new sibilant.Client({peerUrl:"http://localhost:13000"});

client.on("connected",function() {
	var viewPort=$('#viewport');

	var ballResource="/balls/" + client.participantId;
	
	var ball={
		x: 1,
		y: 1,
		vx: 1,
		vy: 1,
		r: 10,
		color: 'BADA55'
	};
	
	var extents={
		minX: 0,
		minY: 0,
		maxX: 1000,
		maxY: 1000
	};

	var updateBall=function() {
		client.send({
			dst: "keyValue.api",
			action: "set",
			resource: ballResource,
			entity: ball
		});		
	};
	
	updateBall();
	
	//animation timer
	window.setInterval(function() {
		ball.x+=ball.vx;
		ball.y+=ball.vy;
		if(ball.x-ball.r < 0) {
			ball.vx=-ball.vx;
		}
		if(ball.x-ball.r < extents.minX || ball.x+ball.r > extents.maxX) {
			ball.vx=-ball.vx;
		}
		if(ball.y-ball.r < extents.minY || ball.y+ball.r > extents.maxY) {
			ball.vy=-ball.vy;
		}
		updateBall();
	},200);
	
	var watchRequest={
		dst: "keyValue.api",
		action: "watch",
		resource: "/balls"
	};

	client.send(watchRequest,function(reply) {
		updateBalls(reply.entity.newValue);
	});
	
	// register our ball
	client.send({
		dst: "keyValue.api",
		action: "push",
		resource: "/balls",
		entity: ballResource
	});

	var balls=[];
	var updateBalls=function(newBalls) {
		for(var i=0;i<balls.length;++i) {
			balls[i].remove();
		}
		balls=[];
		for(var i=0;i<newBalls.length;++i) {
			balls.push(new Ball(newBalls[i],viewPort));
		}
	};

});
