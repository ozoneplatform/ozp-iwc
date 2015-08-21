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
