##Common API Action: bulkGet(nodeKeyPartial)
* `nodeKeyPartial`: **String** - the partial string to match against all of an API's nodes to determine if a node 
should be gathered. ([What is an API Node?](../../resources.md))
 
###Applies to All IWC APIs
    
###Retrieves a collection of nodes
In some cases, gathering multiple resources at once is desired. The `bulkGet` action takes a partial node path, and 
returns the values for all of the API's nodes that match.

For example, the Names API has a collection of resources on the various APIs connected to the IWC. These resources are
labeled as `/api/{address}` (/api/data.api, /api/names.api, ...).

```
var namesApi = client.names();
var apiMap = {}
names.bulkGet("/api").then(function(res){
    for(var i in res.entity){
        var resource = res.entity[i].resource;
        var apiEntity = res.entity[i].entity;
        
        apiMap[resource] = apiEntity;
    }
});
```

The value of `res`, the resolved object of the bulkGet request is formatted as follows (omitted entries due to length):
```
{
    "ver": 1,
    "src": "names.api",
    "msgId": "p:119470",
    "time": 1435701118804,
    "contentType": "application/json",
    "entity": [
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
    ],
    "response": "ok",
    "replyTo": "p:3370",
    "dst": "abc57c00.e3b19f7f"
}
```


##Requesting a Bulk Get that Finds no Matching Nodes
While a `get` request for a node that does not exist returns a `noResource` error, a `bulkGet` with a partial key string
that matches no node is a valid action because the IWC checks its nodes without failure. The response would contain an
empty array for its entity:
```
{
    "ver": 1,
    "src": "names.api",
    "msgId": "p:119499",
    "time": 1435701123816,
    "contentType": "application/json",
    "entity": [],
    "response": "ok",
    "replyTo": "p:3371",
    "dst": "abc57c00.e3b19f7f"
}
```
