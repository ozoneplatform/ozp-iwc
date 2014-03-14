
// used by a lot of the sample htmls for showing logging and metrics
(function() {

	var updateStats=function() {
		$("#stats").text(JSON.stringify(Sibilant.Metrics.toJson(),null,2));
	};

	Sibilant.peer.on("receive",function(msg) {
		$("#messages").append('<span>Peer:</span><pre>'+JSON.stringify(msg,null,2)+'</pre>');
		updateStats();
	});
	
	// update stats every two seconds, just because
	window.setInterval(function() {
		updateStats();
	},2000);

	updateStats();
})();

