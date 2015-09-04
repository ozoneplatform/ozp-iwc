## Quick Start
The purpose of this guide is to get a base hosting of the IWC running locally.

Building and Running the Bus (includes a static mock-backend)
--------------
1.  Install node.js.
2.  sudo npm install -g grunt-cli bower
3.  git clone git@github.com:ozone-development/ozp-iwc.git
4.  cd ozp-iwc
6.  npm install && bower install
7.  grunt serve
8. Browse to http://localhost:13000 to find the [IWC Debugger]().

Connecting a Javascript entity to the Bus
--------------
1. Include the IWC's client library to your html.
        
    **Bower**: Include the ozp-iwc library to your bower dependencies. Then reference the bower_component 
    file.
    ```
    bower install ozp-iwc --save-dev
    ```

    ```
    <script src="<relative pathing for project's bower_components>/ozp-iwc/dist/js/ozpIwc-client.min.js"></script>
    ```
 
    **Non-bower**: Download the latest [IWC release](https://github.com/ozone-development/ozp-iwc/releases) and copy
    the client library (dist/js/ozpIwc-client.min.js) into your widget's project and refer to it with the script tag.
    ```      
    <script src="<relative pathing for project>/ozpIwc-client.min.js"></script>
    ```    
        
2. Create a IWC client. In your application's javascript instantiate a new `ozpIwc.Client`. The peerUrl is the path to 
the hosted bus, `grunt serve` hosts an example bus locally on port 13000.
    ```
    var client = new ozpIwc.Client({ peerUrl: "http://localhost:13000"});
    ```

3. Test that the client can connect. Add the following to your application's javascript and see if the console responds
with the connected address. If so, your application is configured to use the sample IWC bus hosted on your machine.
```
  client.connect().then(function(){
        console.log("IWC Client connected with address:", client.address);
    }).catch(function(err){
        console.log("IWC Client failed to connect:", err);
    });
```

Key-Value capabilities
--------------
1. Storing a value (will persist between sessions)

    ```
    var value = {
        size: "medium",
        quantity: 1,
        color: "red"
    };
    
    client.data().set("/t-shirt/Style01",{entity: value});
    ```

2. Retrieving a value

    ```
    var value;
   
    client.data().get("/t-shirt/Style01").then(function(resp){
        value = resp.entity;
    });
    ```

3. Watching a value (calls the callback on change of value)

    ```
    var onChange = function(resp){
        console.log("Old value:", resp.entity.oldValue);
        console.log("New value:", resp.entity.newValue);
    };
        
    client.data().watch("/t-shirt/Style01",onChange);
    ```

Application capabilities
--------------
1. Listing applications registered to the bus

    ```
    var applications;
    
    client.system().get("/application").then(function(resp){
        applications = resp.entity;
    });
    ```

2. Launching an application registered to the bus (opens in a new tab by default)

    ```
    var application = "/application/1234";
        
    client.system().launch(application);
    ```


Intent capabilities
--------------
1. Registering an intent handler (onInvoke called when intent is invoked)

    ```
    var intent = "/application/json/print";
    
    var config = {
        entity: {
            type: "/application/json",
            action: "print",
            icon: "printIcon.png",
            label: "Console logs data received from the invoker"
        }
    };
    
    var onInvoke = function(resp){
            console.log("Intent invoked with the following data:", resp.entity);
    };

    client.intents().register(intent, config, onInvoke);
    ```

2. Invoking an intent (calls onInvoke from above)

    ```
    var intent = "/application/json/print";
    var value = {
        size: "medium",
        quantity: 1,
        color: "red"
    };
        
    client.intents().invoke(intent,value);
    ```
    
3. Broadcasting an intent (all registered handlers will handle)

    ```
    var intent = "/application/json/print";
    var value = {
        size: "medium",
        quantity: 1,
        color: "red"
    };
        
    client.intents().broadcast(intent,value);
    ```
