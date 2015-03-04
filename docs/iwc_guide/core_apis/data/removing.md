##Removing a resource from the Data API
To remove a resource stored in the Data API the `delete` action is used.

This only removes the resource from the Data API and not the persistent back-end.

```
var dataApi = client.data();

dataApi.delete('/foo');
```