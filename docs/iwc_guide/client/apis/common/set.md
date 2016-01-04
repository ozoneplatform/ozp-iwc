##Common API Action: set(value)
* `value`: **Primitive|Array** - the value to store in the node.

###Applies to All IWC APIs

###Creates/Updates a Given Node

To create or update a node stored in an API the `set` action is used on the
reference to the node. The action is asynchronous, and returns a promise that
resolves if successful. No value is returned to the resolved promise.

```
var fooRef = new client.data.Reference("/foo");
fooRef.set("Hello World!");
```
##Creating/Updating a Read-Only Node
Requesting to create/update a node in a read-only API will result in a `noPermission` error.
**System API and Names API both contain read-only resources**

```
var myApp = new client.system.Reference("/application/com.ozone.myApp");

myApp.set("random value").catch(function(err){
    //err === "noPermission"
});
```
