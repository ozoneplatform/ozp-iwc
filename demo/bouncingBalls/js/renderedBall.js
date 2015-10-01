var bouncing = bouncing || {};
bouncing.balls= bouncing.balls || {};
bouncing.currentColor = bouncing.currentColor || "black";
/**
 * A renderer for Ball data received from the IWC Data Api. Registers a watch on the given resource path for updates.
 * @Class Ball
 * @param {String} ballRef the Data api resource path to this ball
 * @param {Object} svgElement The svg to draw the ball on.
 * @param {ozpIwc.Client} iwcClient reference to an IWC client to gather information with
 * @constructor
 */
var Ball=function(ballRef,svgElement,iwcClient) {
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
	this.iwc=iwcClient;
	this.packets=0;
	this.lastUpdate=ozpIwc.util.now();
	this.updateDelta=0;
	this.updateCount=0;
	this.refreshed = false;
	var self=this;

	var onBallChange = function(reply) {
		self.packets++;
		var now=ozpIwc.util.now();
		self.totalLatency+=now-reply.time;
		self.refreshed = true;
		self.draw(reply.entity.newValue);
	};

	this.iwc.data().watch(ballRef,onBallChange).then(function(response){
		self.watchData = {
			msgId: response.replyTo,
			src: response.dst
		}
	});

	this.removeWatchdog = function(){
		if(self.refreshed){
			self.refreshed = false;
			return;
		} else {
			var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
			svgimg.setAttribute('height','200');
			svgimg.setAttribute('width','200');
			svgimg.setAttribute('id','testimg2');
			svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href','explosion.gif');
			svgimg.setAttribute('x','-100');
			svgimg.setAttribute('y','-100');
			self.el.appendChild(svgimg);
			self.circle.setAttribute("class","svgHidden");
			ozpIwc.util.setTimeout(function(){
				self.remove();
			},500);
		}
	};
	this.interval = setInterval(this.removeWatchdog,19000);

	$(this.el).click(function() {
		if(self.label.getAttribute("class").match("svgHidden")) {
			self.label.setAttribute("class","");
		}else {
			self.label.setAttribute("class","svgHidden");
		}
	});
};

/**
 * Draws the ball updates on the canvas
 * @method draw
 * @param info
 */
Ball.prototype.draw=function(info) {
	if(!info) {
		this.remove();
	}
	var now=ozpIwc.util.now();
	this.updateDelta+=now-this.lastUpdate;
	this.updateCount++;
	this.lastUpdate=now;

	this.el.setAttribute("transform","translate(" + info.x +","+ info.y + ")");
//	this.el.setAttribute("y",info.y);
	this.circle.setAttribute("r",info.r);
	this.circle.setAttribute("fill",info.color);
	this.label.setAttribute("x",info.r  + 5);
	this.label.textContent=info.label
		+ "[pkt=" + this.packets
		+ ",updateAvg=" + Math.floor(this.updateDelta/this.updateCount) + "ms"
//			+ ",avg=" + (this.totalLatency/this.packets).toPrecision(2)
		+']';

};

/***
 * Removes this ball from the canvas. Sends notification to the data API to stop sending updates about the ball.
 * @method remove
 */
Ball.prototype.remove=function() {
    clearInterval(this.interval);

	this.iwc.data().unwatch(this.ballResource,this.watchData);

	this.el.setAttribute('display','none');
	delete bouncing.balls[this.ballResource];
};


/**
 * A ball generator. This will create a ball, periodically update its position, and send this data to the IWC Data Api.
 * This does not draw the ball, rather just sends out the data. Drawing occurs when the ball data returns from the IWC
 * in the "Ball" object. There are many "Ball"s (1 per ball on the bus per bouncing balls window opened) but only 1
 * "BallPublisher" per ball per bus.
 *
 * @class BallPublisher
 * @param config
 * @constructor
 */
var BallPublisher=function(config) {
	config = config || {};
	this.state={
		x: 100+Math.floor(Math.random()*100),
		y: 100+Math.floor(Math.random()*100),
		vx: -100+Math.floor(Math.random()*200),
		vy: -100+Math.floor(Math.random()*200),
		r: 25+Math.floor(Math.random()*50),
		color: bouncing.currentColor,
		owner: config.owner,
		label: config.resource
	};
	this.resource=config.resource;
    this.iwc=config.iwcClient;
	this.onTick=config.onTick || function() {};

	var extents={
		minX: 0,
		minY: 0,
		maxX: 1000,
		maxY: 1000
	};
    var self = this;
	/**
	 * Recalculates the ball's position and updates its resource on the Data Api.
	 *
	 * @method tick
	 * @param {Number} delta the time delta from last update.
	 */
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
		ball.x=Math.max(ball.x,extents.minX+ball.r);
		ball.x=Math.min(ball.x,extents.maxX-ball.r);
		ball.y=Math.max(ball.y,extents.minY+ball.r);
		ball.y=Math.min(ball.y,extents.maxY-ball.r);


		self.iwc.data().set(this.resource,{
			entity: ball,
            respondOn: "none",
            'lifespan': "bound"
		})['catch'](function(err){
            console.error(err);
        });
	};

	/**
	 * Removes the ball's resource from the Data Api. All watchers will cease to receive information on this ball unless
	 * it is recreated.
	 *
	 * @method cleanup
	 * @returns {*}
	 */
	this.cleanup=function() {
		return self.iwc.data().delete(this.resource);
	};
};
