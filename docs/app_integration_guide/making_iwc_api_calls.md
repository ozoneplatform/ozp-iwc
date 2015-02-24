##Making IWC Api Calls
Each deployed version of the IWC bus is capable of having its own specified api's integrated with it. For the purpose of this guide, the IWC bus used by the journal application has a [[data.api]].

The data.api is a key/value storage component on the IWC bus. Here, common resources can be shared among applications via the `set` and `get` actions.

Syntactically, to make an api call to the **data.api** to **set** the value `{foo: "bar"}` to key `/buz` you would do the following.

```
client.on("connected",function(){
   // all client code goes within the connected callback
   ...

   client.api("data.api").set("/buz",{
       entity: {
           foo: "bar"
       }
   });
});
``` 
This client api call-style holds true through all api's on the bus such that the following syntax structure is formed:
```
client.api(${api's name}).${the action}(${the resource key}, ${the resource value});
```

Api's on the IWC bus inherit from a common [api base](https://github.com/ozone-development/ozp-iwc/wiki/APICommonConventions) and all share a common set of `actions` of which they can expand on.


***
