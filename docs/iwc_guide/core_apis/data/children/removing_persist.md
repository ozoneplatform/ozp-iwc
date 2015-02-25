##Removing a Child Resource from the Data API with Persistence
Just like with other persistence actions, adding `persist:true` to the resource entity will cause the API to
persist the child resource removal on the backend.

To know what child to remove, the resource key returned in the
[`addChild` resolution](core_apis/data/children/storing.md) is passed in the entity's resource field.

```
var dataApi = client.data();

var removeEntry = {
    resource: "/shoppingCart/1234"
};
removeEntry.persist = true;

dataApi.removeChild('/shoppingCart',{ entity: removeEntry});
```