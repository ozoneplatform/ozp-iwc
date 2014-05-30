var ozpIwc=ozpIwc || {};
ozpIwc.owf7Backend=ozpIwc.owf7Backend || {};

ozpIwc.owf7Backend.keyValueApiOwf7Storage = function() {
	this.prefsUrl="/owf/prefs/preference/ozp/kvStoreApi";
};

ozpIwc.owf7Backend.keyValueApiOwf7Storage.prototype.load=function() {
	var action=new ozpIwc.AsyncAction();
	$.ajax({
	  url: this.prefsUrl,
		type: "GET",
		error: function(xhr,status,error) { 
			action.resolve("failure",xhr,status,error); 
		},
		success: function(data,status,xhr) { 
			action.resolve("success",JSON.parse(data.value),status,xhr);
		}
	});
	return action;
};

ozpIwc.owf7Backend.keyValueApiOwf7Storage.prototype.save=function(data) {
	var action=new ozpIwc.AsyncAction();
	$.ajax({
	  url: this.prefsUrl,
		type: "POST",
		data: '_method=PUT&version=7.0.1-GA-v1&value='+encodeURIComponent(JSON.stringify(data)),
		error: function(xhr,status,error) { 
			action.resolve("failure",xhr,status,error); 
		},
		success: function(data,status,xhr) { 
			action.resolve("success",data,status,xhr);
		}
	});
	return action;
};