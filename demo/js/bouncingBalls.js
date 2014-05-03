
var balls={};

var Ball=function(ballRef,svgElement) {
	this.svg=svgElement;
	this.el=document.createElementNS("http://www.w3.org/2000/svg", 'g');
	this.el.setAttribute("class","ball");

	this.circle=document.createElementNS("http://www.w3.org/2000/svg", 'circle');
	this.el.appendChild(this.circle);
	
	this.label=document.createElementNS("http://www.w3.org/2000/svg", 'text');
	this.label.setAttribute("class","svgHidden");
	this.el.appendChild(this.label);
	
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
			self.label.textContent=packet.resource;
		}
	});
	
	$(this.el).click(function() {
		if(self.label.getAttribute("class").match("svgHidden")) {
			self.label.setAttribute("class","");
		}else {
			self.label.setAttribute("class","svgHidden");
		}
	});	
	this.watchId=packet.msgId;	
};

Ball.prototype.draw=function(info) {
	if(!info) {
		this.remove();
	}
	
	this.el.setAttribute("transform","translate(" + info.x +","+ info.y + ")");
//	this.el.setAttribute("y",info.y);
	this.circle.setAttribute("r",info.r);
  this.circle.setAttribute("fill",info.color);
	this.label.setAttribute("x",info.r  + 5);
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


var extents={
	minX: 0,
	minY: 0,
	maxX: 1000,
	maxY: 1000
};

var AnimatedBall=function(config) {
	config = config || {};
	this.state={
		x: 100+Math.floor(Math.random()*100),
		y: 100+Math.floor(Math.random()*100),
		vx: -100+Math.floor(Math.random()*200),
		vy: -100+Math.floor(Math.random()*200),
		r: 25+Math.floor(Math.random()*50),
		color: 'black',
		owner: config.owner
	};
	this.resource=config.resource;
	
	this.tick=function(delta) {
		var ball=this.state;
		ball.x+=delta*ball.vx;
		ball.y+=delta*ball.vy;

		if(ball.x-ball.r <= extents.minX || ball.x+ball.r >= extents.maxX) {
			ball.vx=-ball.vx;
		}
		if(ball.y-ball.r <= extents.minY || ball.y+ball.r >= extents.maxY) {
			ball.vy=-ball.vy;
		}

		client.send({
			dst: "keyValue.api",
			action: "set",
			resource: this.resource,
			entity: this.state
		});
	};
	this.cleanup=function() {
		client.send({
			dst: "keyValue.api",
			action: "delete",
			resource: this.resource
		});		
	};
};

var ourBall=new AnimatedBall();

$(document).ready(function(){
	var colors=$("#ballColor option");
	var thisColor=colors[Math.floor(Math.random() * colors.length)].value;
	$("#ballColor").val(thisColor);
		ourBall.state.color=thisColor;
	
	$("#ballColor").change(function(e) {
		var color=e.target.value;
		$('#viewport rect')[0].setAttribute("fill",color);
		ourBall.state.color=color;
	});
});

var client=new sibilant.Client({peerUrl:"http://localhost:13000"});

client.on("connected",function() {
	var viewPort=$('#viewport');
	$('#myAddress').text(client.participantId);
	ourBall.resource="/balls/" + client.participantId;
	
	window.addEventListener("beforeunload",function() {
		ourBall.cleanup();
	});

	//animation timer
	var lastUpdate=new Date().getTime();
	window.setInterval(function() {
		var now=new Date().getTime();
		var delta=(now-lastUpdate)/1000.0;
		ourBall.tick(delta);
		lastUpdate=now;
	},50);
		
	var watchRequest={
		dst: "keyValue.api",
		action: "watch",
		resource: "/balls"
	};

	client.send(watchRequest,function(reply) {
		if(reply.action==="changed") {
			var newBalls=reply.entity.newValue;
			for(var i=0;i<newBalls.length;++i) {
				if(!(newBalls[i] in balls)) {
					balls[newBalls[i]]=new Ball(newBalls[i],viewPort);
				}
			}
		}
	});
	
	// register our ball
	client.send({
		dst: "keyValue.api",
		action: "push",
		resource: "/balls",
		entity: ourBall.resource
	});
});
