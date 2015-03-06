##Storing a Resource in the Data API with Persistence
Persisting a Data API action to the backend is as simple as including `persist:true` to the entity of the request.

Without adding `persist:true`, updating a resource in the Data API would only last as long as the bus is open. If an
action needs to persist longer than the user's current session applying persistence is neccessary.

```
var dataApi = client.data();

var foo = { 'bar': 'buz' };

foo.persist = true;

dataApi.set('/foo',{ entity: foo });
```

Since the set is asynchronous, the client does not need to wait for the action to occur. Although, if an implementation
desires waiting it can be done through the `then` of the set call.