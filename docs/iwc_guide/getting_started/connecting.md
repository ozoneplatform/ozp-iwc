##Connecting
To use IWC between applications, IWC client connections must be added to each application.
These clients connect to an IWC bus that is bound by the browser as well as the domain it is obtained from.

```
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect().then(function(){
   /* client use goes here */
});
```

In this example, an IWC connection is made to the bus on domain `http://ozone-development.github.io/iwc.`
The actual javascript that makes up the bus is gathered from that url and ran locally enclosed in the same domain.

All aspects of the client use promises to simplify integration with asynchronous applications.

***

##Disconnecting
Disconnecting an application from the IWC bus is as simple as calling `disconnect().`

```
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect().then(function(){
    client.disconnect();
});
```

