var sibilant=sibilant || {};

/**
 * @class
 * @param {object} [config]
 * @param {function} [config.defaultData] - The default data for a node if accessed.
 * @param {function} [config.copyValue] - How to copy values.  The default is JSON.parse(JSON.stringify(value)).
 */
sibilant.DataTree = function(config) {
	config=config || {};
	this.defaultData=config.defaultData || function() { return undefined;};
	this.copyValue=config.copyValue || function(value) { 
		if(typeof(value) === 'array' || typeof(value) === 'object') {
			return JSON.parse(JSON.stringify(value));
		} else {
			return value;
		}
	};
	this.dataTree={};
	this.events=new sibilant.Event();
	this.events.mixinOnOff(this);	
};

sibilant.DataTree.prototype.set=function(path,newValue) {
	var oldValue=this.dataTree[path];
	var evt=new sibilant.CancelableEvent({
			'path': path,
			'newValue': this.copyValue(newValue),
			'oldValue': this.copyValue(oldValue)
	});
	if(!this.events.trigger("preSet",evt).canceled) {
		this.dataTree[path]=evt.newValue;
		this.events.trigger("set",{
			'path': path,
			'newValue': this.copyValue(evt.newValue),
			'oldValue': this.copyValue(oldValue)
		});
	}
};

sibilant.DataTree.prototype.get=function(path) {
	if(!(path in this.dataTree)) {
		this.dataTree[path]=this.defaultData();
	}
	
	var evt=new sibilant.CancelableEvent({
			'path': path,
			'value': this.copyValue(this.dataTree[path])
	});
	
	if(!this.events.trigger("preGet",evt).canceled) {
		return evt.value;
	}
};

sibilant.DataTree.prototype.delete=function(path,value) {
	var value=this.dataTree[path];
	var evt=new sibilant.CancelableEvent({
			'path': path,
			'value': this.copyValue(value)
	});
	if(!this.events.trigger("preDelete",evt).canceled) {
		var d=this.dataTree;
		delete d[path];
	}
};