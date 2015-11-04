##ozp:user
##System API System Node Endpoints
The System API requests a system nodelisted from the [ozp:system](overview.md) endpoint. The IWC does not care
how the data is handled on the backend rather that it meets/handles its required content-types.


The root of `ozp:system` **is the resource to be gathered**. Any subsequent resource gathered via either
`_links.item` or `_embedded.item` will override the system node.

The system node is a reference point for information pertaining to the backend hosting the IWC. This is
set to the static System API resource `/user`

###Supported Content Types
The following content-types can be handled if linked under the `ozp:system` endpoint.

| Content-Type| Description|
|-------------|------------|
|application/json| The IWC's current corresponding ozone backend [ozp-rest](https://github.com/ozone-development/ozp-rest) matches this content-type.|
|application/vnd.ozp-iwc-system+json;version=2| Used in the new ozone backend [ozp-backend](https://github.com/ozone-development/ozp-backend).|

***
###User Node Resources
####application/json

**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|
| name| String | A human readable name of the backend.            |
| version | String | the version of the backend.       |

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |

**Example**
```
{
  "version": "1.0",
  "name": "IWC Demo Site",
  "_links": {
    "self": {
      "href": "https://localhost:1313/marketplace/api/system/"
    }
  }
}
```
####application/vnd.ozp-iwc-system+json;version=2

**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|
| name| String | A human readable name of the backend.            |
| version | String | the version of the backend.       |

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |

**Example**
```
{
  "_embedded": {},
  "_links": {
    "self": {
      "href": "http://localhost:1212/iwc-api/system/",
      "type": "application/vnd.ozp-iwc-system+json;version=2"
    }
  },
  "version": "1.0",
  "name": "TBD"
}
```

