
var balls={};

var Ball=function(ballRef,svgElement) {
	this.svg=svgElement;
	this.el=document.createElementNS("http://www.w3.org/2000/svg", 'circle');
	this.svg.append(this.el);
	this.ballResource=ballRef;

	var watchRequest={
		dst: "keyValue.api",
		action: "watch",
		resource: ballRef
	};
	var self=this;
	var packet=client.send(watchRequest,function(packet) {
		if(packet.action==="changed") {
			self.draw(packet.entity.newValue);
		}
	});
	
	this.watchId=packet.msgId;	
};

Ball.prototype.draw=function(info) {
	if(!info) {
		this.remove();
	}
	this.el.setAttribute("cx",info.x);
	this.el.setAttribute("cy",info.y);
	this.el.setAttribute("r",info.r);
  this.el.setAttribute("fill",info.color);
};

Ball.prototype.remove=function() {
	client.send({
		dst: "keyValue.api",
		action: "unwatch",
		replyTo: this.watchId
	});
	this.el.remove();
	delete balls[this.ballResource];
};


var client=new sibilant.Client({peerUrl:"http://localhost:13000"});

client.on("connected",function() {
	var viewPort=$('#viewport');

	var ballResource="/balls/" + client.participantId;

	var colors=[
		'red',
		'blue',
		'black',
		'green',
		'brown',		
		'#BADA55'
	];
	var thisColor=colors[Math.floor(Math.random() * colors.length)];
	$('#viewport rect')[0].setAttribute("fill",thisColor);

	var ball={
		x: 100+Math.floor(Math.random()*100),
		y: 100+Math.floor(Math.random()*100),
		vx: -5+Math.floor(Math.random()*11),
		vy: -5+Math.floor(Math.random()*11),
		r: 5+Math.floor(Math.random()*15),
		color: thisColor
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
	window.addEventListener("beforeunload",function() {
		client.send({
			dst: "keyValue.api",
			action: "delete",
			resource: ballResource
		});
		
	});
	//animation timer
	window.setInterval(function() {
		ball.x+=ball.vx;
		ball.y+=ball.vy;

		if(ball.x-ball.r <= extents.minX || ball.x+ball.r >= extents.maxX) {
			ball.vx=-ball.vx;
		}
		if(ball.y-ball.r <= extents.minY || ball.y+ball.r >= extents.maxY) {
			ball.vy=-ball.vy;
		}
		updateBall();
	},250);
	

	var updateBalls=function(newBalls) {
		for(var i=0;i<newBalls.length;++i) {
			if(!(newBalls[i] in balls)) {
				balls[newBalls[i]]=new Ball(newBalls[i],viewPort);
			}
		}
	};
	
	var watchRequest={
		dst: "keyValue.api",
		action: "watch",
		resource: "/balls"
	};

	client.send(watchRequest,function(reply) {
		if(reply.action==="changed") {
			updateBalls(reply.entity.newValue);
		}
	});
	
	// register our ball
	client.send({
		dst: "keyValue.api",
		action: "push",
		resource: "/balls",
		entity: ballResource
	});



});
