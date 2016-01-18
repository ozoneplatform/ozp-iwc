##Common API Action: get()

###Applies to All IWC APIs

###Retrieves a Given Node


To retrieve a node stored in an API the `get` action is used on
**a reference to the node**. The retrieval is asynchronous, and the response is
passed through the resolution of the action's promise.

```
var ballRef = new client.data.Reference("/ball"); // generate the reference to the resource
var ballVal;

ballRef.get().then(function(value){
    ballVal = value;
});
```

The value of the promise resolution is the value assigned to the resource. The
value can be any valid Javascript primitive or array.

If further detail is required on the IWC response, refer to the [Comprehensive
IWC Requests]() section.

##Requesting a node that does not exist
Requesting a node that does not exist is not an valid action, this will result
in an promise rejection with a containing the string `'noResource'`.

Given that the resource `/ball` above does not exist in the IWC:

```
ballRef.get().catch(function(err){
    console.log("Could not retrieve. Reason: ", err);
});
```
