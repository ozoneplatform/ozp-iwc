##ozp:user-data
##Data API Node Endpoints
The Data API requests Data API Nodes listed from the `ozp:user-data` endpoint. `ozp:user-data` is a relational link to
the href provided in the `_links` of the [api root](overview.md). The IWC does not care how the data is handled on the 
backend rather that it meets/handles its required content-types.

The root of `ozp:user-data` supplies links to data node resources(application/vnd.ozp-iwc-data-objects+json;version=2).It must provide a 
`_link.item` array of linked data node resources. Optionally these resources can be provided in the `_embedded.item` array
to reduce network communication.


###Supported Content Types
The following content-types can be handled if linked from the `ozp:user-data` or from an resource that is chain linked from 
`ozp:user-data`.

| Content-Type| Description|
|-------------|------------|
|application/vnd.ozp-iwc-data-objects-v1+json| The IWC's current corresponding ozone backend [ozp-rest](https://github.com/ozone-development/ozp-rest) uses this content-type. A HAL resource only containing link objects for other resources. This content-type will be deprecated in 2016 as it lacks providing content-type of its links.|
|application/vnd.ozp-iwc-data-objects+json;version=2| The IWC's new ozone backend [ozp-backend](https://github.com/ozone-development/ozp-backend) uses this content-type.|
|application/vnd.ozp-iwc-data-object-v1+json| The IWC's current corresponding ozone backend [ozp-rest](https://github.com/ozone-development/ozp-rest) matches this content-type. This content-type will be deprecated in 2016 as it lacks providing content-type of its links|
|application/vnd.ozp-iwc-data-object+json;version=2| The IWC's default content-type for data node resources. Used in the new ozone backend [ozp-backend](https://github.com/ozone-development/ozp-backend).|

***
###Data Node List Resources
####application/vnd.ozp-iwc-data-objects+json;version=2
**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |
|  item                   | Array   | An array of linked items. Of a supported `ozp:user-data` type|


**Embedded Resources**
Commonly, the `application/vnd.ozp-iwc-data-object+json;version=2` content-type resources are provided both in the 
`_embedded.item` arrays. This is to reduce network communication to gather resources.


**Example**
```
{
  "_embedded": {
    "item": [
      {
        "username": "wsmith",
        "key": "/test",
        "entity": "\"Hello World!\"",
        "content_type": "application/vnd.ozp-iwc-data-object+json;version=2",
        "version": "2",
        "pattern": null,
        "permissions": "{}",
        "_links": {
          "self": {
            "href": "http://localhost:1212/iwc-api/self/data/test",
            "type": "application/vnd.ozp-iwc-data-object+json;version=2"
          }
        },
        "_embedded": {}
      }
    ]
  },
  "_links": {
    "item": [
      {
        "href": "http://localhost:1212/iwc-api/self/data/test",
        "type": "application/vnd.ozp-iwc-data-object+json;version=2"
      }
    ],
    "self": {
      "href": "http://localhost:1212/iwc-api/self/data/",
      "type": "application/json;version=2"
    }
  }
}
```

####application/vnd.ozp-iwc-data-objects-v1+json
This content-type does not provide `type` properties to its link objects. The IWC can handle making decisions
for what content-type to treat a resource as, but this functionality will be deprecated and replaced with a strong
content-type based resource handling in 2016.

**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  item                   | Array   | An array of linked items. Of a supported `ozp:user-data` type|

**Embedded Resources**
Commonly, the `application/vnd.ozp-iwc-data-object-v1+json` content-type resources are provided both in the 
`_embedded.item` arrays. This is to reduce network communication to gather resources.

**Example**
```
{
  "_links": {
    "item": [
      {
        "href": "https://localhost:1313/marketplace/api/profile/7/data/dashboard-data"
      },
      {
        "href": "https://localhost:1313/marketplace/api/profile/7/data/test"
      }
    ],
    "self": {
      "href": "https://localhost:1313/marketplace/api/profile/7/data"
    }
  }
}
```
***

###Data Node Resources

####application/vnd.ozp-iwc-data-object-v1+json
TODO

####application/vnd.ozp-iwc-data-object+json;version=2

**Resource**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
| key        | String  | An identifier for the resource.           |
| version    | Number  | The version number of the resource. This increases in the IWC every time the resource changes.|
| pattern    | String  | A URI Pattern for this resource to match for watching other resources.|
| permissions| String  | A stringified object of ABAC policies pertaining to the resource.|
| entity     | String  | A stringified payload of the resource.    |


**Links**

| property                | type    | description                               |
|-------------------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |
|  item                   | Array   | An array of linked items. Of a supported `ozp:user-data` type|

**Example**
```
{
  "username": "wsmith",
  "key": "/test",
  "entity": "\"Hello World!\"",
  "content_type": "application/vnd.ozp-iwc-data-object+json;version=2",
  "version": "2",
  "pattern": null,
  "permissions": "{}",
  "_links": {
    "self": {
      "href": "http://localhost:1212/iwc-api/self/data/test/",
      "type": "application/vnd.ozp-iwc-data-object+json;version=2"
    }
  },
  "_embedded": {}
}
```