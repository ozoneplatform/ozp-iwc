##Available APIs
The IWC client code is not dependent on the IWC bus. When the client connects to a bus it becomes aware of the APIs
available on said bus and configures function calls for those APIs.

This code demonstrates showing a console print out of what APIs are available, the actions
they can handle, and the client's function name assigned to it.

```
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});
client.connect().then(function(){
var apis = client.apiMap;
    for(var api in apis) {
        console.log("Api: ", apis[api].address, "Actions: ", apis[api].actions, "Function: ", apis[api].functionName);
    };
});
```

As an example, an output of this code may yield:

```
Api: data.api
Actions: "get", "set", "delete", "watch", "unwatch", "addChild", "removeChild", "list"
Function: data
```

This means the client can  **get** a resource from the **data.api** by calling:
`client.data().get("/some/resource");`

The purpose of this is to inform the developer of what functionality they have to work with given a particular bus.

To learn more about api use, see [API Requests](api_requests.md).