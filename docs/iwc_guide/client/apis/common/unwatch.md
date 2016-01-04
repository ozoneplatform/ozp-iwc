##Common API Action: unwatch(unwatchData)
* `unwatchData`: **Object** - the settings to store the node.
* `unwatchData.src`: **String** - the address the watch is registered to.
* `unwatchData.msgId`: **String** - the message Idthe watch is registered to.

###Applies to All IWC APIs

###Stopping a watch external to its callback
In some cases, stopping a watch may be desired outside of the onChange callback.
 For this reason, there is the `unwatch` action that can be called on a reference.
This allows watch actions to be stopped **outside of the registered application**.

To utilize this, the reference used for registration needs to have its
`fullResponse`  property of its configuration set to true:
```
var fooRef = new client.data.Reference("/foo",{fullResponse: true});
```

When registering a watch, 2 important properties are returned in the
full response resolution:

1.  **dst**: the participant that sent the request
2.  **replyTo**: the packet that was sent to create the watch

With these 2 properties, the watch can be unregistered using `unwatch` as so:
```
var watchData = {
    src: null,
    msgId: null
};

fooRef.watch(onChange).then(function(response){
    watchData.src = response.dst;
    watchData.msgId = response.replyTo;

});

// Somewhere else after the watch resolution occurs
fooRef.unwatch(watchData);
```

`watchData` in the example above could be stored in a Data API node and accessed
by a separate application to stop the watch action.
