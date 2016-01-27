##Data API Refernce Action: addChild(nodeValue)
* `nodeValue`: **Object** - the value to store in the **child** node.

###Applies to only the Data API

###Creates a Child Node given a A Parent Node's Key

To add a child node, the `addChild` action is used on the desired parent **reference**.

Adding a child to the Data API triggers its parent to keep an up-to-date list of its child resources in its
`collection` property. This means doing a `get` on the `/shoppingCart` **reference** below will return a collection of children node keys.

Since the node key of the child is runtime generated, it will be returned in the promise resolution's
`entity.resource` as a string.

```
var shoppingCartRef = new iwc.data.Reference("/shoppingCart");

var cartEntry = {
    'price': 10,
    'size': 'M',
    'color': 'red',
    'quantity': 1
};

var cartEntryResource = "";

shoppingCartRef.addChild(cartEntry).then(function(childResource) {
    cartEntryResource = childResource;
});
```
