var ozpIwc=ozpIwc || {};

/**
 * @class
 * This class will be heavily modified in the future.
 *
 * @todo accept a list of peer URLs that are searched in order of preference
 * @param {object} config
 * @param {string} config.peerUrl - Base URL of the peer server
 * @param {boolean} [config.autoPeer=true] - Whether to automatically find and connect to a peer
 */
ozpIwc.Client=function(config) {
	config=config || {};
	this.participantId="$nobody";
	this.peerUrl=config.peerUrl;
	var a=document.createElement("a");
	a.href = this.peerUrl;
	this.replyCallbacks={};
    this.promises={};
	this.peerOrigin=a.protocol + "//" + a.hostname;
	if(a.port)
		this.peerOrigin+= ":" + a.port;
	
	
	this.autoPeer=("autoPeer" in config) ? config.autoPeer : true;
	this.msgIdSequence=0;
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
	this.receivedPackets=0;
	this.receivedBytes=0;
	this.sentPackets=0;
	this.sentBytes=0;
	this.startTime=ozpIwc.util.now();
	var self=this;

	if(this.autoPeer) {
		this.findPeer();
	}
	
	// receive postmessage events
	this.messageEventListener=window.addEventListener("message", function(event) {
		if(event.origin !== self.peerOrigin){
			return;
		}
		try {
			self.receive(JSON.parse(event.data));
			self.receivedBytes+=(event.data.length * 2);
			self.receivedPackets++;		
		} catch(e) {
			// ignore!
		}
	}, false);
};

/**
 * Receive a packet from the connected peer.  If the packet is a reply, then
 * the callback for that reply is invoked.  Otherwise, it fires a receive event
 * @fires ozpIwc.Client#receive
 * @protected
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.Client.prototype.receive=function(packet) {
    if(packet.replyTo) {
        if (this.replyCallbacks[packet.replyTo]) {
            this.replyCallbacks[packet.replyTo](packet);
        }
        if (this.promises[packet.replyTo]) {
            this.promises[packet.replyTo].setReply(packet);
        }
    } else {
        this.events.trigger("receive",packet);
    }
};
/**
 * Used to send a packet
 * @param {string} dst - where to send the packet
 * @param {object} entity - payload of the packet
 * @param {function} callback - callback for any replies
 */
ozpIwc.Client.prototype.send=function(fields,config) {
    var now=new Date().getTime();
    var id="p:"+this.msgIdSequence++; // makes the code below read better

    var packet={
        ver: 1,
        src: this.participantId,
        msgId: id,
        time: now
    };

    for(var k in fields) {
        packet[k]=fields[k];
    }

    var retVal={};
    if (config && config.oneTime) {
        var promise = this.makePromise(id);
        this.promises[id]=promise;
        retVal.promise = promise;
    } else if (config && config.callback) {
        this.replyCallbacks[id]=config.callback;
    }
    var data=JSON.stringify(packet);
    this.peer.postMessage(data,'*');
    this.sentBytes+=data.length;
    this.sentPackets++;
    retVal.packet=packet;
    retVal.msgId=id;
    return retVal;
};

ozpIwc.Client.prototype.makePromise=function(msgId) {
    var resolveCB=null;
    var promise=new Promise(function(resolve,reject) {
      resolveCB=resolve;
    });
    promise.setReply=function(packet) {
        resolveCB(packet);
    }
    return promise;
};

ozpIwc.Client.prototype.cancelCallback=function(msgId,oneTime) {
    if (oneTime) {
        this.promises[msgId].setReply();
        this.promises[msgId]=undefined;
    } else {
        this.replyCallbacks[msgId]=undefined;
    }
};


ozpIwc.Client.prototype.on=function(event,callback) {
    if(event==="connected" && this.participantId !=="$nobody") {
        callback(this);
        return;
    }
    return this.events.on.apply(this.events,arguments);
};

ozpIwc.Client.prototype.off=function(event,callback) {
    return this.events.off.apply(this.events,arguments);
};

ozpIwc.Client.prototype.disconnect=function() {
    window.removeEventListener("message",this.messageEventListener,false);
    if(this.iframe) {
        document.body.removeChild(this.iframe);
    }
};

ozpIwc.Client.prototype.createIframePeer=function(peerUrl) {
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

ozpIwc.Client.prototype.findPeer=function() {
    // check if we have a parent, get address there if so
//	if(window.parent!==window) {
//		this.peer=window.parent;
//		this.requestAddress();
//	} else {
    this.createIframePeer(this.peerUrl);
//	}
};

ozpIwc.Client.prototype.requestAddress=function(){
    // send connect to get our address
    var self=this;
    this.send({dst:"$transport"}, {oneTime:true}).promise.then(function(reply) {
        self.participantId=reply.dst;
        self.events.trigger("connected",self);
    });
};