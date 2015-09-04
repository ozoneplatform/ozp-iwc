##Data API Node Endpoints
The Data API requests Data API Nodes listed from the [ozp:user-data](overview.md) endpoint. The IWC does not care
how the data is handled on the backend rather that it meets its requirements for a GET and PUT request.

### These Content-Types are being updated
vnd.ozp-iwc-data-object-v1+json is handled by the IWC Bus, a more coherent vnd.ozp-iwc-data-object-v2+json is currently
in development. Both will be valid to the IWC.

***
### GET Response

* **Content-Type**: [application/vnd.ozp-iwc-data-object-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/schema/vnd.ozp-iwc-data-object-v1%2Bjson.json)

### Response Body
* **entity** A Object (or stringified Object) of the Data API Node
* **contentType** The Content-Type of the node.
* **key** The key used to store this node in the backend

```
{
  "entity": {
      "resource": "/locationLister/listings/13ab7e80",
      "entity": {
        "title": "test",
        "coords": {
          "lat": 1,
          "long": 2
        },
        "description": "aaa"
      },
      "permissions": {
        
      },
      "version": 2,
      "lifespan": {
        "type": "Persistent"
      },
      "deleted": false,
      "pattern": "/locationLister/listings/13ab7e80/",
      "collection": [
        
      ],
      "self": "https://localhost:13000/api/profile/7/data/locationLister/listings/13ab7e80"
  },
  "contentType": "application/vnd.ozp-iwc-data-object+json",
  "key": "locationLister/listings/13ab7e80"
}
```

***
### PUT Request
API Nodes are persisted back to the server with a PUT request on their `self` URL. This is a PUT request on Data API
resource `/locationLister/listings/8c7d7002`.

#### Headers
* **Content-Type**: application/vnd.ozp-iwc-data-object+json

#### Request Payload
```
{
  "key": "/locationLister/listings/8c7d7022",
  "entity": {
    "title": "test",
    "coords": {
      "lat": 1,
      "long": 2
    },
    "description": "a"
  },
  "collection": [],
  "pattern": "/locationLister/listings/8c7d7022/",
  "permissions": {
    
  },
  "version": 2,
  "_links": {
    "self": {
      "href": "https://localhost:13000/api/profile/7/data/locationLister/listings/8c7d7022"
    }
  }
}
```