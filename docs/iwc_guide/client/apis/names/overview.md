# Names API
Status of the bus. This api exposes information regarding applications connected to the bus. This is a read-only API.
The Names API does not load persistent data from the backend, all nodes are generated at run time.

***

### Accessing the System API
The Intents API is accessed by calling the `names()` property of a connected IWC Client.

```
var client = new ozpIwc.Client({ peerUrl: "http://localhost:13000});
client.connect().then(function(){

    var namesApi = client.names();

});
```

### Names API Actions
| Action  | has Callback? | Description                                                                                     |
| ------- | ------------- | ----------------------------------------------------------------------------------------------- |
| [get](../common/get.md)   | no            | gathers the node with the specific key                                                          |
| [bulkGet](../common/bulkGet.md) | no            | gathers all nodes  who's key matches the given partial-key                                       |
| [list](../common/list.md)    | no            | gathers all node **keys** who match the given partial-key                                       |
| [set](../common/set.md)     | no            | stores the given value to the specified node                                                    |
| [delete](../common/delete.md)  | no            | deletes the node with the specific key                                                          |
| [watch](../common/watch.md)   | yes           | gathers the node with the specific key and calls the registered callback on updates to the node |
| [unwatch](../common/unwatch.md) | no            | unregisters the callback for the node                                                           |


###Names API node structure
The Names API relies on the path-level separation node scheme to easily separate differences in resources. 

The table below breaks down the differences in each level.

All of the following node keys can be gathered as collections using the list action (see 
[Listing Resources](../common/listing.md))

**/api/{address}**: An API on the bus. Contains an array of actions pertaining to the API.

**/address/{address}**: A connection to the bus. All components of the IWC bus have an assigned address. Contains 
information on the component assigned to the address.

**/multicast/{group}/{member}**: A group-specific multicast member. Multicast messages are distributed to all members 
of the group (internal messaging not client messaging). Contains information on the component assigned to the address.

**/router/{address}**: A router connected to the IWC bus. Each window has a router to distribute messages amongst its
participants. Contains information on its participants.

| Node                        | Content Type                                      | set | get | delete |
|-----------------------------|---------------------------------------------------|-----|-----|--------|
| /api/{address}              | application/vnd.ozp-iwc-api-v1+json               | no  | yes | no     |
| /address/{address}          | application/vnd.ozp-iwc-address-v1+json           | no  | yes | no     |
| /multicast/{group}/{member} | application/vnd.ozp-iwc-multicast-address-v1+json | no  | yes | no     |
| /router/{address}           | application/vnd.ozp-iwc-router-v1+json            | no  | yes | no     |

Requesting an action on a node that does not fit the given node structure will result in a response of 
"badResource":
```
{
    "ver": 1,
    "src": "names.api",
    "msgId": "p:95269",
    "time": 1435697461893,
    "response": "badResource",
    "entity": {
        "ver": 1,
        "src": "3de31e8b.a5efe614",
        "msgId": "p:88546",
        "time": 1435697461811,
        "dst": "names.api",
        "action": "get",
        "resource": "/hello",
        "entity": {}
    },
    "replyTo": "p:88546",
    "dst": "3de31e8b.a5efe614"
}
```
