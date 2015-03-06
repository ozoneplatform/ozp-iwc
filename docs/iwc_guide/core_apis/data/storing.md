##Storing a Resource in the Data API
Storing an object in the Data API makes it available to other connected clients. This is useful for resources that are
desired among multiple applications but do not need communication between said applications.

To store a resource, the **set** action is used.

```
var dataApi = client.data();

var foo = { 'bar': 'buz' };

dataApi.set('/foo',{ entity: foo }).;
```

In this example, the resource `/foo` in the Data API is called to store `{ 'bar': 'buz' }` with the **set** action.

The value of foo is wrapped in an object's entity field because there are multiple properties
that can drive the APIs handling of the request:

**entity**: the value of the object that will be set.

**contentType**: the content type of the object that will be set.

Since the set is asynchronous, the client does not need to wait for the action to occur. Although, if an implementation
desires waiting it can be done through the `then` of the set call.