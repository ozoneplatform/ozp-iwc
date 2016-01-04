##Common API Action: delete(nodeKey)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
 
###Applies to All IWC APIs

###Removes a Given Node from its API
    
    
To destroy node stored in an API the `delete` action is used. The action is asynchronous, and the response is
passed through the resolution of the action's promise.

```
var dataApi = client.data();

dataApi.delete('/foo');
```

Deleting a resource that does not exist **is a valid action**. Thus, so long as the API allows deletion of resources 
resolved response would be as follows:

```
{
    "ver": 1,
    "src": "data.api",
    "msgId": "p:3684",
    "time": 1435674349620,
    "response": "ok",
    "replyTo": "p:3660",
    "dst": "c1f6b99e.21851da2"
}
```

A `response` of "ok" means the set action was successful.

##Deleting a Read-Only Node
Requesting to delete a node in a read-only API will result in a `noPermission` error.
**System API and Names API both contain read-only resources**

```
var namesApi = client.names();

namesApi.delete('/api/names.api').catch(function(err){
    //err.response === "noPermission"
});
```
