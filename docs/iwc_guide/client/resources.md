# IWC API Resources
An IWC API resource (commonly referred to as a "node"), is some api accessed value. While the various IWC APIs are 
covered in the following section, lets consider a resource of the Data API.

### Data API Resource
Using the Data API, an application may set some value to the path "/foo":

```
client.data().set("/foo", { entity: {'bar': true} });
```

Internal to the IWC Bus, this value `{'bar': true}` is stored in a map with the key (name) "/foo". In other terms, the "/foo"
node was set to `{'bar': true}`.

This naming structure is used because when the IWC Bus is created, it pulls in persistent nodes for each API, and to
retain a URI based structure, the name assigned to the node is **its relative path to its API endpoint**. In other words,
if the IWC bus is configured to gather its Data API nodes for a user from http://localhost:13000/api/data, the "/foo"
resource is gathered from http://localhost:13000/api/data/foo. 

This resource naming scheme is important for the Data API because it can persist nodes, thus needs to know its path
to save the node to. 

**All other APIs follow this scheme for future capability enhancements and standardization.**