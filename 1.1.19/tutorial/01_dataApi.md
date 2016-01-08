---
layout: tutorial
title: Basic Data Sharing
category: data
---

# Sharing Data with the Data Api
The most common use of the IWC in applications is sharing data resources among applications. The IWC varies from
the various publish/subscribe libraries available in javascript because of the following 3 key components: 

  1. **Cross-Domain Support**: The IWC was developed in a way to gracefully handle cross-domain sharing. This means 
  applications hosted on different domains can interact.
  2. **State driven**: Unlike the typical publish/subscribe pattern, IWC retains state when using the `set` action. This 
 means when a subscribing application is opened, it can gather the last value set (published).
  3. **(Optional) State Persistence**: The IWC has tie-ins for persisting resources beyond the working session by 
  storing their value to a server. Further information on configuring a backend for state persistence to follow in
  a future tutorial.
  
***

## Accessing the Data Api
Covered in the [Quick Start](index.html) tutorial, an IWC client is needed to access the Data Api. 

``` js
 var client = new ozpIwc.Client({ peerUrl: "http://ozone-development.github.io/ozp-iwc"});
 var iwcData = client.data();
```

The `data` method used to create the `iwcData` object is a formatting method that returns reference to the Data Api 
specific functionality. Creating an `iwcData` object whenever accessing the Data Api is not necessary, directly calling
the methods off of `client.data()` is acceptable as well. The purpose of the `iwcData` object is for more concise code.

## Data Api Functionality (actions)
The Data Api can perform the following tasks for a given value. In IWC terminology, each task is considered an **action**,
as it is some behavior that can modify the state of an application.


| action | description                                                         |
|--------|---------------------------------------------------------------------|
| set    | Stores a value to a given resource path.                            |
| get    | Retrieves a value from a given resource path.                       |
| delete | Removes a value from a given resource path.                         |
| watch  | Calls a callback function any time the resource path value changes. |

Each action returns a promise that is resolved when the IWC acknowledges the request. The acknowledgement returns the
state of the resource if it is a read action (get,watch). A watch action will also have a callback that is called
separately upon state change of a resource.

Actions have a handful of options that can be passed with them, for the purpose of this tutorial we will only be 
covering the `entity` option, which is the value being passed/received from a resource. Further tutorials on the
various 

***

### Set: storing data

####Parameters

| parameter | type   | description                                                                                                                                                            |
|-----------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resource  | String | A string path-name used as a key for the value. We utilize `/`,in pathing for filtering resources (covered in a later tutorial).                                       |
| options   | Object | An object of options for the action. More options are covered in later tutorials, for now we will focus on the`config.entity` option, which is the value to be stored. |
 
 

####Returns
A promise that resolves with a response object upon handling of the request:
 
| property | type   | description                                                                                 |
|----------|--------|---------------------------------------------------------------------------------------------|
| ver      | Number | The version of the response. Not applicable to set requests, pertains to watch requests.    |
| src      | String | The address of of the response sender. "data.api" is the internal address for the Data Api. |
| msgId    | String | The ID of the message being received. The "P" denotes the message for internal purposes.    |
| time     | Number | Epoch time of the response **being created and sent**.                                      |
| response | String | The status of the message. "ok" means the request was successfully handled.                 |
| replyTo  | String | The ID of the request this response pertains to.                                            |
| dst      | String | The address of the recipient of this message.                                               |

 <p data-height="245" data-theme-id="0" data-slug-hash="jborgp" data-default-tab="js" data-user="Kevin-K" class='codepen'>
 

***

### Get: retrieving data

To retrieve a resource, regardless of the origin it was `set` in, only a resource name needs to be supplied

####Parameters

| parameter | type   | description                                                                                                                                                            |
|-----------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resource  | String | A string path-name used as a key for the value. We utilize `/`,in pathing for filtering resources (covered in a later tutorial).                                       |
 
 

####Returns
A promise that resolves with a response object upon handling of the request, all of the properties returned in 
the `set` response are returned in the `get` response, with addition of the `entity` property. 

Additional properties are returned that pertain to advanced functionality (server persistence, resource lifespan, filtering), 
and internal markings necessary in the message passing.
 
| property    | type   | description                                                                                 |
|-------------|--------|---------------------------------------------------------------------------------------------|
| entity      | *      | The value of the resource stored.                                                           |
| resource    | String | The name of the resource.                                                                   |
| collection  | Array  | A list of resource names mapped to this resource's pattern property (advanced filtering).   |
| lifespan    | Object | Information pertaining to the lifespan of a resource.                                       |
| contentType | String | The content-type of the resource (used in server persistence).                              |
| eTag        | Number | The version of **the resource** in the IWC, used to determine value changes internally.     |

 <p data-height="245" data-theme-id="0" data-slug-hash="vNwXJJ" data-default-tab="js" data-user="Kevin-K" class='codepen'>
 
***
  
### Delete: removing data

A delete action matches the parameter signature of a `get` action, but as no resource will exist after deletion, the
promise will resolve as the `set` promise resolves.
 <p data-height="245" data-theme-id="0" data-slug-hash="bVywKO" data-default-tab="js" data-user="Kevin-K" class='codepen'>