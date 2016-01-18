## Reference Configuration
References contain functionality catered specifically to the resource at hand.
In some cases more advanced detail is needed for the resources. A second parameter
is accepted by the constructor of `Reference` to assign configurations for the given reference.

Most, if not all, usage of the IWC in a basic scenario for an application will
not require configurations. The following settings are for advanced scenarios
that can not utilize the generalized IWC client code structure.

**Note:** It is not important to master these configurations, they are introduced early
into this book as a precursor for development growth. Acknowledging the syntax
and understanding in a general sense what the properties do is enough to follow
along any advanced examples in this book. The point of this section is to
prevent reinvention should a scenario arise needing these capabilities.

---

### config
The config argument in reference generation serves both to modify behavior
of a reference, and assign property values to the resource referenced.

```
var config = {
    respondOn: "none"
};

var fooRef = new client.data.Reference("/foo",config);
```

While the purpose of references is to reduce the footprint of code on the
developer, in advanced use it is acceptable to have multiple local references to
a resource if the different references have different configurations.

The following configuration properties can be applied to a reference, details
about each property follows below:

|Property   |Type   |Default Value|
|-----------|-------|-----------|
|lifespan| String | n/a|
|pattern|  String | n/a|
|collect|  Boolean| false|
|permissions| Object| {}|
|fullResponse| Boolean| False|
|fullCallback| Boolean| False|
|respondOn| String| "all"|

**Default Values noted as "n/a" leverage whatever the current value of that
property is already set on the resource as they will modify the resource for all**.

All properties labeled with a default value do not modify the resource in
reference, rather modify behavior locally upon sending/receiving data from the
resource.

### lifespan
The lifespan configuration variable has 3 possible inputs:
1. `"Ephemeral"` - The resource in reference should remain as long as the IWC bus is active.
2. `"Bound"` - The resource in reference should remain only while at least 1 client that marks it as "Bound" is open.
3. `"Persistent"` - The resource should persist all changes to the backend. It will be auto-loaded upon reopening of
the IWC bus.

Each API can have a different default lifespan for their resources.

- The data api defaults to persistent since data should by default be retained
for a user between sessions.
- The intents api defaults to bound because if the application registering a
function to share closes, the ability to reference that application should be
removed.

The lifespan parameter is type-insenstive, passing in `"bound"` vs. ``"Bound"``
is acceptable.


### pattern
The pattern configuration variable is a string that contains part or all of a
resource path. It is used in conjuncture with the `collect` property below.

### collect
The collect configuration variable tells the IWC that the given resource
should maintain a collection of resource's that begin with or match the resource's
pattern.

If provided in the reference configuration as `true`, upon watching the resource
from the reference data will gathered and maintained about the collection.

If provided as `false`, other references whom mark their collection variable as
`true` will not be effected. **This flag only pertains to the reference at hand.**

### fullResponse
The `fullResponse` config variable signifies if the given reference should
provide advanced promise resolution/rejection data. The default setting of false
signals the reference to return only the value of the resource in promise
resolutions, and only the error type in promise rejections.

Setting `fullResponse` to `true` will result in all action calls (get,set,ect.)
for the given reference to return the entire message packet received from the
IWC internals. This does not apply to callback data.

This is needed for advanced operations like gathering the collection of a
resource with a `get` action, because by default the get promise returns only
the value of the resource.

### fullCallback
The `fullCallback` configuration variable signifies if the given reference should
provide advanced callback data. This does not apply to promise resolution/rejection.

### respondOn
The `respondOn` configuration variable signifies to the reference if the given
reference should receive a response from the IWC. This applies only to promise
responses. The possible settings are:
1. `"all"` - all actions from this reference expect a receipt of their action.
2. `"none"` - all actions from this reference will not receive a receipt.

This value defaults to "all", setting to "none" is mainly beneficial for
high frequency actions. By setting `respondOn` to "none" and using `set`,
a reference can roughly double its outbound messages because it is not utilizing
cycles for processing inbound messages.
