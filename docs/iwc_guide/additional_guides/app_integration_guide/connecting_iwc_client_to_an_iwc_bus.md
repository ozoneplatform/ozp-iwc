##Connecting your IWC client to an IWC bus
Connecting a client to a bus is as simple as instantiating a `client = new ozpIwc.Client(...)`.

**JavaScript**

From the application code, an ozpIwc client is instantiated and connects to the IWC bus hosted on the github pages.

```
var client = new ozpIwc.Client({
    peerUrl: http://ozone-development.github.io/iwc
});
```
 On instantiation, the client will asynchronously connect. Any client calls made prior to the client's connection will be queued and ran once connected.
 To perform operations bound by the client connection, the `connect` promise can be called.

```
var client = new ozpIwc.Client({
    peerUrl: http://ozone-development.github.io/iwc
});

client.connect().then(function(){
   ... // connection dependent code
});
```

Once connected (asynchronously), the client address is obtainable. This is indication that the application has connected to the bus.

```
var client = new ozpIwc.Client({
    peerUrl: http://ozone-development.github.io/iwc
});

client.connect().then(function(){
    console.log("Client connected with an address of: ", client.address);
});
```