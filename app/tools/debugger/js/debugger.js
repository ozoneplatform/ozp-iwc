// used by a lot of the sample htmls for showing logging and metrics
(function() {

	var updateStats=function() {
		$("#stats").text(JSON.stringify(sibilant.metrics.toJson(),null,2));
	};

	sibilant.defaultPeer.on("receive",function(msg) {
		var packet=msg.packet;
		var date=new Date(packet.data.time);
		var dateString=date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " +
						date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
		$("#messages").append( 
				'<tr class="summary">'+
				  '<td>'+dateString+'</td>'+
				  '<td>'+packet.src_peer+'</td>'+
				  '<td>'+packet.sequence+'</td>'+
				  '<td>'+packet.data.src+'</td>'+
				  '<td>'+packet.data.dst+'</td>'+
				  '<td>'+packet.data.msgId+'</td>'+
				  '<td>'+packet.data.replyTo+'</td>'+
				'</tr><tr class="packet">'+
				  '<td colspan="7"><pre>' + JSON.stringify(msg,null,2) + '</pre></td>'+
				'</tr>'
		);
		updateStats();
	});
	
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