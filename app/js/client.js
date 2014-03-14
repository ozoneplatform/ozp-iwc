var Sibilant=Sibilant || {};


Sibilant.Client=function(peerUrl) {
	this.participantId="$nobody";
	var replyCallbacks={};

	this.send=function(dst,message,callback) {
		var id=new Date().getTime();
		var packet={
			ver: 1,
			src: this.participantId,
			dst: dst,
			msg_id: id,
			time: new Date().getTime(),
			entity: message
		};

		if(callback) {
			replyCallbacks[id]=callback;
		}

		this.peer.postMessage(packet,'*');
	};
	var events=new Sibilant.Event();
	
	this.on=function(event,callback) {
		if(event==="connected" && this.participantId !=="$nobody") {
			callback(this);
		}
		events.on(event,callback);
	};
	this.off=function(event,callback) { 
		events.off(event,callback);
	};
	this.disconnect=function() {
		if(this.iframe) {
			document.body.removeChild(this.iframe);
		}
	};

	// receive postmessage events
	window.addEventListener("message", function(event) {
		var message=event.data;

		if(message.reply_to && replyCallbacks[message.reply_to]) {
			replyCallbacks[message.reply_to](message);
		} else {
			events.trigger("receive",message);
		}
	}, false);

	var self=this;
	var getAddress=function(){ 
		// send connect to get our address
		self.send("$transport",{},function(message) {
			self.participantId=message.dst;
			events.trigger("connected",self);
		});
	};

	if(window.parent!==window) {
		this.peer=window.parent;
		getAddress();
	} else {
		var createIframeShim=function() {
			self.iframe=document.createElement("iframe");
			self.iframe.src=peerUrl+"/iframe_peer.html";
			self.iframe.height=1;
			self.iframe.width=1;
			self.iframe.style="display:none !important;";
			self.iframe.addEventListener("load",getAddress,false);	
			document.body.appendChild(self.iframe);
			self.peer=self.iframe.contentWindow;

		};
		if(document.readyState === 'complete' ) {
			createIframeShim();
		} else {
			window.addEventListener("load",createIframeShim,false);
		}
	}
};
