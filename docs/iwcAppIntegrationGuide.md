#Overview
The purpose of this guide is to demonstrate how to add an IWC bus to a JavaScript application. This guide covers connecting to an externally hosted bus (a remote server is hosting the IWC components and connections to any database). 

For information on integrating the IWC with an angular application please see [[IWC Angular App Integration]].

For information on hosting the IWC and an Ozone database please see [[IWC Backend Integration]].



##IWC Client files
**Bower**: from your project's directory run `bower install ozone-development/ozp-iwc`

The IWC Client file you will reference from your application is at `bower_components/ozp-iwc/dist/js/ozpIwc-client.min.js`


***

**Manually**: grab the latest distribution of the IWC client from the [IWC git repository](https://raw.githubusercontent.com/ozone-development/ozp-iwc/master/dist/js/ozpIwc-client.min.js) and place it in your project's directory. (Location is arbitrary, just locatable from your html)

***
_NOTE: For the remainder of this guide the IWC client will be referenced from the bower installed location_


##Adding an IWC Client to your application 

An IWC client is an application's connection to an IWC bus. An IWC bus is always local to the user, but bound by the domain it is hosted from. For this example we will be using a predefined IWC bus hosted here on the ozp-iwc github page `http://ozone-development.github.io/iwc`.

Our example application for this guide is a simple journal application. This application, when connected to an IWC bus, can store/share/edit entries with other applications.

***

**HTML** 

Load in the IWC-client library first to expose it to our application JavaScript `app.js`. 
```
<html>
    <head>
        <script src="../bower_components/ozp-iwc/dist/js/ozpIwc-client.min.js"></script>
        <script src="js/app.js"></script>
    </head>
  ...
```

**Javascript** 
The IWC library is encapsulated in the `ozpIwc` namespace.

##Connecting your IWC client to an IWC bus
Connecting a client to a bus is as simple as instantiating a `client = new ozpIwc.Client(...)`.

**JavaScript**

From the application code, an ozpIwc client is instantiated and connects to the IWC bus hosted on the github pages.

```
var client = new ozpIwc.Client({
    peerUrl: http://ozone-development.github.io/iwc
});
```
 On instantiation, the client will asynchronously connect. Operating using the connected client is done as a callback function in `client.connected(function(){...})`.

```
var client = new ozpIwc.Client({
    peerUrl: http://ozone-development.github.io/iwc
});

client.connected(function(){
   ... // IWC usage goes in here
});
```

Once connected (asynchronously), the client address is obtainable. This is indication that the application has connected to the bus.

```
var client = new ozpIwc.Client({
    peerUrl: http://ozone-development.github.io/iwc
});

client.connected(function(){
    console.log("Client connected with an address of: ", client.address);
});
```

##Making IWC Api Calls
Each deployed version of the IWC bus is capable of having its own specified api's integrated with it. For the purpose of this guide, the IWC bus used by the journal application has a [[data.api]].

The data.api is a key/value storage component on the IWC bus. Here, common resources can be shared among applications via the `set` and `get` actions.

Syntactically, to make an api call to the **data.api** to **set** the value `{foo: "bar"}` to key `/buz` you would do the following.

```
client.on("connected",function(){
   // all client code goes within the connected callback
   ...

   client.api("data.api").set("/buz",{
       entity: {
           foo: "bar"
       }
   });
});
``` 
This client api call-style holds true through all api's on the bus such that the following syntax structure is formed:
```
client.api(${api's name}).${the action}(${the resource key}, ${the resource value});
```

Api's on the IWC bus inherit from a common [api base](https://github.com/ozone-development/ozp-iwc/wiki/APICommonConventions) and all share a common set of `actions` of which they can expand on.


***

###Making IWC Api Calls With expected Asynchronous Responses
Some api calls expect data returned, for example a `get` action. For these cases, the action call returns a promise. This allows operating on asynchronous IWC responses to be as easy as

```
client.api("data.api").get("/buz").then(function(response){
    console.log(response);
});
```
Response:
```
{
    foo: "bar" 
}
```

Although, if making the `set` and `get` calls one after another, it is not guaranteed that the `set` finishes before the `get`. With the help of promises the order of operations can be enforced:
```
client.api("data.api").set("/buz",{
    entity: {
        foo: "bar"
    }
}).then(function(reply){
    return client.api("data.api").get("/buz");
}).then(function(response){
        console.log(response.entity);
});
```

Response:
```
{
    foo: "bar" 
}
```

 
###Making IWC Api Calls With Expected Recurring Asynchronous Responses
Some api actions will respond periodically. An example is a `watch` action. A watch action in the `data.api` receives notification whenever the resource being watched changes. To print out anytime `/buz` changes would look like so:
```
client.api("data.api").watch("/buz",function(reply){
    console.log(reply)
});
```

The deference between this implementation and the promise response above is actions that only expect a singular callback fall into the promise style.

This callback function style is used because the desired functionality may be to watch a resource forever.

To end receiving expected recurring responses a `done()` flag is called (much like in Jasmine tests)
```
client.api("data.api").watch("/buz".function(reply,done){
    console.log(reply);
    if(reply.newValue === { foo : "oof"}){
        done();
    }
});
```

