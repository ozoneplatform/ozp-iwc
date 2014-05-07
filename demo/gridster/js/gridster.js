
var client=new sibilant.Client({peerUrl:"http://localhost:13000"});

client.on("connected",function() {
	$('#myAddress').text(client.participantId);
});
	
$(function(){
	var gridster=$(".gridster").gridster({
			widget_margins: [5, 5],
			widget_base_dimensions: [200, 200]
		}).data('gridster');
		
	gridster.add_widget('<iframe src="http://localhost:15000/" sandbox="allow-scripts allow-same-origin"></iframe>',1,2);
    
		
});

