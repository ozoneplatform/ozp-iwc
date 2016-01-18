##Common API Action: list()


###Applies to All IWC APIs

###Retrieves a collection of node keys
Much like the [bulkGet](bulkGet.md) action, the `list` action applies to a
partial path reference. Any resource path at or below the reference path will
be returned. This returns an array of strings, rather than bulkGet that returns
the value of the resource as well.

For example, the Names API has a collection of resources on the various APIs
connected to the IWC. These resources are labeled as `/api/{address}`
(/api/data.api, /api/names.api, ...).

```
var apiRef = new client.names.Reference("/api/");
var apiPaths;

apiRef.list().then(function(paths){
   var apiPaths = paths
});
```

The value of `paths`, the resolved array of the list request is formatted as follows:
```
[
    "/api/data.api",
    "/api/intents.api",
    "/api/names.api",
    "/api/system.api",
    "/api/locks.api"
]
```


##Requesting a List that Finds no Matching Nodes
While a `get` request for a node that does not exist returns a `noResource`
error, a `list` with a partial key string that matches no node is a valid action
because the IWC checks its nodes without failure. The response would be an
empty array:
```
[]
```
