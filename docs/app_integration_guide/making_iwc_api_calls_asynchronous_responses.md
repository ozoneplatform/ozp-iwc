###Making IWC Api Calls With expected Asynchronous Responses
Some api calls expect data returned, for example a `get` action. For these cases, the action call returns a promise. This allows operating on asynchronous IWC responses to be as easy as

```
client.api("data.api").get("/buz").then(function(response){
    console.log(response);
});
```
Response:
```
{
    foo: "bar" 
}
```

Although, if making the `set` and `get` calls one after another, it is not guaranteed that the `set` finishes before the `get`. With the help of promises the order of operations can be enforced:
```
client.api("data.api").set("/buz",{
    entity: {
        foo: "bar"
    }
}).then(function(reply){
    return client.api("data.api").get("/buz");
}).then(function(response){
        console.log(response.entity);
});
```

Response:
```
{
    foo: "bar" 
}
```
