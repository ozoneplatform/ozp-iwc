##Common API Action: watch(callback)
* `callback`: **Function** - the function to call when the API Node has changed. When called, two parameters are passed
 to it: `callback(change,done)`
    * `change`: **Object** - A formatted event containing state information about the node's value and collections
        * `change.newValue`: **Object** - the new value of the node's `entity`.
        * `change.oldValue`: **Object** - the old value of the node's `entity`.
        * `change.newCollection`: **Array** - (if the node has a pattern value) the new collection of node keys of the
        node is tracking.
        * `change.oldCollection`: **Array** - (if the node has a pattern value) the old collection of node keys of the
        node is tracking.
        * `change.deleted`: **Boolean** - a boolean indicator if this callback was called because the node was
        deleted.
    * `done`: **Function** - A function to call if after this callback finishes the watch action is no longer needed. Called
    with `done()`.

###Applies to All IWC APIs

###Watches a Given Node
To watch a node stored in an API for changes, the **watch** action is used on a
reference to the node.

The promise resolves when a response to the request is handled, **not when a
change has occurred**.

The callback is called whenever there is a change in the node.

####Value Change Example
This example watches the `/foo` node in the Data API. It stops its callback from
firing once the value of the entity of
`/foo` is `2`.
```
var fooRef = new client.data.Reference("/foo");

fooRef.watch(function(change,done){
    var newVal = change.newValue;
    var oldVal = change.oldValue;

    if(newVal === 2){
        done();
    }
});
```

####Advanced: Collection Change Example
This Example uses the `/balls` node to track all Data API node's who's key
begins with `/balls/` and calls it's callback if:
1. `/balls` changes
2. a node beginning with `/balls/` is created or destroyed.

In order to obtain the collection data initially, a full promise
response is needed. Passing a `fullResponse: true` in the default packet
properties argument will return the full response message **in promise resolution
and rejection**. This does not apply to callbacks given to the action.

```
var config = {
    pattern: "/balls/",
    collect: true,
    fullResponse: true
};
var ballsRef = new client.data.Reference("/balls",config);

var onBallsChanged=function(change) {
    change.newCollection.forEach(function(b) {
       //Do something with the new collection keys.
    });

};

ballsRef.watch(onBallsChanged).then(function(reply){
    // This resolution is called on the response of the watch,
    // so we can gather our collection immediately
    reply.collection.forEach(function(b) {
        //Do something with the collection keys
    });
});
```


####Watching a resource that gets deleted
When a resource that is being watched gets deleted, the watchers of said resource
receive a change notification indicating the deletion.

```
 {
    "newValue": null,
    "OldValue":{
        "foo": "bar"
    },
    "oldCollection": [
        "/balls/63abb1f0",
        "/balls/a650bb08"
    ],
    "newCollection": null,
    "deleted": true
 }

```

The value of `deleted` will be marked true to indicate the resource has been
deleted. The watch will remain active regardless of deletion and notify if it is
recreated. If removing a watch on deletion of a resource is desired, applying
conditional logic for the `done()` flag based on `deleted` can produce
this functionality.
