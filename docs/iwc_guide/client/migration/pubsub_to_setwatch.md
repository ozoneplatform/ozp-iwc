##Moving from Publish/Subscribe to Set/Watch
IWC does not do publish/subscribe because it is a state-driven framework. With that change, the functionality of
publish/subscribe can still be used with the new data.api by using the `set` and `watch` actions. Since the IWC is
state-driven, the `watch` action's promise resolution gathers the value of the resource if it is currently available on
the bus and calls its callback function any time the resource value changes.

###Example: Publish/Subscribe for a Clock
####OWF
**Publish**: Publishes the current time every second on channel: ClockChannel
```
window.setTimeout(function(){
    OWF.Eventing.publish("ClockChannel", Date.now());
}, 1000);
```

**Subscribe**: Listens for publishes on channel: ClockChannel
```
OWF.Eventing.subscribe("clockChannel", function(sender,msg){
    console.log("Sender: ", sender, " Message: ", msg);
});
```



####IWC
**[Set](../core_apis/common/storing.md)**: Sets the value with the current time every second to data.api resource: `/ClockChannel`.
```
var iwc = new ozpIwc.Client("http://localhost:13000");
var clockRef = iwc.data.Reference("/ClockChannel");
window.setTimeout(function(){
    var value = {
      msg: Date.now(),
      sender: iwc.address
    };
    clockRef.set(value);
}, 1000);
```


**[Watch](../core_apis/common/watching.md)**: Listens for changes to the `/ClockChannel` resource.

```
var iwc = new ozpIwc.Client("http://localhost:13000");
var clockRef = iwc.data.Reference("/ClockChannel");
clockRef.watch(function(change){
    var newValue = change.newValue;
    if(newValue) {
        console.log("Sender: ", newValue.sender, " Message: ", newValue.msg);
    }
});
```


###Notes:
* **Data.api resources (IWC) persist to the server by default as how Preferences (OWF) did**: If you do not want your
data resources persisting and add a `lifespan: "Ephemeral"` to the set action's object: `{entity: value, lifespan: "Ephemeral"}`.
See the [lifespan](../core_apis/common/storing.md) documentation for further information.
* **Channel name (OWF) and Resource name (IWC) differences**: IWC bases its resources off of the URI pathing, so the
resource `/ClockChannel` is a relative path to where it would be accessed if persisted to the backend:
`<user's data api URL path>/ClockChannel`. The concept of relative resources should be pathed based on forward slashes
`/`, as to promote better data separation. For example, all data.api resources for some application `MyApp` may be pathed
 as `/MyApp/<resource name>`. This also allows for advanced resource gathering actions based on common paths (listing
 all resources who's relative path begins with `/MyApp/clocks/`  would gather `/MyApp/clocks/1`, `/MyApp/clocks/2`, ... .

* **IWC Set requires the value wrapped in `entity`**: This is because IWC action's allow for more than just the value of
 the resource to be modified. For data storing and sharing purposes, consider the `{entity: value}` structure to
 be the encapsulation of the message, and when gathering resources (get action) treat the `entity` value of the response
 to be the value stored.

* **IWC Watch event data is in a different format than most IWC action responses**: The watch callback returns data in
a slightly different format because it has to return both the new and old values of the entity, as well as new and old
values of the resource's collection (its relation to other resources). Treat the `event` as a response like any other
IWC action, but the `change` property is a wrapper around the actual entity where:
    * `change.newValue` is the new value of entity
    * `change.oldValue` is the old value of the entity.
    * `change.newCollection` is the new collection for the resource.
    * `change.oldCollection` is the old collection for the resource.



###Added Capabilities with IWC
Since the IWC is a state-driven framework, if an application has a watch registration for a resource, it doesn't need
to wait for the next state change of the resource to utilize it. The watch action returns the current state of the
resource in its promise resolution:

####IWC
```
var iwc = new ozpIwc.Client("http://localhost:13000");
var clockRef = iwc.data.Reference("/ClockChannel");
var onChange = function(event) {...};
clockRef.watch(onChange).then(value) {
    if(value) { // the resource exists already and we have a copy of its value now.
        console.log("Sender: ", value.sender, " Message: ", value.msg);
    }
}

```

####Benefits of this functionality
[Lifespan](../core_apis/common/storing.md) of the resource dependent, if application A stores a resource in `/foo` and is closed and application B is
opened that watches for changes to `/foo` to do some action, it can handle the data set in application A without having
both applications open.
