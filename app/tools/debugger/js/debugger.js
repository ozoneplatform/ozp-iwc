// used by a lot of the sample htmls for showing logging and metrics
(function() {

	var updateStats=function() {
		$("#stats").text(JSON.stringify(sibilant.Metrics.toJson(),null,2));
	};

	sibilant.peer.default.on("receive",function(msg) {
		var date=new Date(msg.data.time);
		var dateString=date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " +
						date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
		$("#messages").append( 
				'<tr class="summary">'+
				  '<td>'+dateString+'</td>'+
				  '<td>'+msg.src_peer+'</td>'+
				  '<td>'+msg.sequence+'</td>'+
				  '<td>'+msg.data.src+'</td>'+
				  '<td>'+msg.data.dst+'</td>'+
				  '<td>'+msg.data.msgId+'</td>'+
				  '<td>'+msg.data.replyTo+'</td>'+
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