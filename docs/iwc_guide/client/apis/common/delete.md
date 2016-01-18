##Common API Action: delete()

###Applies to All IWC APIs

###Removes a Given Node from its API


To destroy node stored in an API the `delete` action is used on a reference to
the node. The action is asynchronous and the promise will resolve without a
response if successful.

```
var fooRef = new client.data.Reference("/foo");
fooRef.delete();
```

Deleting a resource that does not exist **is a valid action**.
Thus, so long as the API allows deletion of resources the request will resolve
upon completion.

##Deleting a Read-Only Node
Requesting to delete a node in a read-only API will result in a `noPermission` error.
**System API and Names API both contain read-only resources**

```

var apiRef = new client.names.Reference("/api/data.api");
apiRef.delete().catch(function(err){
    //err === "noPermission"
});
```
