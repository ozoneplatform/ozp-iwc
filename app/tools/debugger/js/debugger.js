
sibilant.keyValueApi=new sibilant.LeaderGroupParticipant({
	name: "keyValue.api",
	target: new sibilant.KeyValueApi(),
	priority: 100
});

sibilant.defaultRouter.registerParticipant(sibilant.keyValueApi);
sibilant.defaultRouter.registerMulticast(sibilant.keyValueApi,["keyValue.api"]);
		

var client=new sibilant.InternalParticipant();
sibilant.defaultRouter.registerParticipant(client);

//===============================================================================================
// Log tab
//===============================================================================================

// set value to "hidden" to hide the column
var logColumnsShown={
	dateString: "",
	srcPeer: "hidden",
	sequence: "hidden",
	dst: "",
	src: "",
	msgId: "",
	replyTo: "",
	action: "",
	resource: "",
	contentType: ""
};

var packetCapture=false;
function togglePacketCapture() {
	packetCapture=!packetCapture;
	$("#togglePacketCapture").text(packetCapture?"Stop Capture":"Start Capture");
}

function clearPacketCapture() {
	$("#messages tr.summary, tr.packet").remove();
}

function updateLogColumns() {
	for(var k in logColumnsShown) {
		if(logColumnsShown[k]==="") {
			$("."+k).removeClass("hidden");
		} else {
			$("."+k).addClass("hidden");
		}
	}
}

function filterPacket(packet) {
	var filter=$('#packetCaptureFilter').val();
	var clauses=filter.split("&&");
	var regex=/^\s*([\w\.]+)(.*)"(.*)"\s*$/;

	for(var i=0; i< clauses.length; ++i) {
		var match=regex.exec(clauses[i]);
		if(!match) {
			$('#packetCaptureFilter').css("background-color","lightred");
		} else {
			var path=match[1].split(".");
			var value=packet;
			while(path.length) {
				var p=path.shift();
				if(typeof(value[p]) === "undefined") {
					return false;
				}
				value=value[p];
			}
			switch(match[2]) {
				case "==":
					if(match[3]!==value) {
						return false;
					}
					break;
				default:
					break;
			}
		}
	}
	return true;
}

function logPacket(msg) {
	if(!packetCapture) {
		return;
	}
	var packet=msg.packet;
	
	if(!filterPacket(packet)) {
		return;
	}	
	
	var date=new Date(packet.data.time);
	var dateString=date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " +
					date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();

	$("#messages").append( 
			'<tr class="summary">'+
				'<td class="dateString '+ logColumnsShown.dateString +'">'+dateString+'</td>'+
				'<td class="srcPeer '+ logColumnsShown.srcPeer +'">'+packet.src_peer+'</td>'+
				'<td class="sequence '+ logColumnsShown.sequence +'">'+packet.sequence+'</td>'+
				'<td class="dst '+ logColumnsShown.dst +'">'+packet.data.dst+'</td>'+
				'<td class="src '+ logColumnsShown.src +'">'+packet.data.src+'</td>'+
				'<td class="msgId '+ logColumnsShown.msgId +'">'+packet.data.msgId+'</td>'+
				'<td class="replyTo '+ logColumnsShown.replyTo +'">'+(packet.data.replyTo || "")+'</td>'+
				'<td class="action '+ logColumnsShown.action +'">'+(packet.data.action || "")+'</td>'+
				'<td class="resource '+ logColumnsShown.resource +'">'+(packet.data.resource || "")+'</td>'+
				'<td class="contentType '+ logColumnsShown.contentType +'">'+(packet.data.contentType || "")+'</td>'+
				'</tr><tr class="packet">'+
				'<td colspan="10"><pre>' + JSON.stringify(msg,null,2) + '</pre></td>'+
			'</tr>'
	);
};
sibilant.defaultPeer.on("receive",logPacket);
sibilant.defaultPeer.on("send",logPacket);

$(document).ready(function() {
	$('#debuggerAddress').text(client.address);
	$("#messages").on("click","tr.summary",function(event) {
		event.preventDefault();
		$(this).next("tr.packet").toggle();
	});
});
	
//===============================================================================================
// Stats tab
//===============================================================================================

function updateStats() {
	$("#stats").text(JSON.stringify(sibilant.metrics.toJson(),null,2));
};

var updateMetrics=false;

function toggleUpdateMetrics() {
	updateMetrics=!updateMetrics;
		$("#toggleUpdateMetrics").text(updateMetrics?"Disable Update":"Enable Update");
}

$(document).ready(function() {
	updateLogColumns();
	updateStats();
	window.setInterval(function() {
		if(updateMetrics) {
			updateStats();
		}
	},1000);
			
});

//===============================================================================================
// Key Value tab
//===============================================================================================

var knownKVKeys={};

function updateValue(packet) {
	var el=knownKVKeys[packet.resource];
	if(!el) {
		el=createKeyRow(packet.resource);
	}
	var val;
	if(packet.action==="changed") {
		val=packet.entity.newValue;
	} else {
		val=packet.entity;
	}
	el.find('.kvValue').text(JSON.stringify(val,null,2));
	if(packet.entity && packet.entity.watchers) {
		el.find('.kvWatchers').text(JSON.stringify(packet.entity.watchers,null,2));
	}
}

function createKeyRow(k) {
	var table=$('#keyValueTable');
	knownKVKeys[k]=$('<tr class="KVRow"><td class="KVKey">'+k+'</td>'
				+'<td><pre class="kvValue"></pre></td>'
				+'<td><pre class="kvWatchers"></pre></td>'
				+'</tr>');
	table.append(knownKVKeys[k]);
	return knownKVKeys[k];
}

function updateKeys(packet) {
	var table=$('#keyValueTable');
	var keys=packet.entity;
	
	table.remove('tr.KVRow');
	for(var i=0; i< keys.length; ++i) {
		var k=keys[i];
		if(!knownKVKeys[k]) {
			client.send({
				dst: 'keyValue.api',
				action: 'watch',
				resource: k
			},updateValue);
		}

		
		client.send({
			dst: 'keyValue.api',
			action: 'get',
			resource: k
		},updateValue);
	}
}

function refreshKV() {
	$('#keyValueTable tr.KVRow').remove();
	knownKVKeys={};
	
	client.send({
		dst: 'keyValue.api',
		action: 'list'
	},updateKeys);
}

$(document).ready(function() {
	refreshKV();
});

//===============================================================================================
// Key Value tab
//===============================================================================================

var LeaderGroup=function(groupName) {
	this.groupName=groupName;
	this.leader="";
	this.members={};
	this.lastElection="";
	this.lastSync=undefined;
	this.el=$('<tr><td class="leaderGroup">'+groupName+'</td>'+
					'<td class="lastElection"></td>'+
					'<td class="currentLeader"></td>'+
					'<td><pre class="members"></pre></td>'+
					'<td class="lastSync"></td>'+
					'<td><ul class="history"></ul></td>'+
					'</tr>');
	
	this.update=function(packet) {
		var now=sibilant.util.now();
		var history=this.el.find(".history");
		
		this.members[packet.src]={
			lastSeen: prettyDate(now),
			priority: packet.entity.priority
		};
		switch(packet.action) {
				case 'election':
					this.lastElection=now;
					history.append('<li>'+packet.src + " called an election");
					break;
				case 'victory':
					this.leader=packet.src;
					history.append('<li>'+packet.src + " declared victory");
					break;
				case 'sync':
					this.lastSync=packet.time || now;
					history.append('<li>'+packet.src + " pushed sync data");
					break;
		}
		
		this.el.find(".lastElection").text(prettyDate(this.lastElection));
		this.el.find(".currentLeader").text(this.leader);
		this.el.find(".members").text(JSON.stringify(this.members,null,2));
		this.el.find(".lastSync").text(this.lastSync?prettyDate(this.lastSync):"");

	};
};

var knownLeaderGroups={};

function prettyDate(epochTime) {
	var date=new Date(epochTime);
	return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " +
				date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
}


function logLeaderPacket(msg) {
	var packet=msg.packet.data;
	if(!packet.dst.match(".election")) {
		return;
	}
	var leaderGroup=knownLeaderGroups[packet.dst];
	if(!leaderGroup) {
		leaderGroup=knownLeaderGroups[packet.dst]=new LeaderGroup(packet.dst);
		$("#leaderInfo table").append(leaderGroup.el);
	}
	leaderGroup.update(packet);
};
sibilant.defaultPeer.on("receive",logLeaderPacket);
sibilant.defaultPeer.on("send",logLeaderPacket);


//===============================================================================================
// LocalStorage tab
//===============================================================================================


function drawLocalStorage() {
	var table=$("#localStorageTab table");
	table.find(".localStorageRow").remove();
	for(var i=0; i < localStorage.length;++i) {
		var k=localStorage.key(i);
		var v=localStorage.getItem(k);
		table.append('<tr class="localStorageRow">'
			+ "<td>" + k + "</td>"
			+"<td><pre>"+v+"</pre></td>"
			+"</tr>");
	}
}

function wipeLocalStorage() {
	for(var i=0; i < localStorage.length;++i) {
		var k=localStorage.key(i);
		localStorage.removeItem(k);
	}
	drawLocalStorage();
}

$(document).ready(function() {
	drawLocalStorage();
});