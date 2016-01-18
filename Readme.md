[ozp-iwc](http://ozone-development.github.io/ozp-iwc/) [![Build Status](https://travis-ci.org/ozone-development/ozp-iwc.svg?branch=master)](https://travis-ci.org/ozone-development/ozp-iwc)
==============================

###[Visit the IWC Website for Tutorials and Docs](http://ozone-development.github.io/ozp-iwc/)

The Ozone Platform's Inter-Widget Communications (IWC) enables loosely coupled integration of web applications by
applying the best practices of enterprise service buses and service-oriented architecture to a completely
in-browser system that works across multiple tabs and windows. Applications can share data and services then use
the data and services offered by others to enrich their own user experience.

![img](docs/iwc_guide/assets/example.gif)
*An example of two applications utilizing the IWC to communicate.*
The IWC provides lightweight browser-side application integration.
--------------
Today’s rich web applications tend to carry more state than a simple link can convey, and componentized development
allows UI elements to be embedded, but at the cost of maintenance and application size. The IWC allows application
frontends to expose data and services to other applications within the browser. Just like services on an ESB, these
elements can be developed, deployed, and extended without impact to other applications.

The IWC stays out of your way.
--------------
The IWC is designed to minimize the impact on your application. It is completely agnostic to the application
presentation, including a tiny client library that adds a single, invisible element to your page.

1.2.0 has been Released
--------------
* **New Developer API**: Reference objects introduced to greatly simplify resource interaction.
* **Breaking Changes from 1.1.x**: 
    * The use of `pattern` to trigger collections was removed and replaced with `collect:true`. All other syntax remains valid, to migrate simply add a `collect:true` to all IWC client action calls that specify a resources `pattern` property. The collection setup process has been greatly simplified, and developers are encouraged to migrate to the new References approach. Check the [tutorials](http://ozone-development.github.io/ozp-iwc/tutorial) for more info.
      ```
      // before
      client.data().set("/location/listings", {pattern: "/location/listings/"});
      
      // now
      client.data().set("/location/listings", {pattern: "/location/listings/", collect: true});
      ```
      

Demo
---------------
The [IWC website](http://ozone-development.github.io/ozp-iwc/) contains a set of demo applications as well as a publicly available IWC Bus.

For private development, the IWC is bundled with a persistent data backend & demo applications. Simply follow these steps to deploy an example
IWC environment:

```
npm install && bower install
grunt serve
```

A list of IWC registered applications can be found under the "My Apps" tab of the system.api page in the 
[IWC Debugger](http://localhost:13000/debugger/index.html#/system-api) once the server is running.

