# IWC API Resources, Nodes, References, Actions: What do they mean?

### Resource/Node
An IWC api **resource** (commonly referred to as a **"node"**), is some api accessed value.
The IWC stores these shared values and metadata pertaining to them internal to
the browser.

Throughout this book, "resource" may also be used in the context
of an IWC client. In this instance resource is a string containing the path
information to the data inside of the IWC. For example a client may gather
data api resource `"/foo"` (string of path), in which the IWC internals
takes `"/foo"` as the **key** to access the data/metadata.


### Reference
An IWC api **reference** is a generated object of functions that provides
the application functional access, **actions**, to said resource.
To generate a reference, use the `Reference` constructor of the desired API
on the IWC client:

```
var fooRef = new client.data.Reference("/foo");
```

The object `fooRef` now contains a set of functions to access/modify the data api
resource `/foo`. The important point to understand is `fooRef` is not the value
of `/foo`, it is used to modify `/foo` with its functions. This is because
the IWC centralizes all of its resources in the browser so each client
connected to the bus can utilize them.


### Action
An **action** is a request for the IWC to perform some functionality for a given
resource.

- A `get` action requests the IWC to retrieve the value of an api's resource.
- A `set` action requests the IWC to store the value of an api's resource.

There is a common set of actions that all IWC api's must adhere to understanding.
An api may deny an action request if it see's fit. For example a read-only
resource in the Names Api may deny a reference's use of a `set` action.


While the various IWC APIs are covered in the following section, lets consider
a resource of the Data API.

---

### Resource Path Convention
This naming structure is used because when the IWC Bus is created, if connected
to a backend, it pulls in persistent nodes for each API. To retain a URI based
structure, the name assigned to the node is **its relative path to its API endpoint**.
In other words, if the IWC bus is configured to gather its Data API nodes for
a user from http://localhost:13000/api/data, the "/foo" resource is gathered
from http://localhost:13000/api/data/foo.

This resource naming scheme is important for the Data API because it can persist
nodes, thus needs to know its path to save the node to.

**All IWC APIs follow this scheme for future capability enhancements and standardization.**
