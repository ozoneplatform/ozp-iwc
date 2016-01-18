##Common API Action: bulkGet()

###Applies to All IWC APIs

###Retrieves a collection of nodes
In some cases, gathering multiple resources at once is desired. The `bulkGet`
action takes a reference to a partial node path, and returns the values for all
of the API's nodes that match.

For example, the Names API has a collection of resources on the various APIs
connected to the IWC. These resources are labeled as `/api/{address}`
(/api/data.api, /api/names.api, ...). Referencing the partial path `/api/` means
that when calling `bulkGet`, all resource pathed under `/api/` will be returned.


```
var apiRef = new client.names.Reference("/api");
var apiMap = {}

apiRef.bulkGet().then(function(values){
    for(var i in values){
        var resource = values[i].resource;
        var apiEntity = values[i].entity;

        apiMap[resource] = apiEntity;
    }
});
```

#### Differance in promise response to other actions
Since this action is doing a lookup with a partial resource path, values of multiple
node resources may be returned. In order distinguish which node provided which
value, a more detailed response is used when calling `bulkGet`. Similar to the
format of responses in the [Comprehensive IWC Requests](), bulk get returns
**an array of full-detail response messages**.

While most of the properties in the response packet aren't utilized in general
IWC use, two properties of the response are important:
1. `entity` - the value of the node.
2. `resource` - the path of the node.
```
[
    {
        "entity": {
            "actions": [
                "get",
                "set",
                "delete",
                "watch",
                "unwatch",
                "list",
                "bulkGet",
                "addChild",
                "removeChild"
            ]
        },
        "lifespan": {
            "type": "Ephemeral"
        },
        "contentType": "application/vnd.ozp-iwc-api-v1+json",
        "permissions": {},
        "eTag": 1,
        "resource": "/api/data.api",
        "collection": []
    },
    {
        "entity": {
            "actions": [
                "get",
                "set",
                "delete",
                "watch",
                "unwatch",
                "list",
                "bulkGet"
            ]
        },
        "lifespan": {
            "type": "Ephemeral"
        },
        "contentType": "application/vnd.ozp-iwc-api-v1+json",
        "permissions": {},
        "eTag": 1,
        "resource": "/api/names.api",
        "collection": []
    },
    // Omitted additional entries due to size...
];
```


##Requesting a Bulk Get that Finds no Matching Nodes
While a `get` request for a node that does not exist returns a `noResource` error,
a `bulkGet` with a partial key reference that matches no node is a valid action
because the IWC checks its nodes without failure. The response would be an
empty array:
```
[]
```
