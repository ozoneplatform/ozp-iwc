##Common API Action: set(nodeKey,nodeValue)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
* `nodeValue`: **Object** - the settings to store the node.
* `[nodeValue.lifespan]`: **String** - (Optional) the lifespan of the node.     
    * `"Persistent"`: will store the resource as it changes to the backend. **This lifespan is only available to  and is the default for the data.api.**
        and is the default lifespan for a data.api resource. Changing a resource from persistent won't remove it from the
        backend, rather prevent further updates to be sent to the backend.
    * `"Bound"`: will destroy the resource from the bus if it's bound clients (application) are allclosed. Each client that sets 
        a resource's lifespan as bound will be added to the resources bound list, once all bound addresses are closed the 
        resource is destroyed. **This lifespan is default for the names.api.**
    * `"Ephemeral"`: will keep the resource around as long as the bus is instantiated. When all connections to the bus
        close this resource is destroyed. **This lifespan is default for the intents.api and system.api.**
        
    The lifespan parameter does not have to be passed with every `set` action, rather passing it with the action will toggle
    changing the lifespan, it is advised to set the lifespan with the initial use of the resource in an application.
    
* `[nodeValue.entity]`: **Object** - (Optional) the value to store in the node. 
* `[nodeValue.contentType]`: **String** - (Optional) the content type of the object that will be set. This is an 
optional parameter, in some APIs nodes have refined control based on the content they hold.
 
###Applies to All IWC APIs

###Creates/Updates a Given Node
    
    
To create or update a node stored in an API the `set` action is used. The action is asynchronous, and the response is
passed through the resolution of the action's promise.

```
var dataApi = client.data();

var foo = { 'bar': 'buz' };

dataApi.set('/foo',{ entity: foo }).then(function(resp){

});
```

The value of `resp`, the resolved object of the get request, is formatted as follows:

```
{
  "ver": 1,
  "src": "data.api",
  "msgId": "p:210",
  "time": 1443460516804,
  "response": "ok",
  "replyTo": "p:274",
  "dst": "87f6fbeb.b8a5ec6c"
}
```

A `response` of "ok" means the set action was successful.

##Creating/Updating a Read-Only Node
Requesting to create/update a node in a read-only API will result in a `noPermission` error.
**System API and Names API both contain read-only resources**

```
var systemApi = client.system();

systemApi.set('/application/1234-1234-1234-1234').catch(function(err){
    //err.response === "noPermission"
});
```
