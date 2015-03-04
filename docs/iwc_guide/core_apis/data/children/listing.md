##Getting a List of a Data API Resources's Children
To get a list of all resources that are children of a resource, the `list` action is used.

Unlike getting a list of [all resources in the Data API](../listing.md), passing a resource key into the list function returns an array
of resource keys that are direct children of the resource.

```
var dataApi = client.data();

var cartItems = [];

dataApi.list('/shoppingCart').then(function(res){
    cartItems = res.entity;
});
```
