(function() {

	var updateStats=function() {
		$("#stats").text(JSON.stringify(sibilant.metrics.toJson(),null,2));
	};

	var logPacket=function(msg) {
		var packet=msg.packet;
		var date=new Date(packet.data.time);
		var dateString=date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " +
						date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();

		$("#messages").append( 
				'<tr class="summary">'+
				  '<td class="dateString">'+dateString+'</td>'+
				  '<td class="srcPeer">'+packet.src_peer+'</td>'+
				  '<td class="sequence">'+packet.sequence+'</td>'+
				  '<td class="dst">'+packet.data.dst+'</td>'+
				  '<td class="src">'+packet.data.src+'</td>'+
				  '<td class="msgId">'+packet.data.msgId+'</td>'+
				  '<td class="replyTo">'+(packet.data.replyTo || "")+'</td>'+
				  '<td class="action">'+(packet.data.action || "")+'</td>'+
				  '<td class="resource">'+(packet.data.resource || "")+'</td>'+
				  '<td class="contentType">'+(packet.data.contentType || "")+'</td>'+
				'</tr><tr class="packet">'+
				  '<td colspan="10"><pre>' + JSON.stringify(msg,null,2) + '</pre></td>'+
				'</tr>'
		);
	};
	var client=new sibilant.Participant();
	sibilant.defaultRouter.registerParticipant(client);
	
	var updateKeys=function() {
	};

	sibilant.defaultPeer.on("receive",logPacket);
	sibilant.defaultPeer.on("send",logPacket);
	
	// update stats every second, just because
	window.setInterval(function() {
		updateStats();
	},1000);

	updateStats();
})();

$(document).ready(function() {
			
		$("#messages").on("click","tr.summary",function(event) {
			event.preventDefault();
			$(this).next("tr.packet").toggle();
		});
});