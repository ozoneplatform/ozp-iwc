var ozpIwc=ozpIwc || {};
ozpIwc.owf7Backend=ozpIwc.owf7Backend || {};

ozpIwc.owf7Backend.keyValueApiOwf7Storage = function() {
	this.prefsUrl="/owf/prefs/preference/ozp/kvStoreApi";
};

ozpIwc.owf7Backend.keyValueApiOwf7Storage.prototype.load=function(kvStore) {
	$.ajax({
	  url: this.prefsUrl,
		dataType: "json",
		type: "GET"
	}).done(function( data ) {
			kvStore.data=data;
	});
};

ozpIwc.owf7Backend.keyValueApiOwf7Storage.prototype.save=function(kvStore) {
	$.ajax({
	  url: this.prefsUrl,
		dataType: "json",
		type: "POST",
		data: kvStore.data
	});
};