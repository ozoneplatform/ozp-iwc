##Common API Action: list(nodeKeyPartial)
* `nodeKeyPartial`: **String** - the partial string to match against all of an API's nodes to determine if a node's key
should be gathered. ([What is an API Node?](../../resources.md))
 
###Applies to All IWC APIs
    
###Retrieves a collection of node keys
Much like the [bulkGet](bulkGet.md) action, the `list` action takes a string to match against all node key's in an API
to determine if a key should be returned.

For example, the Names API has a collection of resources on the various APIs connected to the IWC. These resources are
labeled as `/api/{address}` (/api/data.api, /api/names.api, ...).

```
var namesApi = client.names();
var apiMap = {}
names.list("/api").then(function(res){
   var keys = res.entity
});
```

The value of `res`, the resolved object of the list request is formatted as follows:
```
{
  "ver": 1,
  "src": "names.api",
  "msgId": "p:115",
  "time": 1443457957909,
  "contentType": "application/json",
  "entity": [
    "/api/data.api",
    "/api/intents.api",
    "/api/names.api",
    "/api/system.api",
    "/api/locks.api"
  ],
  "response": "ok",
  "replyTo": "p:119",
  "dst": "87f6fbeb.b8a5ec6c"
}
```


##Requesting a Bulk Get that Finds no Matching Nodes
While a `get` request for a node that does not exist returns a `noResource` error, a `list` with a partial key string
that matches no node is a valid action because the IWC checks its nodes without failure. The response would contain an
empty array for its entity:
```
{
    "ver": 1,
    "src": "names.api",
    "msgId": "p:179",
    "time": 1443457984404,
    "contentType": "application/json",
    "entity": [],
    "response": "ok",
    "replyTo": "p:155",
    "dst": "87f6fbeb.b8a5ec6c"
}
```
