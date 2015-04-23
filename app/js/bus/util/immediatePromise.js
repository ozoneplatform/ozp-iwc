ozpIwc = ozpIwc || {};


ozpIwc.ImmediatePromise=function(func) {
    var self=this;
    var resolve=function(v) { 
        self.state="resolved";
        self.value=v;
        if(self.onResolved) {
            self.onResolved(v);
        }        
    };
    var reject=function(v) {
        self.state="rejected";
        self.error=v;
        if(self.onRejected) {
            self.onResolved(v);
        }
    };
    
    this.resolutionPromise=new Promise(function(promiseResolve,promiseReject) {
        if(self.state==="resolved") {
            promiseResolve(self.value);
        } else if(self.state==="rejected") {
            promiseReject(self.error);
        } else {
            self.onResolved=promiseResolve;
            self.onRejected=promiseReject;
        }        
    });
    
    try {
        func(resolve,reject);
    } catch (e) {
        reject(e);
    }

};


ozpIwc.ImmediatePromise.prototype.then=function(success,failure) {
    var self=this;
    if(this.value) {
        success = success || function(v){return v;};
       
        return new ozpIwc.ImmediatePromise(function(resolve,reject) {
            resolve(success(self.value));
        });
    }
    if(this.error) {
        return new ozpIwc.ImmediatePromise(function(resolve,reject) {
            if(failure) {
                resolve(failure(self.error));
            } else {
                reject(self.error);
            }
        });
    }
    return this.resolutionPromise.then(success,failure);
};


ozpIwc.ImmediatePromise.prototype.catch=function(failure) {
  return this.then(null,failure);    
};