##Storing a Child Resource in the Data API with Persistence
Just like with other persistence actions, adding `persist:true` to the resource's `entity` will cause the API to
persist the resource to the backend.

```
var dataApi = client.data();

var cartEntry = {
    'price': 10,
    'size': 'M',
    'color': 'red',
    'quantity': 1
};

cartEntry.persist = true;

var cartEntryResource = "";

dataApi.addChild('/shoppingCart',{ entity: cartEntry}).then(function(res){
    cartEntryResource = res.entity.resource;
});
```