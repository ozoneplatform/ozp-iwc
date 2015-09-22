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
    <script type="text/javascript" src="js/defaultInit.js"></script>

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

The ozpIwc-bus.js & defaultInit.js files can be hosted anywhere else on server so long as they:
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
ozpIwc.runApis | Boolean | true | If false, api's defined in the defaultInit.js will not be loaded
ozpIwc.acceptPostMessageParticipants | Boolean | true | If false, the IWC bus will be confined to one browsing context.