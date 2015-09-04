##IWC Bus Hosting Requirements
Hosting an IWC bus requires a backend to statically server the distributables of the IWC library so that the IWC client
library can gather an instance of the bus to run when connecting. These documents will cover two different scenarios,
hosting an IWC bus that does not gather backend-stored API Nodes as well as hosting an IWC bus that does gather 
backend-stored API Nodes.


###Hosting Without Backend API Connections
Hosting without backend API connections means when an  IWC Client connects, no API Nodes are gathered from the backend.
If an IWC bus does not require user authentication and does not intend to persist/provide API Nodes, hosting a "backend-less" 
bus should suffice. In this scenario, as a IWC Bus provider, the provider must statically serve the required IWC bus
JavaScript/HTML, as well as notify its users of the URL to connect their clients to.

####Required files
To host the IWC, grab the latest release of the IWC via either:

* [github](https://github.com/ozone-development/ozp-iwc/releases) 
* bower: `bower install ozone-development/ozp-iwc`
 
 
From the gathered ozp-iwc directory, the `dist` directory contains everything needed to be statically served. Make the
contents of the `dist` directory available on your web server and take note of the path to access said directory. If
your `dist` contents sit in `http://localhost:13000/iwc`, where the `ozpIwc.conf.js` file is located at 
`http://localhost:13000/iwc/ozpIwc.conf.js`, Application developers will point their IWC Client's to connect to
`http://localhost:1300/iwc`.

When sharing knowledge of your hosted IWC bus explain to application developers: 

_"Have your IWC Client connect to the IWC Bus located at <your bus URL>."_ 
```
var client = new ozpIwc.Client({peerUrl: <your bus URL string>});
```


####Configuring for no Backend API Connections
The `ozpIwc.conf.js` file is an [IWC Deployment Configuration File](busConfiguration.md). To ensure the bus does not try and gather
API Nodes from your backend, ensure the `backendSupport` property of `ozpIwc.config` is either **undefined or false**.
In other words, `backendSupport` defaults to false, as long as the `ozpIwc.conf.js` does not set it to true backend 
API Node gathering will not occur.

**The default ozpIwc.conf.js that comes with the IWC distributables is configured for backend communication.**

A sample `ozpIwc.conf.js` file for no backend support is as follows:
```
var ozpIwc = ozpIwc || {};

ozpIwc.config = {};
```
_modified ozpIwc.conf.js_


###Hosting With Backend API Connections
Hosting with backend API connections requires all the steps taken for hosting without backend API connections above,
as well as:  
* configuring the `ozpIwc.conf.js` to enable backend connections.
* configuring the `ozpIwc.conf.js` to set a root API url.
* meeting api requirements on backend.

####Configuring for Backend API Connections
The `ozpIwc.conf.js` file provided in the IWC distributables is preconfigured for backend support. It sets 
`backendSupport` to true, and points the root URL for API communication to (relative path) `/api`.
```
var ozpIwc = ozpIwc || {};

ozpIwc.config = {
    apiRootUrl: "/api",
    backendSupport: true
};
```
_ozpIwc.conf.js release version_

**ozpIwc.config.apiRootUrl**: This property is the relative path to the root of the API's on the backend. This
endpoint will provide the IWC bus with links to the root path of each individual API endpoint. The 
[endpoint documentation](endpoints/overview.md) goes into more depth of configuring a backend endpoints to properly serve IWC
API Nodes.


