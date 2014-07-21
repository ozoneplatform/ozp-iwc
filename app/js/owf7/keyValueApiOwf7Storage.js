var ozpIwc=ozpIwc || {};
ozpIwc.owf7Backend=ozpIwc.owf7Backend || {};

ozpIwc.owf7Backend.DataApiOwf7Storage = function() {
	this.prefsUrl="/owf/prefs/preference/ozp/kvStoreApi";
};

ozpIwc.owf7Backend.DataApiOwf7Storage.prototype.load=function() {
	var action=new ozpIwc.AsyncAction();
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
        if(this.readyState === 4) {
            if(this.status >= 200 && this.status < 400) {
                action.resolve("success", JSON.parse(this.responseText), this.status, this);
            } else {
                action.resolve("failure", this, this.status, this.responseText);
            }
        }
    };
    request.open('GET', this.prefsUrl, true);
    return action;
};

ozpIwc.owf7Backend.DataApiOwf7Storage.prototype.save=function(data) {
	var action=new ozpIwc.AsyncAction();
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
        if(this.readyState === 4) {
            if(this.status >= 200 && this.status < 400) {
                action.resolve("success", JSON.parse(this.responseText), this.status, this);
            } else {
                action.resolve("failure", this, this.status, this.responseText);
            }
        }
    };
    request.open('POST', this.prefsUrl, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send('_method=PUT&version=7.0.1-GA-v1&value='+encodeURIComponent(JSON.stringify(data)));
    return action;
};