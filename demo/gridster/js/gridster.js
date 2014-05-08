
var client=new sibilant.Client({peerUrl:"http://localhost:13000"});

client.on("connected",function() {
	$('#myAddress').text(client.participantId);
});

var Widget=function(config) {
	this.iframe=$('<iframe src="' + config.url + '" sandbox="allow-scripts allow-same-origin"></iframe>');
	this.header=$('<header>'+config.name+'</header>');
	this.el=$('<div class="widget"></div>');
	
	this.el.data("controller",this);
	this.el.append(this.header);
	this.el.append(this.iframe);
};

Widget.prototype.updateSize=function() {
	this.iframe.width(this.el.width());
	this.iframe.height(this.el.height()-this.header.outerHeight());
};

var gridster;

var widgetDefs={
	'Balls1' : "http://"+window.location.hostname + ":15000",
	'Balls2' : "http://"+window.location.hostname + ":15001",
	'Balls3' : "http://"+window.location.hostname + ":15002",
	'Balls4' : "http://"+window.location.hostname + ":15003",
};

$(function(){
	var onResize=function(e, ui, $widget) {
		$widget.data("controller").updateSize()
	};
	gridster=$(".gridster").gridster({
			widget_margins: [5, 5],
			widget_base_dimensions: [120, 120],
			draggable: {
				handle: 'header'
			},
			resize: {
        enabled: true,
				resize: onResize,
				stop: onResize
      }
		}).data('gridster');
		
	for(var widgetName in widgetDefs) {
		var button=$("<button>" + widgetName + '</button>');
		button.data("widgetName",widgetName);
		button.click(function() {
			var name=$(this).data("widgetName");
			var widget=new Widget({name: name, url: widgetDefs[name]});
			gridster.add_widget(widget.el,2,2);
			widget.updateSize();
		});
		$('.header').append(button);
	}
	
		
});

