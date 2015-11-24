---
layout: tutorial
title: Watch for Changes 
---
# Leveraging the Watch Action
As explained in the [Basic Data Sharing](01_dataApi.html) tutorial, the `watch` action will notify IWC client's when
the value of a resource changes. This allows developers to implement cross-domain responsiveness.

The watch action is not limited to only the Data Api, but for most development watch actions pertain to this Api.

***

## Watch:

Watch actions vary slightly from the actions explained in the [Basic Data Sharing](01_dataApi.html) tutorial, as we
now have to introduce a callback function into the signature:

####Parameters
| parameter          | type     | description                                                                                                                                          |
|--------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| resource           | String   | The name of the value to watch.                                                                                                                      |
| (optional) options | Object   | Options to apply to the watch. Used for advanced functionality.  This parameter can be skipped, the IWC will accept 2 parameters (resource,callback) |
| callback           | Function | The callback function to be called when the given resource changes.                                                                                  |

As noted, the `options` parameter is optional, providing only the resource and callback is acceptable and is common.

###Returns
A promise that resolves on the acknowledgement of the request. The watch promise matches the promise response structure of the `get`
action as explained in the [Basic Data Sharing](01_dataApi.html) tutorial. This promise function is **not called
on resource value change**. The callback parameter is called on resource change. The purpose for the `get` action 
response is to allow a watcher to obtain immediate state of a resource when watching without an additional request.

***

### On value change callback

``` js
var onChange = function (response, done) {
   //new value = response.entity.newValue
};
client.data().watch("/tutorial/count",onChange);

```

Whenever the value of a resource is changed, any registered `watch` requests for the given resource receive notification
to their `callback` function that was provided in the request parameters. 

#### Response
For this tutorial we will focus on the `entity` property of the callback. It provides the change in value to the resource
as well as notification if the resource has been deleted. The remaining `entity` properties, oldCollection and 
newCollection, pertain to resource filtering and will be covered in a later tutorial.

| Response entity properties | type     | description                                                                  |
|----------------------------|----------|------------------------------------------------------------------------------|
| newValue| * | The new value of the resource that caused this callback to be called.|
| oldValue| * | The last value of the resource. |
| deleted| Boolean | A boolean flag indicating if the resource was deleted.|
| newCollection| Array | Current array of resources in this resources collection.|
| newCollection| Array | Previous array of resources in this resources collection.|

#### "done"
The done argument is a function passed into the callback for user's to call when they wish to not watch the resource 
any further.

The purpose of this `done` call is to to stop watching given some resource value condition. For example, stopping
watch on `/tutorial/count` resource in the example below when the resource reaches a value of 10 would look like so:

``` js
var onChange = function (response, done) {
  if(response.entity.newValue === 10){
    done();
  }
};

client.data().watch("/tutorial/count",onChange);
```

***

### Example
Below is a simple watch example where the callback's response and the promise resolution's response are written to the screen.

Take note that the `count` value written out above the increment/decrement buttons is done in response to the
data acquired from the callback/promise resolution response and is never written locally except for declaring the 
count to 0 if it is undefined.
<p data-height="450" data-theme-id="0" data-slug-hash="zvQWqL" data-default-tab="result" data-user="Kevin-K" class='codepen'>

***

### Advanced Watch information
While more tutorials will be added, if more advanced watch techniques are desired (resource filtering) check out
the [watch action documentation in our gitbook]({{site.baseurl}}/gitbook/client/apis/common/watch.html)