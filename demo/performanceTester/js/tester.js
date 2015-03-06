$(function() {

var now = function() { return Date.now();};
//if(typeof performance.now === "function") {
//    now=function() { return performance.now();};
//}
localStorage.clear();

var TestHarness=function(callbacks) {
    this.count=0;
    this.runRateTest=function(delay) {
        this.timerHandle=window.setInterval(this.onTimer,delay);
    };
    this.stopRateTest=function() {
        window.clearInterval(this.timerHandle);
    };
    
    this.runPingTest=function() {
        callbacks.startReceive(this.onReceive);
        callbacks.send("ping",now());
    };
    this.stopPingTest=function() {
        callbacks.stopReceive(this.onReceive);
    };

    
    var self=this;
    this.onReceive=function(key,value) {
        if(key === "pong") {
            self.count++;
            callbacks.send("ping",now());
        }  
    };
    
    this.onTimer=function() {
        callbacks.send("value",now());
        self.count++;
    };
    

};
var localStorageCallbacks={
    send: function(key,value) {
        localStorage.setItem(key,value);
        localStorage.removeItem(key);
    },
    startReceive: function(handler) {
        this.onStorage=function(event) {
            if(!event.newValue) { return; }
            handler(event.key,event.newValue);
        };
        window.addEventListener('storage', this.onStorage, false);
    },
    stopReceive: function(handler) {
      window.removeEventListener('storage',this.onStorage,false);
      this.onStorage=null;
    }
};

var localStorageTest=new TestHarness(localStorageCallbacks);
$("#runLocalStorageTest").click(function() {
    var delay=1000/$("#lsRate").val();
    console.log("Starting rate test with a delay of ",delay);
    localStorageTest.runRateTest(delay);
});
$("#stopLocalStorageTest").click(function() {
    localStorageTest.stopRateTest();
});
$("#runLocalStoragePingPongTest").click(function() {
    localStorageTest.runPingTest();
});
$("#stopLocalStoragePingPongTest").click(function() {
    localStorageTest.runPingTest();
});

});