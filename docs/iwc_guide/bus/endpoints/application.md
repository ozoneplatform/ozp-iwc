##ozp:application
##System API Application Node Endpoints
The System API requests Application Nodes listed from the [ozp:application](overview.md) endpoint. The IWC does not care
how the data is handled on the backend rather that it meets/handles its required content-types.


The root of `ozp:application` supplies links to application node resources(application/vnd.ozp-iwc-data-objects+json;version=2).It must provide a 
`_link.item` array of linked applicationnode resources. Optionally these resources can be provided in the `_embedded.item` array
to reduce network communication.

###Supported Content Types
The following content-types can be handled if linked from the `ozp:application` or from an resource that is chain linked from 
`ozp:application`.

| Content-Type| Description|
|-------------|------------|
|application/vnd.ozp-iwc-applications-v1+json| The IWC's current corresponding ozone backend [ozp-rest](https://github.com/ozone-development/ozp-rest) uses this content-type. A HAL resource only containing link objects for other resources. This content-type will be deprecated in 2016 as it lacks providing content-type of its links.|
|application/vnd.ozp-iwc-applications+json;version=2| The IWC's new ozone backend [ozp-backend](https://github.com/ozone-development/ozp-backend) uses this content-type.|
|application/vnd.ozp-application-v1+json| The IWC's current corresponding ozone backend [ozp-rest](https://github.com/ozone-development/ozp-rest) matches this content-type. This content-type will be deprecated in 2016 as it lacks providing content-type of its links|
|application/vnd.ozp-iwc-application+json;version=2| The IWC's default content-type for application node resources. Used in the new ozone backend [ozp-backend](https://github.com/ozone-development/ozp-backend).|

***

###Application Node List Resources

####application/vnd.ozp-iwc-applications-v1+json
**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  item                   | Array   | An array of linked items. Of a supported `ozp:application` type|


**Example**
```
{
  "_links": {
    "item": [
      {
        "href": "https://localhost:1313/marketplace/api/listing/22"
      },
      {
        "href": "https://localhost:1313/marketplace/api/listing/52"
      },
      {
        "href": "https://localhost:1313/marketplace/api/listing/51"
      },
      {
        "href": "https://localhost:1313/marketplace/api/listing/24"
      }
    ],
    "self": {
      "href": "https://localhost:1313/marketplace/api/profile/7/application"
    }
  }
}
```
####application/vnd.ozp-iwc-applications+json;version=2
**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |
|  item                   | Array   | An array of linked items. Of a supported `ozp:application` type|

**Embedded Resources**
Commonly, the `application/vnd.ozp-application+json;version=2` content-type resources are provided both in the 
`_embedded.item` arrays. This is to reduce network communication to gather resources.


**Example**
```
{
  "_embedded": {
    "item": [
      {
       "id": 1,
        "intents": [],
        "small_icon": {
          "url": "http://localhost:1212/iwc-api/image/6/",
        },
        "large_icon": {
          "url": "http://localhost:1212/iwc-api/image/7/",
        },
        "title": "Air Mail",
        "launch_url": "http://localhost:1212/demo_apps/centerSampleListings/airMail/index.html",
        "unique_name": "ozp.test.air_mail",
        "description_short": "Sends airmail",
        "_links": {
          "self": {
            "href": "http://localhost:1212/iwc-api/listing/1/",
            "type": "application/vnd.ozp-iwc-application+json;version=2"
          }
      },
      {
        "id": 2,
        "intents": [],
        "small_icon": {
                  "url": "http://localhost:1212/iwc-api/image/8/",
                },
                "large_icon": {
                  "url": "http://localhost:1212/iwc-api/image/9/",
                },
        "title": "Bread Basket",
        "launch_url": "http://localhost:1212/demo_apps/centerSampleListings/breadBasket/index.html",
        "unique_name": "ozp.test.bread_basket",
        "description_short": "Basket of bread.",
        "_links": {
          "self": {
            "href": "http://localhost:1212/iwc-api/listing/2/",
            "type": "application/vnd.ozp-iwc-application+json;version=2"
          }
        }
      }
    ]
  },
  "_links": {
    "item": [
      {
        "href": "http://localhost:1212/iwc-api/listing/1/",
        "type": "application/vnd.ozp-iwc-application+json;version=2"
      },
      {
        "href": "http://localhost:1212/iwc-api/listing/2/",
        "type": "application/vnd.ozp-iwc-application+json;version=2"
      }
    ],
    "self": {
      "href": "http://localhost:1212/iwc-api/self/application/",
      "type": "application/vnd.ozp-iwc-applications+json;version=2"
    }
  }
}
```

***

####application/vnd.ozp-iwc-application-v1+json

**Resource**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
| id         | String  | An identifier for the resource. Used for database indexing.|
| intents    | Array  | An array of intent definitions associated with the application.|
| title      | String  | A title associated with the application. |
| launchUrl  | Object  | A collection of launch urls.             |
| launchUrl.default | String  | The url path of the application.    |
| description_short | String  | A short description of the application.    |
| icons | Object|   A collection of icon urls.  |
| icons.small | String| The href of the small icon.   |
| icons.large | String|   The href of the large icon.     |


**Links**

| property                | type    | description                               |
|-------------------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |
|  item                   | Array   | An array of linked items. Of a supported `ozp:application` type|


**Example**
```
{
  "icons": {
    "small": "https://localhost:1313/marketplace/api/image/24375765-749a-4fd7-8946-dfcf4bb8bcca.png",
    "large": "https://localhost:1313/marketplace/api/image/40a1bc92-d4a7-4428-b786-861d6cca96ca.png",
  },
  "launchUrls": {
    "default": "https://localhost:1313/demo_apps/bouncingBalls/index.html?color=blue"
  },
  "descriptionShort": "The best bouncing blue ball you've ever seen",
  "intents": [
    {
      "type": "application/json",
      "action": "view",
      "icon": "",
      "label": null
    },
    {
      "type": "application/json",
      "action": "edit",
      "icon": "https://localhost:1313/marketplace/api/image/acd738e2-e633-4e90-8f92-7eb1bb3c9386.png",
      "label": "test"
    }
  ],
  "id": "69e73883-41af-45ac-b924-a89f777e3612",
  "_links": {
    "self": {
      "href": "https://localhost:1313/marketplace/api/listing/22"
    }
  }
}
```
####application/vnd.ozp-iwc-application+json;version=2

**Resource**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
| id         | String  | An identifier for the resource. Used for database indexing.|
| intents    | Array  | An array of intent definitions associated with the application.|
| title      | String  | A title associated with the application. |
| unique_name| String  | A uuid for the application. Used for application searching.|
| launch_url | String  | The url path of the application.    |
| description_short | String  | A short description of the application.    |
| small_icon | Object|   A small icon for the application.  |
| small_icon.url | String| The href of the icon.   |
| large_icon | Object|   A lage icon for the application.   |
| large_icon.url | String|   The href of the icon.     |


**Links**

| property                | type    | description                               |
|-------------------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |
|  item                   | Array   | An array of linked items. Of a supported `ozp:application` type|

**Example**
```
{
  "id": 1,
  "intents": [],
  "small_icon": {
    "url": "http://localhost:1212/iwc-api/image/6/",
  },
  "large_icon": {
    "url": "http://localhost:1212/iwc-api/image/7/",
  },
  "title": "Air Mail",
  "launch_url": "http://localhost:1212/demo_apps/centerSampleListings/airMail/index.html",
  "unique_name": "ozp.test.air_mail",
  "description_short": "Sends airmail",
  "_links": {
    "self": {
      "href": "http://localhost:1212/iwc-api/listing/1/",
      "type": "application/vnd.ozp-iwc-application+json;version=2"
    }
  },
  "_embedded": {}
}
```