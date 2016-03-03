##Common API Action: get(nodeKey)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
 
###Applies to All IWC APIs

###Retrieves a Given Node
    
    
To retrieve a node stored in an API the `get` action is used. The retrieval is asynchronous, and the response is
passed through the resolution of the action's promise.

```
var dataApi = client.data();

var foo;

dataApi.get('/foo').then(function(res){
        foo = res.entity;
});
```

The value of `res`, the resolved object of the get request, is formatted as follows:

```
{
    "response":"ok",
    "src":"data.api",
    "dst":"4e31a811.31de4ddb",
    "entity":{ 
        "bar": 'buz' 
    },
    "ver":1,
    "time":1424897872164,
    "msgId":"i:33"
    "replyTo":"p:7",
}
```

##Requesting a node that does not exist
 Requesting a node that does not exist is not an valid action, this will result in an promise rejection with a
`'noResource'` response and an entity containing the request packet.

```
var dataApi = client.data();

dataApi.get('/a/nonexistant/resource').catch(function(err){
        //err.response === "noResource"
});
```

The value of `err`, the rejected object of the get request, is formatted as follows:

```
{
    "ver": 1,
    "src": "data.api",
    "msgId": "p:686",
    "time": 1435674200150,
    "response": "noResource",
    "entity": {
      "ver": 1,
      "src": "c1f6b99e.21851da2",
      "msgId": "p:692",
      "time": 1435674200148,
      "dst": "data.api",
      "action": "get",
      "resource": "/a/nonexistant/resource",
      "entity": {}
    },
    "replyTo": "p:692",
    "dst": "c1f6b99e.21851da2"
}
```