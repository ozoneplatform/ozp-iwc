var Sibilant=Sibilant || {};


Sibilant.Client=function(config) {
	config=config || {};
	this.participantId="$nobody";
	this.replyCallbacks={};
	this.peerUrl=config.peerUrl;
	this.autoPeer=("autoPeer" in config) ? config.autoPeer : true;
	// TODO: accept a list of peer URLs that are searched in order of preference

	this.events=new Sibilant.Event();
	var self=this;

	if(this.autoPeer) {
		this.findPeer();
	}
	
	// receive postmessage events
	window.addEventListener("message", function(event) {
		if(event.origin !== self.peerUrl){
			return;
		}
		self.receive(event.data);
	}, false);
};

Sibilant.Client.prototype.receive=function(packet) {
		if(packet.reply_to && this.replyCallbacks[packet.reply_to]) {
			this.replyCallbacks[packet.reply_to](packet);
		} else {
			this.events.trigger("receive",packet);
		}	
};

Sibilant.Client.prototype.send=function(dst,entity,callback) {
	var now=new Date().getTime();
	var id=now; // makes the code below read better

	var packet={
		ver: 1,
		src: this.participantId,
		dst: dst,
		msg_id: id,
		time: now,
		entity: entity
	};

	if(callback) {
		this.replyCallbacks[id]=callback;
	}

	this.peer.postMessage(packet,'*');
};

Sibilant.Client.prototype.on=function(event,callback) {
	if(event==="connected" && this.participantId !=="$nobody") {
		callback(this);
		return;
	}
	return this.events.on.apply(this.events,arguments);
};

Sibilant.Client.prototype.off=function(event,callback) { 
	return this.events.off.apply(this.events,arguments);
};

Sibilant.Client.prototype.disconnect=function() {
	if(this.iframe) {
		document.body.removeChild(this.iframe);
	}
};

Sibilant.Client.prototype.createIframePeer=function(peerUrl) {
	var self=this;
	var createIframeShim=function() {
		self.iframe=document.createElement("iframe");
		self.iframe.src=peerUrl+"/iframe_peer.html";
		self.iframe.height=1;
		self.iframe.width=1;
		self.iframe.style="display:none !important;";
		self.iframe.addEventListener("load",function() { self.requestAddress(); },false);	
		document.body.appendChild(self.iframe);
		self.peer=self.iframe.contentWindow;

	};
	// need at least the body tag to be loaded, so wait until it's loaded
	if(document.readyState === 'complete' ) {
		createIframeShim();
	} else {
		window.addEventListener("load",createIframeShim,false);
}
};

Sibilant.Client.prototype.findPeer=function() {
	// check if we have a parent, get address there if so
	if(window.parent!==window) {
		this.peer=window.parent;
		this.requestAddress();
	} else {
		this.createIframePeer(this.peerUrl);
	}
};

Sibilant.Client.prototype.requestAddress=function(){
	// send connect to get our address
	var self=this;
	this.send("$transport",{},function(message) {
		self.participantId=message.dst;
		self.events.trigger("connected",self);
	});
};