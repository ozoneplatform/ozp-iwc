var participantId="$nobody";
var sendEvent;

(function() {
	var peer=window.parent;
	var replyCallbacks={};
	
	var receiveMessage=function(event) {
		var message=event.data;
		var latency=new Date().getTime()-event.data.time;
		$("#messages").append('<hr>latency: ' + latency + 'ms<pre>'+JSON.stringify(event.data,null,2)+'</pre>');

		if(message.reply_to && replyCallbacks[message.reply_to]) {
			replyCallbacks[message.reply_to](message);
		}
	};	
	window.addEventListener("message", receiveMessage, false);
	
	sendEvent=function(dst,message,callback) {
		var id=new Date().getTime();
		var message={
			ver: 1,
			src: participantId,
			dst: dst,
			msg_id: id,
			time: new Date().getTime(),
			entity: message
		};
		
		if(callback) {
			replyCallbacks[id]=callback;
		}
		
		peer.postMessage(message,'*');
	};
	
	sendEvent("$transport",{},function(message) {
		participantId=message.dst;
		$('#participantId').text(participantId);
	});

})();

$(document).ready(function() {
	$('#send_button').click(function(event) {
		var dst=$('#send_dst').val();
		var data=$('#send_data').val();
		console.log(dst + " -> " + data);
		sendEvent(dst,data);
		event.preventDefault();		
	});
});