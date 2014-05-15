ozp-iwc
==============================

ozp-iwc provides an in-browser communications network between participants in multiple browser tabs, 
iframes, or workers using HTML5 standard features.  These participants, which can be from different origins,
can use the client API to send messages to any other participant on the network.

Inter-tab communication
-----------------------
Postmessage allows for multiple tabs to communicate easily and securely.  The hard part is getting a window
handle to use it, especially if they aren't from the same domain.  A browsing context can know of its parents 
and children, but cannot enumerate or discover unrelated browsing contexts.  Techniques like HTML5 localstorage and 
allow for multiple contexts of the same domain communicate, but not cross-domain.

ozp-iwc fills in that gap by providing


Peers & Participants
--------------------
Peers are browsing contexts provide the network backbone.  All peers are served from the same origin, and can
use a variety of techniques to talk to each other.  Participants are the end-user of the network and can be from 
any origin.  They need to know of the existence of one peer, which they can talk to via postMessage() as the 
entry point into the network.

Peer Network
------------
The network consists of one or more peers that automatically discover and broadcast to each other.


