##Data Api
A simple key/value JSON store for sharing common resources amongst applications. Has backend connections for persisting storage if applications choose to.

***

###Actions
**get**: Requests the Data API to return the resource stored with a specific key.

**set**: Requests the Data API to store the given resource with the given key.

**list**: Requests the Data API to return a list of children keys pertaining to a specific key.

**watch**: Requests the Data API to respond any time the resource of the given key changes.

**unwatch**: Requests the Data API to stop responding to a specified watch request.

**addChild**: Requests the Data API to store a given resource and link it as a child of another resource.

**removeChild**: Requests the Data API to remove a given resource and unlink it as a child of another resource.

**delete**: Requests the Data API to remove a given resource.

***

###Accessing the API
To call functions on the Data API, reference `client.data()` on the connected client.

```
var client = new ozpIwc.Client({
    peerUrl: "http://ozone-development.github.io/iwc"
});

client.connect().then(function(){
    var dataApi = client.data();
});
```
