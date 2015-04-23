
describe("Immediate Promise",function() {
    var order=[];
    afterEach(function() {
      order=[];  
    });
    
    var step=function(n) {
        return function(previousValue) {
            expect(previousValue).toEqual(n-1);
            order.push(n);
            return n;
        };
    };
    
    var skipStep=function(msg) {
        return function(previousValue) {
            order.push("did not skip "+msg+" from " + previousValue);
            return msg;
        };
    };
    
    it("resolves in line if possible",function() {
        var p=new ozpIwc.ImmediatePromise(function(resolve,reject) {
           order.push(1);
           resolve(1);
        }).then(step(2)).then(step(3));
        
        expect(p).toBeDefined();
        expect(order).toEqual([1,2,3]);
    });
    
    it("passes errors through",function() {
        var p=new ozpIwc.ImmediatePromise(function(resolve,reject) {
           order.push(1);
           reject(1);
        }).then(function(v) {
            order.push(-1);
        },step(2));
        expect(p).toBeDefined();
        expect(order).toEqual([1,2]);
    });
    it("chains errors",function() {
        var p=new ozpIwc.ImmediatePromise(function(resolve,reject) {
           order.push(1);
           reject(1);
        }).then(skipStep("then"))
            .catch(step(2));
        
        expect(p).toBeDefined();
        expect(order).toEqual([1,2]);
    });    
    it("catches errors in a chain",function() {
        var p=new ozpIwc.ImmediatePromise(function(resolve,reject) {
           order.push(1);
           reject(1);
        }).then(skipStep("first then"))
        .catch(step(2))
        .then(step(3));
    
        expect(p).toBeDefined();
        expect(order).toEqual([1,2,3]);
    });    
    
    pit("works with async",function() {
        var p=new ozpIwc.ImmediatePromise(function(resolve,reject) {
            order.push(1);
            setTimeout(function() {
                resolve(1);
            },10);
        }).then(step(2));
        
        expect(order).toEqual([1]);
        
        ozpIwc.testUtil.tick(50);
        
        return p.then(function(v) {
            expect(order).toEqual([1,2]);
        });
    });
    pit("works with Promise.all",function() {
        var ip=new ozpIwc.ImmediatePromise(function(resolve,reject) {
            order.push(1);
            resolve(1);
        }).then(step(2));
        
        var p=new Promise(function(resolve,reject) {
           order.push(3); 
           resolve(3);
        }).then(step(4));
        
        var all=Promise.all([ip,p]);
        
        expect(order).toEqual([1,2,3]);
        
        ozpIwc.testUtil.tick(50);
        
        return all.then(function(v) {
            expect(order).toEqual([1,2,3,4]);
        });
    });
    pit("can be chained from a promise",function() {
        var p=new Promise(function(resolve,reject) {
           order.push(1); 
           resolve(1);
        }).then(function() {
            return new ozpIwc.ImmediatePromise(function(resolve,reject) {
                order.push(2);
                resolve(2);
            });
        });
        
        expect(order).toEqual([1]);
        
        return p.then(function(value) {
            expect(value).toEqual(2);
            expect(order).toEqual([1,2]);
        });
    });    
});

