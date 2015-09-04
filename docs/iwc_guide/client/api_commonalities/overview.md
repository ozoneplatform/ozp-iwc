### API Functionality
All IWC APIs utilize promises to make asynchronous access easier. In addition some API actions use callbacks for event 
based operations. 

A promise resolution is a function call with the response of the IWC Bus processing the action: 

A `get` resolves with the value the IWC bus has stored for the given node.
```
dataApi.get("/foo").then(function(resp){
    console.log("The value of '/foo' is: ", resp.entity);
})
```

A callback is a function call that happens when the IWC Bus alerts the client that it's registered event has occured:
A `watch` action resolves (promise resolution) with the current value of the watched node, while it's callback is
called whenever the node's value changes.

```
var onChange = function(event){
    console.log("The value of '/foo' was: ", event.entity.oldValue);
    console.log("The value of '/foo' now is: ", event.entity.newValue);
});

dataApi.watch("/foo",onChange).then(function(resp){
    console.log("The value of '/foo' is: ", resp.entity);
});
```