# Data API
A simple key/value JSON store for sharing common nodes among applications. Creating, updating, and deleting Data
API nodes persists to the Data APIs endpoint by default. This api allows for resources to be persisted for reference in
future sessions.

***

### Accessing the Data API
The Data API is accessed by accessing the `data` property of a connected IWC Client.

```
var client = new ozpIwc.Client({ peerUrl: "http://localhost:13000});
var dataApi = client.data;
```

### Referencing Data API Nodes
The IWC uses the concept of **references** when accessing resources. References
are objects with auto-generated functionality to perform **actions** on
a given resource.

To create a reference to a resource, use the `Reference` constructor of the
desired api, `data` in this case, with a string of the resource path:
```
var ballRef = new client.data.Reference("/ball");
```

### Data API Actions
The following actions can be performed on a data api resource:

| Action  | has Callback? | Description                                                                                     |
| ------- | ------------- | ----------------------------------------------------------------------------------------------- |
| [get](../common/get.md)   | no            | gathers the node with the specific key                                                          |
| [bulkGet](../common/bulkGet.md) | no            | gathers all nodes  who's key matches the given partial-key                                       |
| [list](../common/list.md)    | no            | gathers all node **keys** who match the given partial-key                                       |
| [set](../common/set.md)     | no            | stores the given value to the specified node                                                    |
| [delete](../common/delete.md)  | no            | deletes the node with the specific key                                                          |
| [watch](../common/watch.md)   | yes           | gathers the node with the specific key and calls the registered callback on updates to the node |
| [unwatch](../common/unwatch.md) | no            | unregisters the callback for the node                                                           |
| [addChild](addChild.md) | no            | creates a node pathed under the specified node and updates the specified nodes collection|
| [removeChild](../common/delete.md) | no            | **DEPRECATED: Use delete action.** removes the specified child node.|
