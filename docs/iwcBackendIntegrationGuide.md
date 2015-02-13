#Overview
The purpose of this guide is to demonstrate how to host the IWC and an Ozone database to be used by IWC applications. An deployable node.js example can be found [here](https://github.com/ozone-development/ozp-iwc-integrationDemo).

This guide covers:
 * gathering the IWC components to host
 * configuring the IWC for individual purpose
 * setting connections for the IWC to the Ozone database.

**This is not a guide for adding an IWC instance to an application**. For information on adding an IWC instance to an application please see [[IWC App Integration]].


##Gathering the IWC components to Host
All parts of the IWC bus can be gathered via bower by running `bower install ozone-development/ozp-iwc` or adding the following to your bower.json dependencies
```
 "ozp-iwc": "ozone-development/ozp-iwc"
```
The required components will be in `bower_components/ozp-iwc/dist`

If gathering the IWC via bower is not possible, The [dist](https://github.com/ozone-development/ozp-iwc/tree/master/dist) directory from the master branch of this repository is what you will need to copy over to your hosting instance.

##The IWC Components
The `dist` directory for the IWC is as follows
```
├── debugger
├── debugger.html
├── doc
├── iframe_peer.html
├── intentsChooser.html
└── js
    ├── defaultWiring.js
    ├── ozpIwc-bus.js 
    ├── ozpIwc-client.js
    ├── ozpIwc-metrics.js
```
Note: _(removed *.min.js & *.js.map variants from this tree for readability)_

**The minimum files required to host the IWC bus are as follows:**

1. iframe_peer.html
2. ozpIwc-bus.js (or ozpIwc-bus.min.js)
3. defaultWiring.js
4. ozpIwc-client.js (or ozpIwc-bus.min.js)

Below is a breakdown of what purpose these files serve and if they are configurable (IWC structure configuration not styling). Further information on individual aspects are through given links.

File/Dir | Configurable? | Purpose
---------|------|  ---------
debugger.html | no |Built-in debugger of the IWC
debugger | no | Resources used for the built in debugger available on the IWC
doc | no | Directory of YUIDocs built from the IWC source code.
iframe_peer.html | yes | An invisible document used by the IWC client to reference the IWC Bus.
intentsChooser.html | no | A pop-up document used by the IWC client to get user interaction for handling intents.
js/defaultWiring.js | yes | The wiring of IWC Bus components and the Ozone backend.
js/ozpIwc-bus.js | no | The IWC bus library.
js/ozpIwc-client.js | no | The IWC client library.
js/ozpIwc-metrics.js | no | The IWC metrics library.


###iframe_peer.html
Below is an example of a configured iframe_peer.html.
```
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Peer</title>
    <script type="text/javascript">
        // These should be customized by the deployment
        var ozpIwc = ozpIwc || {};
        ozpIwc.apiRootUrl = "https://www.owfgoss.org/ng/dev-alpha/mp/api";
        ozpIwc.marketplaceUsername= "testAdmin1";
        ozpIwc.marketplacePassword= "password";
        ozpIwc.runApis=true;
        ozpIwc.acceptPostMessageParticipants=true;
    </script>
    <script type="text/javascript" src="js/ozpIwc-bus.js"></script>
    <script type="text/javascript" src="js/defaultWiring.js"></script>

  </head>
  <body>
  </body>
</html>
```

**Overview**

An iframe_peer.html file is necessary for an IWC deployment. When a client application opens a connection to the IWC bus, it opens the domains `iframe_peer.html`. For an IWC client to connect to a deployed bus, **the iframe_peer.html file location decides the path the client connects to**. 

***

**File location**

If the iframe_peer.html file is located at `http://ozone-development.github.io/iwc/iframe_peer.html` a client application can connect to the IWC bus with a peerUrl of `http://ozone-development.github.io/iwc`. See the example connection below:
```
var client = new ozpIwc.client({peerUrl: "http://ozone-development.github.io/iwc");
```
For more information on IWC client aspects see [[IWC App Integration]]

The ozpIwc-bus.js & defaultWiring.js files can be hosted anywhere else on server so long as they:
  1. remain within the same origin.
  2. can be loaded by the iframe_peer.html


***


**Configuration**
The following IWC bus properties can be configured in the iframe_peer.html. Note that by file hierarchy iframe_peer.html is the first loaded entity of the IWC bus, thus declaring the `ozpIwc` namespace is necessary for configurations. 

Property | Type | Default Value | Definition
---------|------|----------------|-----------
 ozpIwc.apiRootUrl | String| "/api" | The location of Api backend root [hal data](LINKME) index.json (relative or absolute)
ozpIwc.marketplaceUsername | String | "" | Basic authentication username for the backend (For development purposes only)
ozpIwc.marketplacePassword | String | "" | Basic authentication password for the backend (For development purposes only)
ozpIwc.runApis | Boolean | true | If false, api's defined in the defaultWiring.js will not be loaded
ozpIwc.acceptPostMessageParticipants | Boolean | true | If false, the IWC bus will be confined to one browsing context.

###debugger.html
A built in debugger for the IWC. This application is packaged at the same directory as the iframe_peer.html. **The debugger to function must be in the same directory as `iframe_peer.html`**
##Versioning
The IWC follows Semantic Versioning. To check the version of a deployed IWC bus, reference the `bower.json` or `package.json` file of the bower_components/ozp-iwc (version reference currently not available in the dist directory)
