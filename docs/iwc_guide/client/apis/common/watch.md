##Common API Action: watch(nodeKey,nodeValue,callback)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
* `nodeValue`: **Object** - the settings to store the node.
* `[nodeValue.pattern]`: **String** - (Optional) A string matching a partial path of resources. This is used to allow 
resources to include updates when about other relevant resources when watched. For example a pattern of "/foo/" on 
resource `/foo` would return all resources below "/foo/" if watched for changes ("/foo/1", "/foo/2", ...). This is an 
optional parameter, it will only update on the node if you include it in the request. 
* `callback`: **Function** - the function to call when the API Node has changed. When called, two parameters are passed
 to it: `callback(reply,done)`
    * `event`: **Object** - A formatted event containing state information about the node's entity and collections
        * `event.entity`: **Object** - the state change information.
        * `event.entity.newValue`: **Object** - the new value of the node's `entity`.
        * `event.entity.oldValue`: **Object** - the old value of the node's `entity`.
        * `event.entity.newCollection`: **Array** - (if the node has a pattern value) the new collection of node keys of the 
        node is tracking.
        * `event.entity.oldCollection`: **Array** - (if the node has a pattern value) the old collection of node keys of the 
        node is tracking.
        * `event.entity.deleted`: **Boolean** - a boolean indicator if this callback was called because the node was
        deleted.
    * `done`: **Function** - A function to call if after this callback finishes the watch action is no longer needed. Called
    with `done()`.
 
###Applies to All IWC APIs

###Watches a Given Node 
To watch a node stored in an API for changes, the **watch** action is used.

The promise resolves when a response to the request is handled, **not when a change has occurred**.

The callback is called whenever there is a change in the node.

####Entity Change Example
This example watches the `/foo` node in the Data API. It stops its callback from firing once the value of the entity of
`/foo` is `{'foo': 1}`.
```
var dataApi = client.data();

var onChange = function(event,done){
    var newVal = event.entity.newValue;
    var oldVal = event.entity.oldValue;

    var doneCondition = { 'foo': 1 };

    if(newVal === doneCondition){
        done();
    }

};

dataApi.watch('/foo',onChange);
```

####Collection Change Example
This Example uses the `/balls` node to track all Data API node's who's key begins with `/balls/` and calls it's callback
if: (1) `/balls` changes, or (2) a node beginning with `/balls/` is created or destroyed.
```
var onBallsChanged=function(event) {
    event.entity.newCollection.forEach(function(b) {
       //Do something with the new collection keys.
    });

};

client.data().watch("/balls", pattern: "/balls/"},onBallsChanged).then(function(reply){
    //This resolution is called on the response of the watch, so we can gather our collection immediately 
    reply.collection.forEach(function(b) {
        //Do something with the collection keys
    });
});
```


####Watching a resource that gets deleted
When a resource that is being watched gets deleted, the watchers of said resource receive a change notification 
indicating the deletion.

```
{
    "ver": 1,
    "src": "cd78b1cf.21851da2",
    "msgId": "p:44993",
    "time": 1435676498955,
    "dst": "c1f6b99e.21851da2",
    "replyTo": "p:41340",
    "response": "changed",
    "resource": "/balls",
    "permissions": {},
    "entity": {
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
}
```

The value of `entity.deleted` will be marked true to indicate the resource has been deleted. The watch will remain active
regardless of deletion and notify if it is recreated. If removing a watch on deletion of a resource is desired, applying
conditional logic for the `done()` flag based on `entity.deleted` can produce this functionality.