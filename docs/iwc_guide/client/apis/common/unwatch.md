##Common API Action: unwatch(nodeKey,unwatchData)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
* `unwatchData`: **Object** - the settings to store the node.
* `unwatchData.src`: **String** - the address the watch is registered to.
* `unwatchData.msgId`: **String** - the message Idthe watch is registered to.
 
###Applies to All IWC APIs

###Stopping a watch external to its callback
In some cases, stopping a watch may be desired outside of the onChange callback. For this reason, there is the `unwatch`
action. This allows watch actions to be stopped **outside of the registered application**. 

When registering a watch, 2 important properties are returned in the resolution:

1.  **dst**: the participant that sent the request
2.  **replyTo**: the packet that was sent to create the watch

With these 2 properties, the watch can be unregistered using `unwatch` as so:
```
var watchData = {
    src: null,
    msgId: null
};

dataApi.watch('/foo',onChange).then(function(res){
    watchData.src = res.dst;
    watchData.msgId = res.replyTo;
    
});

// Somewhere else after the watch resolution occurs 
dataApi.unwatch('/foo',watchData);
```

`watchData` in the example above could be stored in a Data API node and accessed by a separate application to stop the
watch action.

