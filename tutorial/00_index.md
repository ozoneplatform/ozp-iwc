---
layout: tutorial
title: Quick Start
permalink: "tutorial/index.html"
---

# Quick Start
In this tutorial, we will create a javascript application that will do the following:

  1. Gather required library.
  2. Connects to the IWC bus hosted on github.
  3. Store and retrieve data using the Data API. 
  4. Implement the publish/subscribe pattern to create a clock.

***

## Gathering the IWC
To use the IWC in a javascript application, the IWC client library is needed.
The library can be gathered in the following ways.

### Bower

``` bash
   bower install ozone-development/ozp-iwc
```
When gathering the IWC through bower, the client library will be located at  `bower_components/ozp-iwc/dist/js/ozpIwc-client.min.js`.

Include it in your applications HTML as so:

``` html
<script type="text/javascript" src="/bower_components/ozp_iwc/dist/js/ozpIwc.client.min.js"></script>
```

### Github
Distributions of the IWC can be downloaded as a zip/tar.gz from the [github releases page](https://github.com/ozone-development/ozp-iwc/releases).
In the unarchived directory, the library is located  at `/dist/js/ozpIwc-client.min.js`.

### Remotely 
The latest release of the IWC library is available here on github at `http://ozone-development.github.io/ozp-iwc/js/ozpIwc-client.js`.

***
   
## Creating an IWC Connection
The IWC library uses the `ozpIwc` namespace. To create a connection, a  **Client** must be made. When creating a client,
the IWC **Bus** (common domain) must be specified in the `peerUrl` property.

``` js
 var client = new ozpIwc.Client({ peerUrl: "http://ozone-development.github.io/ozp-iwc"});
```

An IWC bus is a location where all of the IWC distributables can be gathered, 
`http://ozone-development.github.io/ozp-iwc`, for example. The bus does not run any functionality on a server, rather 
provides the files necessary for in-browser communication over the given domain. This means, for all applications open
with a given browser on a user's computer (different tabs, different windows, embedded in pages, ect.). If all of the 
applications connect to the same IWC bus, then they can all communicate locally.

Eventually the IWC bus will be accessible publicly on a high performance domain (through a CDN), for now the common
domain is hosted here on github.

For companies/organizations desiring their own domain (customized application communication, account based access, 
persistent data, ect), the IWC bus can easily be hosted. See our gitbook for [hosting documentation]({{site.baseurl}}/gitbook/bus/overview.html), tutorials will 
be produced on this matter at a later date as well.

### Testing connection
To verify the client has connected, the `connect` promise can be used to run some functionality once connected.

<p data-height="170" data-theme-id="0" data-slug-hash="yYrJOj" data-default-tab="js" data-user="Kevin-K" class='codepen'></p>


It is not required to call `client.connect()` as the client by default automatically connects, rather if automatic
connection was disabled then calling connect would be necessary.

Waiting for the client to connect to call IWC functions is also not necessary, as the client will queue up messages
while it connects.

***

## Sharing/storing data

The most commonly used part of the IWC is the **Data Api**. It handles all key/value storage, publish/subscribe 
functionality, as well as resource grouping.

``` js
client.data().set("/foo",{entity: "Hello world!"});
```

To **put** a value in the Data Api for other (local) applications to access, the `set` action is used. It expects a
string name of the resource (we like rest-like naming), as well as a config object. To set data, the payload must be set
to the `entity` property. There are other properties that can be set on a node, but that will be covered in a later 
tutorial.

``` js
client.data().get("/foo").then(function(result){
    document.getElementById("output").innerHTML = result.entity;
});
```

To **get** a value from the Data Api, the `get` action is used. It expects a string name of the resource (like in `set`),
and will return a **promise** that will resolve with the value matching that format of the config object parameter of 
`set`. Thus, the payload is available in the `entity` property of the result.


**All IWC actions return promises.** Each promise resolves when the request is handled.

<p data-height="190" data-theme-id="0" data-slug-hash="wKZoPK" data-default-tab="js" data-user="Kevin-K" class='codepen'>


## Publish Subscribe pattern
While the IWC doesn't have defined `publish` and `subscribe` methods, it's `set` action is a direct mapping to publish,
and it's **`watch`** action is an enhanced subscribe.

The watch action will trigger a callback function on change of state of a value. This means the watcher gets notification
of the past state (oldValue) and new state (newValue).

<p data-height="255" data-theme-id="0" data-slug-hash="vNMyoE" data-default-tab="js" data-user="Kevin-K" class='codepen'>

***

## Cross-Domain example
Up to this point our tutorial has all ran within the same application within the same domain, 
[codepen](http://codepen.io/). This isn't leveraging the IWC use case so lets throw another domain in the mix.

Building from the publish/subscribe example above, lets create a similar application on 
[jsfiddle](https://jsfiddle.net/). There's no point in re-inventing the time generation logic since we are running the 
generation in the above example. In this case we only need to use the `watch` action.

**Make sure after checking the results to click "Edit in JSFiddle" and see it running in a separate tab!**
<iframe
  style="width: 100%; height: 175px"
  src="http://jsfiddle.net/kjkelly/rg4z5kms/embedded/js,result/">
</iframe>
