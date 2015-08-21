##Server Communication
The Bus component of the IWC communicates with its remote server at the creation of the bus to request persistent 
resources. 

When a client performs an action against an API they are performing it in the local network that is the IWC bus. 
Individual APIs that are inside the bus component may choose to communicate with the remote server additionally.

###Bus initialization
When the bus is created (first client connects), individual APIs in the bus component will reach out to the remote 
server for initial data.

When the initial data requests are resolved, the bus is initialized and the client is connected.

![alt](../assets/busInit.png)

![alt](../assets/busInitReturn.png)


###Bus lifespan
As long as the user has at least one client connected to a given bus, the resources for the buses APIs are retained.
The Data API is the only api that persists resource changes to the remote server. Whenever a resource changes a post
request is made to the server with the changed data.

![alt](../assets/busComms.png)

###Server Unavailability
Documentation pertaining to remote server unavailability mitigation to be completed.