##Bus Configuration
while the IWC ships with an example backend, it also ships with configuration options to modify the bus to meet
deployment needs. Common configurations include:

  - Custom endpoint url's for apis.
  - Disabling client to server communication.
  - Disabling legacy OWF7 widget support.
  - Modifying log levels.

To retain configuration settings across all instances of an IWC bus, a `ozpIwc.conf.js` file is included in the
distribution of the IWC. This file is to be loaded prior to the `ozpIwc-bus.js` as it specifies configuration parameters
to be used instead of the defaults set in `ozpIwc-bus.js`. Loading of the configuration script is handled in the 
`iframe_peer.html` so platform hosts do not need to provide loading logic, rather they must ensure the content of
`ozpIwc.conf.js` matches their deployment needs.

Modifications should be saved to the `ozpIwc.conf.js` file located in the same directory as the `ozpIwc-bus.js`. This 
is because the IWC bus's html page expects it to be there:

```
<!DOCTYPE html>
<head>
    <title>Iframe Peer</title>
    <script type="text/javascript" src="js/ozpIwc.conf.js"></script>
    <script type="text/javascript" src="js/ozpIwc-bus.js"></script>

  </head>
  <body>
  </body>
</html>
```
*iframe_peer.html*

To modify a bus configuration, overwrite its `ozpIwc.config` parameter:
```
var ozpIwc = ozpIwc || {};

ozpIwc.config = {
    apiRootUrl: "/api",
    backendSupport: true
};
```
*dist/js/ozpIwc.conf.js*

###Configuration Parameters

**ozpIwc.config.backendSupport**: A boolean flag used to determine if the IWC bus will communicate with a backend.
  - Type: Boolean
  - Default: false

**ozpIwc.config.legacySupport**: A boolean flag used to determine if the IWC bus will support legacy OWF 7 applications
 disabling support allows for use of newer browser technologies that are bottlenecked by legacy application requirements.
  - Type: Boolean
  - Default: true

**ozpIwc.config.apiRootUrl**: The root location for API endpoints to be relative to.
  - Type: String
  - Default: "/"

**ozpIwc.config.policyRootUrl**: The root location for security policy loading. This is relative to the
ozpIwc.config.apiRootUrl.
  - Type: String
  - Default: "/policy"


**ozpIwc.config.version**: The version of the IWC bus being ran. This can be set by developers to retain version
information on their internal development.
  - Type: String
  - Default: <Set to IWC's semver value at distribution>

**ozpIwc.config.logLevel**: The level of severity of which the IWC should print messages to the console.
0 = NONE, 1 = DEFAULT, 3 = ERROR, 6 = INFO, 7 = DEBUG, 10 = ALL.
  - Type: Number
  - Default: 6
  
**ozpIwc.config.owf7PrefsUrl**: The root location for owf7 preference loading if supporting legacy owf7 widgets through
the ozp-iwc-owf7-adapter. 
  - Type: String
  - Default: "/owf/prefs"





