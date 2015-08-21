## Technology Stack

The IWC is a client-side library built without any dependencies on other javascript frameworks. Polly-fill libraries are used to add coverage for EcmaScript 6 functionality across legacy browsers. The intention is to maintain a minimal library size to not impact load times. Currently the minified IWC client library is 45kB and its minified bus counterpart is 155kB.

### LocalStorage
LocalStorage is a key-value data store built into the browser that is separted by the domain of the webpage loaded in the browser. 

If one browser tab has http://www.example.com/page1.html open, that website has access to write to the key-value store assigned to the http://www.example.com domain. If a second browser tab was opened with http://www.example.com/page2.html, that website would have access to the same key-value store as http://www.example.com/page1.html because they are in the same domain. 

Since the two open websites are accessing the same local storage, they receive identical events when data is stored/deleted. This is the foundation of the IWC, with the ability to access the same data storage, widgets are able to communicate.

The use of LocalStorage comes with limitations, if two widgets want to communicate but are on different domains, http://www.example.com/page1.html and http://www.sample.com/page1.html for example, local storage alone wont allow these two widgets to communicate, but if each widget had reference to a connection on a common domain, http://www.iwchost.com for example, then the two widgets could communicate. To have this connection reference, HTML Iframes and PostMessage are utilized.

### Iframes and PostMessage
When a website is loads another website inside of an iframe, javascript on the main website can communicate with javascript on the iframe-loaded website using the browser's built in `window.PostMessage`. PostMessage safely enables cross-origin communication, in our case between http://www.example.com/page1.html and http://www.iwchost.com, because PostMessage communication is direct between two windows, where the transmitter must specify both the window to comunicate with (the iframe) and the origin of which the window must have loaded in order to accept the message (http://www.iwchost.com).

In the instance of an widget using IWC, the IWC client library ensures that when it sends messages to its common domain that:
   1. The page loaded in the iframe is indeed the common domain for IWC communication.
   2. Whenever receiving a message, the origin of the message matches the expected origin of the iframe.

### IWC Client
This communication through an iframe marks the separation of the two IWC libraries, `ozpIwc-client.js` and `ozpIwc-bus.js`. All code ran by the `ozpIwc-client.js` acts as a representative of the bus for a widget to communicate through. This library has no server communication. Widget developers will only use the IWC client library for their widget, so only an understanding of [connecting a client](connecting.md) and the [client API calls](../core_apis/overview.md)  are necessary to develop.

Widgets will show no visible trace its use of iframes and PostMessage to communicate with the IWC bus because the IWC client library generates the iframe to be hidden and have no size. 

To have a common point to load the IWC bus libraries, each IWC client instance, when connecting, will load the common domain website into the iframe. For simplicity, the IWC bus library is packaged up in a `iframe_peer.html` file, such that when connecting a client, it simply sets a `peerUrl` parameter to the path that holds the iframe_peer.html file. 

In other terms, if the IWC bus is available at http://www.iwchost.com/iframe_peer.html, any widget that creates an IWC client to connect as follows will have access to use that bus: 

```
var client = new OzpIwc.Client({peerUrl: "http://www.iwchost.com"});
```

### IWC Bus
Connection to the bus does not mean that 1 user's widget communicates with another user's widget, rather the bus runs local to the user's browser inside the `iframe_peer.html` file, allowing all other widgets open using that browser (in other tabs or windows) to communicate given they have a matching bus. 

The reason these widgets must load the `iframe_peer.html` from a common domain (http://www.iwchost.com) flows back to the use of **LocalStorage**. In order to communicate locally through the key-value store, a common domain must be used. Thus, loading a resource on the common domain opens up the ability to use this communication practice. 

Each IWC client loads an instance of the IWC bus. By using a distributed consensus algorithm, a single instance of the bus will act upon requests and the other instances will sit and wait incase they need to take over leadership.


**The IWC bus can communicate back to a server if desired.** While the IWC without any server communication is powerful all in its own it can be encorporated with a backend server for:
   1. The ability to persist data for saved state and future application use.
   2. Loading information to alow users to launch widgets ready for use on the bus.
   3. Attribute-based access control.

Further information on server communication of the IWC can be found in the [Server Communication](serverComms.md) section.


###XMLHttpRequest
XMLHttpRequest (AJAX) is used by the IWC bus library to gather bus information from its corresponding server if configured to do so.

