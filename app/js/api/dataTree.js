var sibilant=sibilant || {};

/**
 * @class
 */
sibilant.DataTree = function() {
	this.dataTree={};
	this.events=new sibilant.Event();
	this.events.mixinOnOff(this);	
};

sibilant.DataTree.prototype.set=function(path,newValue) {
	var oldValue=this.dataTree[path];
	var evt=new sibilant.CancelableEvent({
			'path': path,
			'newValue': newValue,
			'oldValue': oldValue
	});
	if(!this.events.trigger("preSet",evt).canceled) {
		this.dataTree[path]=newValue;
		this.events.trigger("postSet",{
			'path': path,
			'newValue': newValue,
			'oldValue': oldValue
		});
	}
};

sibilant.DataTree.prototype.get=function(path) {
	var value=this.dataTree[path];
	var evt=new sibilant.CancelableEvent({
			'path': path,
			'value': value
	});
	if(!this.events.trigger("preGet",evt).canceled) {
		return value;
	}
};

sibilant.DataTree.prototype.delete=function(path,value) {
	var value=this.dataTree[path];
	var evt=new sibilant.CancelableEvent({
			'path': path,
			'value': value
	});
	if(!this.events.trigger("preDelete",evt).canceled) {
		this.dataTree[path]=undefined;
	}
};