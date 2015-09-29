##System API Application Node Endpoints
The System API requests Application Nodes listed from the [ozp:application](overview.md) endpoint. The IWC does not care
how the data is handled on the backend rather that it meets its requirements for a GET and PUT request.

### These Content-Types are being updated
application/vnd.ozp-application-v1+json is handled by the IWC Bus, a more coherent 
application/vnd.ozp-application-v2+json is currently in development. Only a subset of the v1 schema is used for the IWC,
so take note of the required response properties below.

***
### GET Request

* **Accept**: application/vnd.ozp-application-v1+json


### GET Response

* **Content-Type**: [application/vnd.ozp-application-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/schema/vnd.ozp-application-v1%2Bjson.json)

### Response Body
The following properties are required in the response. Other properties can be undefined.

* **state** A Object (or stringified Object) of the Data API Node
* **descriptionShort** The Content-Type of the node
* **launchUrls** Urls for launching this application
  * **launchUrls.default** The default launch url
* **icons** An Object of icon links
  * **icons.small** A url for a small icon for this application
* **name** The name of the application
* **id*: The GUID of the application
* **\_links** 

```
{
  "state": "Active",
  "descriptionShort": "The best bouncing green ball you've ever seen",
  "approvalStatus": "APPROVED",
  "screenshots": [
    {
      "href": "https://localhost:13000/api/image/06c144c7-73d4-4c28-8644-26d0f7030106.png"
    }
  ],
  "intents": [
    {
      "type": "application/json",
      "action": "edit",
      "icon": "",
      "label": null
    },
    {
      "type": "application/json",
      "action": "view",
      "icon": "",
      "label": null
    }
  ],
  "launchUrls": {
    "default": "https://localhost:13000/applications/bouncingBalls/index.html?color=green"
  },
  "uiHints": {
    "width": null,
    "height": null,
    "singleton": false
  },
  "icons": {
    "small": "https://localhost:13000/api/image/9cb7749c-dba2-4cef-93c5-5ddd1e48e8fc.png",
    "large": "https://localhost:13000/api/image/5eb1e8f3-dc86-43de-9546-96ca7af8cd1c.png",
    "banner": "https://localhost:13000/api/image/b17c1ba2-4a16-4c80-a0fa-929609f4fa25.png",
    "featuredBanner": "https://localhost:13000/api/image/076f2784-faab-4599-8ad1-115a1bb1be67.png"
  },
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "tags": [
    "demo"
  ],
  "name": "Bouncing Green Ball",
  "id": "10ee10cd-7a02-4b07-a72c-cc1e9c1ee4fb",
  "type": "Web Application",
  "_links": {
    "describes": {
      "href": "https://localhost:13000/applications/bouncingBalls/index.html?color=green"
    },
    "self": {
      "href": "https://localhost:13000/api/listing/25"
    }
  }
}
```
