---
layout: tutorial
title: Resource Collections 
category: data
---

# Collections of Resources
In the last tutorial, [Resource Structure](03_structure.html), the concept of abstracting resource data  and its benefits
were conveyed. The IWC read Actions utilize the naming structure of IWC resources to open up multi-resource based 
actions.

## The "pattern" property
When specifying a read-based action, the tutorials up to this point have not included any **config** objects in 
demonstration. While there are numerous configuration properties that can be called, documented [here](TODO), this
tutorial will focus on the `pattern` property.

The `pattern` property is a string used to do **prefix matching** against resources in the API. This is not a regular
expression, future development may be done to add regular expression matching if requested. 

***

### Example
A running IWC bus has the following resources in it's Data API:

```
/shoppingCart
/shoppingCart/amazon
/shoppingCart/bestBuy
/shoppingCart/amazon/031719199112
/shoppingCart/bestBuy/043396281288
```

The following are examples of patterns using prefix matching to determine if a resource is a match.

***

#### /shoppingCart
```
/shoppingCart
/shoppingCart/amazon
/shoppingCart/bestBuy
/shoppingCart/amazon/031719199112
/shoppingCart/bestBuy/043396281288
```

#### /shoppingCart/
```
/shoppingCart/amazon
/shoppingCart/bestBuy
/shoppingCart/amazon/031719199112
/shoppingCart/bestBuy/043396281288
```

#### /shoppingCart/amazon
```
/shoppingCart/amazon
/shoppingCart/amazon/031719199112
```

#### /shoppingCart/amazon/
```
/shoppingCart/amazon/031719199112
```

***

A pattern with a trailing `/` states, "find all resources pathed **under** the given resource", while without a trailing
`/` states, "find all resources **under and including** the given resource".
 
***
 
# Actions utilizing Patterns

## List
The `list` action, not previously introduced, is an action unique in format. It takes one parameter, **pattern**, and
returns an array of resources that match the pattern.

This varies from the traditional IWC action where the first parameter is a **resource**, now it is a pattern.

``` js
client.data().list("/").then(function(response){
 //an array of all resources in Data Api
 var resources = response.entity;
});
```

<p data-height="450" data-theme-id="0" data-slug-hash="dYxgyO" data-default-tab="result" data-user="Kevin-K" class='codepen'>
***

## Watch
A `watch` action takes 3 parameters, a resource, a (optional) config, and callback. 

A watch can be configured to be triggered **when new resources match its pattern and when resources that did match were 
deleted**. In order to immediately notify new watcher's of the state of a watch, the resources matching the pattern are 
stored in the given resources **collection** property. This means when a new watch action is performed on a resource, 
its stored collection of resources can be obtained immediately in the promise resolution.

The `pattern` for the watch goes in the **config** object of the action, it specifies that any resource who prefix-matches
this string should be tracked in the collection. In order for the IWC to accept the `pattern` in the watch request 
(this is normally a `set` action's responsibility to alter the resource), the `collect: true` property must be added
to the configuration as well:

``` js
// First configure the resource's pattern
var config = {
  pattern: "/shoppingCart/",
  collect: true
};


// Then register the watch, react on the collection data.
var onChange = function(response, done) {
  var newCollection = response.entity.newCollection;
  var oldCollection = response.entity.oldCollection;
};

var onResolve = function(response, done) {
  //the collection of resources pertaining to the pattern
  var collection = response.collection;
};

client.data().watch("/myCollection", config, onChange).then(onResolve);
```

<p data-height="450" data-theme-id="0" data-slug-hash="yYmRbm" data-default-tab="result" data-user="Kevin-K" class='codepen'>


### Changing the watched pattern
To change the pattern of collection on a watch action, simply change the `pattern` property with a `set` action:

``` js

client.data().set("/myCollection", { pattern: "/trashCan/"});
```

This will update the collection to match the new pattern and notify all who are watching `/myCollection`.