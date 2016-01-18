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

Referencing a IWC Data resource
--------------
```
var tshirtRef = new client.data.Reference("/t-shirt");
```
Key-Value capabilities
--------------
1. Storing a value (will persist between sessions)
    ```
    tshirtRef.set({
        size: "medium",
        quantity: 1,
        color: "red"
        });
    ```

2. Retrieving a value
    ```
    var tshirtVal;

    tshirtRef.get().then(function(value){
       tshirtVal = value;
    });
    ```

3. Watching a value (calls the callback on change of value)
    ```
    tshirtRef.watch(function(change){
        console.log("Old value:", change.oldValue);
        console.log("New value:", change.newValue);
    };
    ```


Referencing a IWC Intent Resource (Remote Functionality)
--------------
```
var funcRef = new client.intents.Reference("/text/plain/print");
```

Intent capabilities
--------------
1. Registering a function for shared use
    ```
    var metaData = {
        type: "/application/json",
        action: "print",
        icon: "printIcon.png",
        label: "Console logs data received from the invoker"
    };

    var myFunc = function(value){
        console.log(value);
    };

    funcRef.register(metaData, myFunc);
    ```

2. Invoking (Calling) a shared function
    ```
    funcRef.invoke("Hello World!");
    ```

3. Broadcasting an intent (all registered functions on resource will run)
    ```
    funcRef.broadcast("Hello World!");
    ```

Referencing a IWC System Resource (Application awareness: requires dedicated backend configuration)
--------------
```
var appRef = new client.system.Reference("/application/com.ozone.bouncingBalls");
```

1. Launching application (in new window)
    ```
    appRef.launch();
    ```

2. Launching an application registered to the bus (opens in a new tab by default)
    ```
    appRef.launch();
    ```
