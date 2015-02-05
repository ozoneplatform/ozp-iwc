/* jshint unused:false */
// TestParticipant, FakePeer, and FakeRouter are used elsewhere.

//========================================================
// Fake peer that just stores the packets that it receives
//========================================================
var FakePeer = function() {
    this.events = new ozpIwc.Event();

    this.events.mixinOnOff(this);

    this.packets = [];
    this.send = function(packet) {
        this.packets.push(packet);
    };
};

//========================================================
// TestParticipant for connecting to a router
//========================================================
var TestParticipant = ozpIwc.util.extend(ozpIwc.InternalParticipant, function(config) {
    ozpIwc.InternalParticipant.apply(this, arguments);
    config = config || {};
    this.origin = config.origin || "foo.com";
    this.packets = [];
    this.sentPackets = [];
    // since we aren't connecting to a router, mock these out, too
    this.metricRoot = "testparticipant";
    this.sentPacketsMeter = ozpIwc.metrics.meter(this.metricRoot, "sentPackets");
    this.receivedPacketsMeter = ozpIwc.metrics.meter(this.metricRoot, "receivedPackets");
    this.forbiddenPacketsMeter = ozpIwc.metrics.meter(this.metricRoot, "forbiddenPackets");

    // mock common permission attributes (that would be assigned on router/multicast connections)
    this.events.trigger('connectedToRouter');


    this.router = {
        'send': function() {
        }
    };

    this.receiveFromRouter = function(packet) {
        this.packets.push(packet);
        return ozpIwc.InternalParticipant.prototype.receiveFromRouter.call(this, packet);
    };

    this.send = function(packet, callback) {
        packet = ozpIwc.InternalParticipant.prototype.send.call(this, packet, callback);
        this.sentPackets.push(packet);
        // tick to trigger the async send
        tick(0);
        return packet;
    };

    this.reply = function(originalPacket, packet, callback) {
        packet.ver = packet.ver || originalPacket.ver || 1;
        packet.src = packet.src || originalPacket.dst || this.address;
        packet.dst = packet.dst || originalPacket.src || config.dst;
        packet.msgId = packet.msgId || this.messageId++;
        packet.time = packet.time || new Date().getTime();

        packet.replyTo = originalPacket.msgId;

        packet.action = packet.action || originalPacket.action;
        packet.resource = packet.resource || originalPacket.resource;

        this.sentPackets.push(packet);

        if (callback) {
            this.callbacks[packet.msgId] = callback;
        }
        if (this.router) {
            this.router.send(packet, this);
        }
        return packet;
    };
});

var FakePeer = function() {
    this.events = new ozpIwc.Event();

    this.events.mixinOnOff(this);

    this.packets = [];
    this.send = function(packet) {
        this.packets.push(packet);
    };
};

//================================================
// Packetbuilders for testing API classes
//================================================
var TestPacketContext = ozpIwc.util.extend(ozpIwc.TransportPacketContext, function() {
    ozpIwc.TransportPacketContext.apply(this, arguments);
    var self = this;
    this.responses = [];
    this.router = {
        send: function(packet) {
            self.responses.push(packet);
        }
    };
});

var FakeRouter = function() {
    this.jitter = 0;
    this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);
    this.packetQueue=[];
    this.participants=[];
    this.send = function(packet) {
//        				console.log("Sending(" + packet.src + "): ",packet);

        if (this.packetQueue.length === 0 || Math.random() > this.jitter) {
            this.packetQueue.push(packet);
        } else {
//				console.log("JITTER!");
            this.packetQueue.splice(-1, 0, packet);
        }

    };
    this.registerParticipant = function(p) {
        p.connectToRouter(this, (this.participants.length + 1) + ".fake");
        this.participants.push(p);
    };
    this.pump = function() {
        var processed = 0;
        var recvFn = function(participants,packet) {
            participants.forEach(function(l){
                if (l.address !== packet.src) {
                    l.receiveFromRouter(new TestPacketContext({'packet': packet}));
                }
            });
        };
        while (this.packetQueue.length) {
            processed++;
            var packet = this.packetQueue.shift();
//				console.log("PACKET(" + packet.src + "): ",packet);
            recvFn(this.participants,packet);
            }
        return processed;
    };
    this.createMessage = function(m) {
        return m;
    };
    this.registerMulticast = function(participant,groups) {
        groups.forEach(function(groupName){
            participant.securityAttributes.pushIfNotExist('ozp:iwc:sendAs', groupName);
            participant.securityAttributes.pushIfNotExist('ozp:iwc:receiveAs', groupName);
        });
    };
};

// Assorted mock policies for PBAC testing. Fill the PRP Cache with this and ajax calls wont be needed!
var mockPolicies = {
    'policy/connectPolicy.json': {
        "policyId": "connectPolicy.json",
        "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
        "version": "1.0",
        "description": "Policy for Connection Allowances (testing)",
        "rule": [
            {
                "ruleId": "urn:ozp:iwc:xacml:rule:connect1",
                "description": "The following domains are white-listed to connect to the IWC bus.",
                "category": {
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": {
                        "ozp:iwc:origin": {
                            "attributeValue": [
                                "http://localhost:13000",
                                "http://localhost:15001",
                                "http://ozone-development.github.io"
                            ]
                        }
                    },
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": {
                        "ozp:iwc:bus": {
                            "attributeValue": ["$bus.multicast"]
                        }
                    },
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:action": {
                        "ozp:iwc:action": {
                            "attributeValue": ["connect"]
                        }
                    }
                }
            }
        ]
    },
    'policy/receiveAsPolicy.json': {
        "policyId": "urn:ozp:iwc:xacml:policy:connect1",
        "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
        "version": "1.0",
        "description": "Policy for SendingAs (testing)",
        "rule": [
            {
                "ruleId": "urn:ozp:iwc:xacml:rule:receiveAs",
                "description": "The following domains are white-listed to connect to the IWC bus.",
                "category": {
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":"ozp:iwc:address",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":"ozp:iwc:receiveAs",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:action":{
                        "ozp:iwc:action": {
                            "attributeValue": ["receiveAs"]
                        }
                    }
                }
            }
        ]
    },
    'policy/sendAsPolicy.json': {
        "policyId": "urn:ozp:iwc:xacml:policy:connect1",
        "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
        "version": "1.0",
        "description": "Policy for SendingAs (testing)",
        "rule": [
            {
                "ruleId": "urn:ozp:iwc:xacml:rule:sendAs",
                "description": "The following domains are white-listed to connect to the IWC bus.",
                "category": {
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":"ozp:iwc:address",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":"ozp:iwc:sendAs",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:action":{
                        "ozp:iwc:action": {
                            "attributeValue": ["sendAs"]
                        }
                    }
                }
            }
        ]
    },
    'policy/readPolicy.json': {
        "policyId": "urn:ozp:iwc:xacml:policy:read1",
        "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
        "version": "1.0",
        "description": "Policy for reading (testing)",
        "rule": [
            {
                "ruleId": "urn:ozp:iwc:xacml:rule:read",
                "description": "The following address can read if it has all of the security requirements.",
                "category": {
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":"ozp:iwc:address",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":"ozp:iwc:permissions",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:action": {
                        "ozp:iwc:action": {
                            "attributeValue": ["read", "write"]
                        }
                    }
                }
            }
        ]
    },
    'policy/apiNodePolicy.json': {
        "policyId": "urn:ozp:iwc:xacml:policy:apiNode1",
        "ruleCombiningAlgId": "urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides",
        "version": "1.0",
        "description": "Policy for API node access",
        "rule": [
            {
                "ruleId": "urn:ozp:iwc:xacml:rule:apiNode",
                "description": "The following node can be accessed if  all of the security requirements are met.",
                "category": {
                    "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject":"ozp:iwc:node",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:resource":"ozp:iwc:permissions",
                    "urn:oasis:names:tc:xacml:3.0:attribute-category:action":{
                        "ozp:iwc:action": {
                            "dataType": "http://www.w3.org/2001/XMLSchema#string",
                            "attributeValue": ["access"]
                        }
                    }
                }
            }
        ]
    }
};
