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
    this.address="$nobody";
    this.replyCallbacks={};
    // coerce config.peerUrl to a function
    
    var configUrl=config.peerUrl;
    if(typeof(configUrl) === "string") {
        this.peerUrlCheck=function(url,resolve) {
            resolve(configUrl);
        };
    } else if(Array.isArray(configUrl)) {
        this.peerUrlCheck=function(url,resolve) {
            if(configUrl.indexOf(url) >= 0) {
                resolve(url);
            }
            resolve(configUrl[0]);
        };
    } else if(typeof(configUrl) === "function") {
        this.peerUrlCheck=configUrl;
    } else {
        throw new Error("PeerUrl must be a string, array of strings, or function");
    }
    
    
    this.autoPeer=("autoPeer" in config) ? config.autoPeer : true;
    this.msgIdSequence=0;

    this.events=new ozpIwc.Event();
    this.events.mixinOnOff(this);
    
    this.receivedPackets=0;
    this.receivedBytes=0;
    this.sentPackets=0;
    this.sentBytes=0;

    this.startTime=ozpIwc.util.now();
    
    this.launchParams={};
    
    this.readLaunchParams(window.name);
    this.readLaunchParams(window.location.search);
    this.readLaunchParams(window.location.hash);
    
    // @todo pull these from the names.api
    this.apiMap={
        "data.api" : { 'address': 'data.api',
            'actions': ["get","set","delete","watch","unwatch","list","addChild","removeChild"]
        },
        "system.api" : { 'address': 'system.api',
            'actions': ["get","set","delete","watch","unwatch","launch"]
        },
        "names.api" : { 'address': 'names.api',
            'actions': ["get","set","delete","watch","unwatch"]
        }, 
        "intents.api" : { 'address': 'intents.api',
            'actions': ["get","set","delete","watch","unwatch","register","invoke"]
        }
    };
    this.wrapperMap={};
    

    this.preconnectionQueue=[];

    if(this.autoPeer) {
        this.connect();
    }

};

ozpIwc.Client.prototype.readLaunchParams=function(rawString) {
    // of the form ozpIwc.VARIABLE=VALUE, where:
    //   VARIABLE is alphanumeric + "_"
    //   VALUE does not contain & or #
    var re=/ozpIwc.(\w+)=([^&#]+)/g;
    var m;
    while((m=re.exec(rawString)) !== null) {
        this.launchParams[m[1]]=JSON.parse(decodeURIComponent(m[2]));
    }
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
    if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
        if (!this.replyCallbacks[packet.replyTo](packet)) {
            this.cancelCallback(packet.replyTo);
        }
    } else {
        this.events.trigger("receive",packet);
    }
};
/**
 * Used to send a packet
 * @param {string} dst - where to send the packet
 * @param {object} entity - payload of the packet
 * @param {function} callback - callback for any replies. The callback will be
 * persisted if it returns a truth-like value, canceled if it returns a
 * false-like value.
 */
ozpIwc.Client.prototype.send=function(fields,callback,preexistingPromise) {
    var promise= preexistingPromise; // || new Promise();
    if(!(this.isConnected() || fields.dst=="$transport")) {
        // when send is switched to promises, create the promise first and return it here, as well
        this.preconnectionQueue.push({
            'fields': fields,
            'callback': callback,
            'promise': promise
        });
        return promise;
    }
    var now=new Date().getTime();
    var id="p:"+this.msgIdSequence++; // makes the code below read better
    var packet={
        ver: 1,
        src: this.address,
        msgId: id,
        time: now
    };

    for(var k in fields) {
        packet[k]=fields[k];
    }

    if(callback) {
        this.replyCallbacks[id]=callback;
    }
    var data=packet;
    if (!ozpIwc.util.structuredCloneSupport()) {
        data=JSON.stringify(packet);
    }
    this.peer.postMessage(data,'*');
    this.sentBytes+=data.length;
    this.sentPackets++;
    return packet;
};

ozpIwc.Client.prototype.isConnected=function(){
    return this.address !== "$nobody";
};
/**
 * Cancel a callback registration
 * @param (string} msgId - The packet replyTo ID for which the callback was registered
 */
ozpIwc.Client.prototype.cancelCallback=function(msgId) {
    var success=false;
    if (msgId) {
        delete this.replyCallbacks[msgId];
        success=true;
    }
    return success;
};


ozpIwc.Client.prototype.on=function(event,callback) {
    if(event==="connected" && this.isConnected()) {
        callback(this);
        return;
    }
    return this.events.on.apply(this.events,arguments);
};

ozpIwc.Client.prototype.off=function(event,callback) {
    return this.events.off.apply(this.events,arguments);
};

ozpIwc.Client.prototype.disconnect=function() {
    this.replyCallbacks={};
    window.removeEventListener("message",this.postMessageHandler,false);
    if(this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe=null;
    }
};


ozpIwc.Client.prototype.connect=function() {
    if(!this.connectPromise) {
        var self=this;
        this.connectPromise=new Promise(function(resolve) {
            self.peerUrlCheck(self.launchParams.peer,resolve);
        }).then(function(url) {
            self.peerUrl=url;
            self.peerOrigin=ozpIwc.util.determineOrigin(url);
            return self.findPeer();
        }).then(function() {
            this.postMessageHandler = function(event) {
                if(event.origin !== self.peerOrigin){
                    return;
                }
                try {
                    var message=event.data;
                    if (typeof(message) === 'string') {
                        message=JSON.parse(event.data);
                    }
                    self.receive(message);
                    self.receivedBytes+=(event.data.length * 2);
                    self.receivedPackets++;
                } catch(e) {
                    // ignore!
                }
            };
            // receive postmessage events
            window.addEventListener("message", this.postMessageHandler, false);
            return new Promise(function(resolve,reject) {
                self.send({dst:"$transport"},function(message) {
                    self.address=message.dst;
                    self.events.trigger("gotAddress",self);
                    resolve(self.address);
                });
            });
        }).then(function() {
            self.preconnectionQueue.forEach(function(p) {
                self.send(p.fields,p.callback,p.promise);
            });
            self.preconnectionQueue=null;
        }).then(function() {
            self.events.trigger("connected");
        }).catch(function(error) {
            console.log("Failed to connect to bus ",error);
        });
    }
    return this.connectPromise; 
};

ozpIwc.Client.prototype.createIframePeer=function(peerUrl) {
    var self=this;
    return new Promise(function(resolve,reject) {
        var createIframeShim=function() {
            self.iframe=document.createElement("iframe");
            self.iframe.addEventListener("load",function() {
                resolve();
            });
            self.iframe.src=peerUrl+"/iframe_peer.html";
            self.iframe.height=1;
            self.iframe.width=1;
            self.iframe.style.setProperty ("display", "none", "important");
            document.body.appendChild(self.iframe);
            self.peer=self.iframe.contentWindow;
            

        };
        // need at least the body tag to be loaded, so wait until it's loaded
        if(document.readyState === 'complete' ) {
            createIframeShim();
        } else {
            window.addEventListener("load",createIframeShim,false);
        }
    });
};

ozpIwc.Client.prototype.findPeer=function() {
    // check if we have a parent, get address there if so
//	if(window.parent!==window) {
//		this.peer=window.parent;
//		this.requestAddress();
//	} else {
    return this.createIframePeer(this.peerUrl);
//	}
};

(function() {
    ozpIwc.Client.prototype.api=function(apiName) {
        var wrapper=this.wrapperMap[apiName];
        if (!wrapper) {
            var api=this.apiMap[apiName];
            wrapper={};
            for (var i=0;i<api.actions.length;++i){
                var action=api.actions[i];
                wrapper[action]=augment(api.address,action,this);
            }
            
            this.wrapperMap[apiName]=wrapper;
        }
        wrapper.apiName=apiName;
        return wrapper;
    };

    var augment = function (dst,action,client) {
        return function (resource, fragment, otherCallback) {
            return new Promise(function (resolve, reject) {
                var packet = {
                    'dst': dst,
                    'action': action,
                    'resource': resource,
                    'entity': {}
                };
                for (var k in fragment) {
                    packet[k] = fragment[k];
                }
                client.send(packet, function (reply) {
                    if (reply.response === 'ok') {
                        resolve(reply);
                    } else if (/(bad|no).*/.test(reply.response)) {
                        reject(reply);
                    }
                    if (otherCallback) {
                        return otherCallback(reply);
                    }
                    return !!otherCallback;
                });
            });

                };
        return obj;
    };
})();