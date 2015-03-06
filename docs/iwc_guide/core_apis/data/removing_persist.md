##Removing a resource from the Data API with persistence
To remove a resource from the back-end, passing an entity with `persist:true` will trigger a delete request
to the backend.

```
var dataApi = client.data();

var foo = {persist:true};

dataApi.delete('/foo',{ entity:foo });
```