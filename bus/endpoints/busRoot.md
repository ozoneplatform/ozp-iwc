### /
#### The root endpoint of the IWC Bus. Path set by `ozpIwc.config.apiRootUrl`
**Purpose**: This endpoint provides the IWC bus with the pairing of link relations to their specific endpoint path.

####[vnd.ozp-iwc-root-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/mock/api/index.json) **TODO:Undocumented linked to mock** 
**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |
|  [ozp:user-data](data.md)| Object  | the link object for the Data.api. Denotes the URL for IWC components accesing the Data.api backend.|
|  ozp:user-data.href     | String  |                                           |
|  ozp:user-data.type     | String  |                                           |
|  [ozp:application](application.md)| Object  | the link object for the System.api's Applications.|
|  ozp:application.href   | String  |                                           |
|  ozp:application.type   | String  |                                           |
|  [ozp:user](user.md)    | Object  | the link object for the System.api's User information.        |
|  ozp:user.href          | String  |                                           |
|  ozp:user.type          | String  |                                           |
|  [ozp:system](system.md)| Object  | the link object for the System.api's Baackend information.        |
|  ozp:system.href        | String  |                                           |
|  ozp:systemtype         | String  |                                           |
|  [ozp:intent](intents.md)| Object  | the link object for the Intents.api.        |
|  ozp:intent.href        | String  |                                           |
|  ozp:intent.type        | String  |                                           |
|  ozp:data-item          | Object  | the *template* link object for the creation of Data Api resources. Notes the content-type and path for the IWC to store nodes in.|
|  ozp:data-item.templated| Boolean | a flag indicating this link is a template. Must be true.|
|  ozp:data-item.href        | String  | a href template signifying how to create the href for the Data.api resource persistence.|
|  ozp:data-item.type        | String  | the content-type the server accepts for Data.api resources.                                          |
|  ozp:application-item          | Object  | the *template* link object for the loading of System.api Application resources. As application resources are static and often not pathed off of the ozp:application endpoint, this template enforces the IWC to use the given type as the `Accept` header when gathering a resource matching the `href` template.|
|  ozp:application-item.templated| Boolean | a flag indicating this link is a template. Must be true.|
|  ozp:application-item.href        | String  | a href template signifying when to use the included `type` as an Accept header.|
|  ozp:application-item.type        | String  | the content-type the IWC uses to `Accept`  System.api Application resources.|


####Embedded Resources
Commonly, the `ozp:user` and `ozp:system` endpoints are loaded in the `_embedded` properties as they are single resource
endpoints (no links). 

####GET response(sample)
```
{
  "_links": {   
    "ozp:application": {
      "href": "https://localhost:13000/profile/7/application"
    },
    "ozp:intent": {
      "href": "https://localhost:13000/intent"
    },
    "ozp:system": {
      "href": "https://localhost:13000/system"
    },
    "ozp:user": {
      "href": "https://localhost:13000/profile/7"
    },
    "ozp:user-data": {
      "href": "https://localhost:13000/profile/7/data"
    },
    "self": {
      "href": "https://localhost:13000"
    }
  },
  "_embedded": {
    "ozp:system": {
      "version": "1.0",
      "name": "IWC Sample Backend",
      "_links": {
        "self": {
          "href": "https://localhost:13000/system"
        }
      }
    },
    "ozp:user": {
      "userName": "jsmith",
      "name": "John Smith",
      "_links": {
        "self": {
          "href": "https://localhost:13000/profile/7"
        }
      }
    }
  }
}
```