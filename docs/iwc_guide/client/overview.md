# IWC Client
The IWC client library is the connection point for an application to a IWC bus. For documentation purposes, the 
following information pertaining to the IWC Client is explained using a connection to the sample bus that can be hosted
locally by following the [Quick Start](../quickStart.md) guide. 


* [Connecting/Disconnecting to a Bus](connecting.md)

* [What is an API Node?](resources.md)


### IWC APIS
The IWC has the following 4 APIs:

 * [Data API](apis/data/overview.md):
A simple key/value JSON store for sharing common nodes among applications. Creating, updating, and deleting Data
API nodes persists to the Data APIs endpoint by default. This api allows for resources to be persisted for reference in 
future sessions.


 * [Intents API](intents/overview.md):
Handling for application intents. Follows the idea of android intents. Allows applications to register to handle
certain intents (ex. graphing data, displaying HTML). Like android, the IWC Intents api presents the user with a
dialog to choose what application should handle their request.


 * [Names API](names/overview.md):
Status of the bus. This api exposes information regarding applications connected to the bus. This is a read-only API.


 * [System API](system/overview.md):
Application registrations of the bus. This api gives connections to the bus awareness of what applications the bus
has knowledge of. Different then the names api, these application's are not the current running applications, rather
these are registrations of where applications are hosted and default configurations for launching them. This gives
IWC clients the capability to launch other applications. This is a read-only API.