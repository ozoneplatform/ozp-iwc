##Overview
The IWC is composed of two components, a **client** and a **bus**.

####Client
The communication module used in application code to interface with other applications.

####Bus
The connection module that client's communicate through. The bus is made up of deployment-configurable modules.
The bus is configured and deployed to a common URL to all clients. This however does not mean the bus is remote.
The bus runs locally to the end-user and is gathered via a common location to allow clients to communicate through a
common origin.