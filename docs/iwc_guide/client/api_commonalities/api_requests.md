##API Requests
Making an api request uses the following structure:

`client.${Api}().${Action}( ${Path}, [Value], [Callback] );`

**Api**: {Function} The api the client is calling. ex) `data(...)`

**Action**: {Promise} The action the client is performing. ex) `set(...)`

**Path**: {String} The path of the stored node pertaining to the action. ex) `"/foo"`

**Value(Optional)**: {Object} The object sent for the Api to operate on. ex: `{ bar: "buz"}`

**Callback(Optional)**: {Function} A callback function used for recurring actions. This applies to actions like **watch**
and **register**.

Since some actions do not require values passed (read actions) and some actions do not
require callbacks, **the Value and Callback parameters are optional**.

Since there are instances where callbacks may be used but no value needed, action calls can be also made using the
following additional structures:

```
client.${Api}().${Action}( ${Path} );
client.${Api}().${Action}( ${Path}, [Value] );
client.${Api}().${Action}( ${Path}, [Callback] );
```

The one restriction is the following Api call structure is not allowed:

```
client.${Api}().${Action}( ${Path}, [Callback], [Value] );
```

***

