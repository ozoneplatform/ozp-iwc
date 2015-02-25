##Retrieving a Resource from the Data API
To retrieve a resource stored in the Data API the get action is used. The retrieval is asynchronous, and the response is
passed through the resolution of the action's promise.

```
var dataApi = client.data();

var foo;

dataApi.get('/foo').then(function(res){
        foo = res.entity;
});
```

Requesting a resource that does not exist is not an invalid action, this will result in an `'ok'` response, an
entity of `{}` and the resource created in the Data API (without persistence).

