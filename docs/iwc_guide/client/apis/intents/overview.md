# Intents API
Following the idea of android intents. The IWC Intents API allows applications to register to handle
certain intents (ex. graphing data, displaying HTML) as well as emit intents to be handled by other applications. 

Like android, the IWC Intents api presents the user with a dialog to choose what application should handle their request.

![img](../../../assets/intent_chooser.gif)
_Widgets in the [OZONE Webtop](https://github.com/ozone-development/ozp-webtop) using intents to handle mapping data. 
The modal opened is Webtop's unique IWC dialog to make intent handler decisions. IWC used outside of Webtop utilizes a 
popup window to make intent handler decisions._


***

### Accessing the Intents API
The Intents API is accessed by calling the `intents()` property of a connected IWC Client.

```
var client = new ozpIwc.Client({ peerUrl: "http://localhost:13000});
client.connect().then(function(){

    var intentsApi = client.intents();

});
```

### Intents API Actions
| Action  | has Callback? | Description                                                                                     |
| ------- | ------------- | ----------------------------------------------------------------------------------------------- |
| [get](../common/get.md)   | no            | gathers the node with the specific key                                                          |
| [bulkGet](../common/bulkGet.md) | no            | gathers all nodes  who's key matches the given partial-key                                       |
| [list](../common/list.md)    | no            | gathers all node **keys** who match the given partial-key                                       |
| [set](../common/set.md)     | no            | stores the given value to the specified node                                                    |
| [delete](../common/delete.md)  | no            | deletes the node with the specific key                                                          |
| [watch](../common/watch.md)   | yes           | gathers the node with the specific key and calls the registered callback on updates to the node |
| [unwatch](../common/unwatch.md) | no            | unregisters the callback for the node                                                           |
| [register](register.md)   | yes           | registers a handler function to a node to be called when invoked by others|
| [invoke](invoke.md)   | no            | emits an intent to be handled by one registered handler function. |
| [broadcast](broadcast.md)   | no            | emits an intent  to be handled by all registered handler function. |