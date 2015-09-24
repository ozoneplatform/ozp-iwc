##Storing a Resource in an API
Storing an object in an API makes it available to other connected clients. This is useful for resources that are
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

**[lifespan]**: the lifespan of the resource. There are 3 possible lifespans: 

* `"Persistent"`: will store the resource as it changes to the backend. **This lifespan is only available to  and is the default for the data.api.**
    and is the default lifespan for a data.api resource. Changing a resource from persistent won't remove it from the
    backend, rather prevent further updates to be sent to the backend.
* `"Bound"`: will destroy the resource from the bus if it's bound clients (application) are allclosed. Each client that sets 
    a resource's lifespan as bound will be added to the resources bound list, once all bound addresses are closed the 
    resource is destroyed. **This lifespan is default for the names.api.**
* `"Ephemeral"`: will keep the resource around as long as the bus is instantiated. When all connections to the bus
    close this resource is destroyed. **This lifespan is default for the intents.api and system.api.**
    
The lifespan parameter does not have to be passed with every `set` action, rather passing it with the action will toggle
changing the lifespan, it is advised to set the lifespan with the initial use of the resource in an application.


**[contentType]**: the content type of the object that will be set. This is an optional parameter, in some APIs resources
have refined control based on the content they hold.

**[pattern]**: A string matching a partial path of resources. This is used to allow resources to include updates when 
about other relevant resources when watched. For example a pattern of "/foo/" on resource `/foo` would return
all resources below "/foo/" if watched for changes ("/foo/1", "/foo/2", ...). This is an optional parameter, it will 
only update on the resource if you include it in the request. See [Watching Resources](core_apis/common/watching.md) 
for further details.

Since the set is asynchronous, the client does not need to wait for the action to occur. Although, if an implementation
desires waiting it can be done through the `then` of the set call.


**Note:** If the API does not allow storing of resources (read-only APIs or read-only resources), the promise will 
reject with a response of "noPermission".

```
var systemApi = client.system();

systemApi.set('/application/1234-1234-1234-1234').catch(function(err){
    //err.response === "noPermission"
});
```