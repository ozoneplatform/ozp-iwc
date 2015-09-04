# System API
Application registrations of the bus. This api gives connections to the bus awareness of what applications the bus
has knowledge of.
 
Different then the names api, these application's are not the current running applications, rather these are 
registrations of applications hosted and default configurations for launching them. This gives IWC clients the 
capability to launch other applications. This is a read-only API.

***

### Accessing the System API
The Intents API is accessed by calling the `system()` property of a connected IWC Client.

```
var client = new ozpIwc.Client({ peerUrl: "http://localhost:13000});
client.connect().then(function(){

    var systemApi = client.system();

});
```

### System API Actions
| Action  | has Callback? | Description                                                                                     |
| ------- | ------------- | ----------------------------------------------------------------------------------------------- |
| [get](../common/get.md)   | no            | gathers the node with the specific key                                                          |
| [bulkGet](../common/bulkGet.md) | no            | gathers all nodes  who's key matches the given partial-key                                       |
| [list](../common/list.md)    | no            | gathers all node **keys** who match the given partial-key                                       |
| [set](../common/set.md)     | no            | stores the given value to the specified node                                                    |
| [delete](../common/delete.md)  | no            | deletes the node with the specific key                                                          |
| [watch](../common/watch.md)   | yes           | gathers the node with the specific key and calls the registered callback on updates to the node |
| [unwatch](../common/unwatch.md) | no            | unregisters the callback for the node                                                           |
| [launch](launch.md)   | no            | opens an application registered to the IWC bus.|
