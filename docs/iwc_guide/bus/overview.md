# IWC Bus
The IWC Bus is the in-browser network that connects a user's IWC clients together. It is responsible for holding state
of [API Nodes](../client/resources.md), relaying node states to clients, marshalling intent invocations, and launching
applications. All of this is done with out the requirement of offloading decisions to a backend server, but with the
benefit of loading and persisting nodes as needed.

Each application when connecting an IWC client opens an iFrame containing the IWC Bus. Through the use of distributed
consensus algorithms, one instance of the IWC Bus runs at a time, while all others simply relay messages onto and from
their Clients.

As a platform host there are requirements that must be met in order for IWC-running applications to utilize your domains
bus. 
