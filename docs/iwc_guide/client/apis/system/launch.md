##System API Action: launch(nodeKey,nodeValue)
* `nodeKey`: **String** - the name of the API Node. ([What is an API Node?](../../resources.md))
* `nodeValue`: **Object** - the settings to store the node.
* `[nodeValue.entity]`: **Object** - data to pass to the launched application. Obtainable in the launched application's
connected client in the `launchParams` property.


###Applies to only the System API

###Launch an Application Through the System API
Applications have the possibility to launch other applications in the IWC. Rather than just opening a link in a new tab,
the System API can be used to pass important information to the launching application much like how Android allows
passing serialized data to new activities.

To launch an application, simply call the `launch` action on the corresponding resource.

```
var systemApi = client.system();

systemApi.launch("/application/com.ozp.bouncingBalls");
```

To launch an application with data passed to it:
```
var data = {
    "Hello": "world!"
};
systemApi.launch("/application/com.ozp.bouncingBalls",{entity: data});
```

The launched application can gather the launch data using the `getLaunchData` method. It uses promises to resolve after
the client has connected:
```
var launchData = {};
client.getLaunchData().then(function(data){
    launchData= data;
});
```
###Passing launch parameters Without using the System API
Alternatively, launch data can be passed to the opening application in the following places so long as the `key` is
`ozpIwc.launchData`:

* window.name
* Url query parameter: `(?launchData=<stringified & URI-encoded object>)`
    * LaunchData persists through browser refresh (good for when sharing a URL of a application occurs).
* Url hash: `(#launchData=<stringified & URIencoded  object>)`
    * LaunchData does not persist through browser refresh (good for when launching an application to handle the launch data for a unique one-time need).

To stringify and URI-encode a value in javascript:
```
var obj = {'a': 1};
var stringified = JSON.stringify(obj);
var uriEncoded = encodeURIcomponent(stringified);
```
