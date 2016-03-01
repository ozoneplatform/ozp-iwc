##Intents API Action: invoke(nodeValue)
* `nodeValue`: **Object** -  the data to be broadcasted to one matching handler.


###Applies to only the Intents API

###Invoke an intent to be Handled by some IWC Intent Registration

When an application wants to offload operations to other applications on the bus, intent invocations are used. Much like
Android intents, a payload is not a requirement to send with the intent but is an added benefit. Intents can be used
for notifications (broadcast to all applications on the bus), triggering some background operation (shutdown utilities),
offloading common tasks (visualizing data, compiling output files, converting documents), and much more.


To invoke an intent, the `invoke` action is used:
```
var jsonRef = iwc.intents.Reference("/application/view/json");
var payload = {
    "Hello": "World!"
};

jsonRef.broadcast(payload).then(function(res){
    // resolves when the one ran handler has handled the intent request.
    // resolves with the return value of the handler
});
```

Additionally, a callback can be added as a 3rd parameter to watch the status of the intent.

The callback receives 2 parameters:
 1. `reply`: contains various information about an intent. For the introductory purposes of intent registrations, only
 `reply.entity` is covered here, other properties will be covered for more advanced intents in a later tutorial.
 2. `done`: A function to call to stop handling intent requests. Useful for conditionally stopping intent handling.

| property | type   | description                                |
|----------|--------|--------------------------------------------|
| entity   | Object | Data pertaining to the state of the intent.|
| entity.handler| Object| Data pertaining to the IWC client handling the request.|
| entity.handler.address| String| The address of the handling IWC client.|
| entity.handler.reason| String| The reason for this handler being used("onlyOne", "userSelected", or "remembered"|
| entity.handler.resource| String| The resource path of the handler function.|
| entity.request| * | The data passed to the IWC in the invoke request.|
| entity.response | * | The data returned from the handler when finished computing (only available if state is "complete").|
| entity.state | String | The state of the intent handling explained in table below.|
| entity.status | String | Will be "ok" if this callback is reachable (internal use).|

***

###What if there are no handlers?
If there are no handlers open for the desired intent invocation, the invoke promise will reject with a response of
"noResource". At current state of the platform, launching a registered application to handle an intent invocation has
not been implemented.

It is planned to replace the promise rejection with giving the user a choice of registered applications to launch to
handle the desired invocation.

###What if there is more than one handler?
If more than one handler is available, the user is prompted with an "intent chooser" that allows a decision to be made
by the user for which handler (application) should accept the invocation.

User preferences on intent handlers is currently in development. The user will be able to save handler choices so that
they do not use an "intent chooser" unless the IWC can't find a preference.

###What if I want to have all handlers accept my invocation?
Using the `broadcast` action, all handlers will accept the intent invocation and process it:
To invoke an intent, the `invoke` action is used:
```
var jsonRef = iwc.intents.Reference("/application/view/json");
var payload = {
    "Hello": "World!"
};

jsonRef.broadcast(payload);
```
