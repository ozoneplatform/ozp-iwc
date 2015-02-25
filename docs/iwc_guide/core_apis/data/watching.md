##Watching a resource in the Data API
To watch a resource stored in the Data API for changes, the **watch** action is used.

the promise resolves when a response to the request is handled, **not when a change has occurred**.

The onChange callback is called whenever there is a change in the resource.

```
var dataApi = client.data();

var onChange = function(reply,done){
    var newVal = reply.entity.newValue;
    var oldVal = reply.entity.oldValue;

    var doneCondition = { 'foo': 1 };

    if(newVal === doneCondition){
        done();
    }

};

dataApi.watch('/foo',onChange);
```

***

The value of the onChange callback's `reply` argument varies from a normal response (see [Receiving Responses](getting_started/api/api_responses.md)):

```
{
    "dst":"20c0f063.b80a890a",
    "src":"data.api",
    "replyTo":"p:1856",
    "response":"changed",
    "resource":"/foo",
    "entity":{
        "newValue":{"bar":"bark"},
        "oldValue":{"bar":"buz"},
        "removedChildren":[],
        "addedChildren":[]
    },
    "ver":1,
    "msgId":"i:3761",
    "time":1424901227419
}
```

**response**: The reply's response will not be `"ok"` like a request's response, rather a `"changed"` will denote the
value has changed.

**entity**: The entity of the reply is not value stored in the resource, rather a report of the change in state of the resource.

**entity.newValue**: The new value of the resource.

**entity.oldValue**: The old value of the resource.

**removedChildren**: Children resources that were removed (see [Removing Children Resources](children/removing.md))

**addedChildren**: Children resources that were added (see [Adding Children Resources](storing.md))


To stop watching the resource based on its state, calling the `done()` function passed to the callback will remove
 the watch.