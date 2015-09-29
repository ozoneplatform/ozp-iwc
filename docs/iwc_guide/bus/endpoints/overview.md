##IWC Bus API Endpoints
The IWC Bus is configurable to load persisted API Nodes from it's hosting backend as well as save changes back to it.
If configured to support backend communications, the IWC will reach out to the root endpoint for API communication,
this endpoint is set by the [configuration parameter](../busConfiguration.md) `ozpIwc.config.apiRootUrl`.

####These API Endpoint documents are endpoints relative to the ozpIwc.config.apiRootUrl

* If an endpoint discussed is mentioned as `/data` and the `ozpIwc.config.apiRootUrl` equals `/api`, the endpoint path
(from the root of the domain) is `/api/data`.
* The IWC uses custom link relations to access an API's endpoint at run time. This covered in more depth in the root 
endpoint section, but the purpose is to give a common static-name (ozp:user-data) to a runtime determined endpoint 
(/data for example). All variable path endpoints are referred to by their link relation in this document.

####The IWC Bus Schemas are Written for HAL Data
The IWC expects data to be provided in [HAL format](http://stateless.co/hal_specification.html). This allows backend
developers to utilize flexibility in endpoint data producing. HAL allows embedding of link related data in responses. 
In other terms, in producing the root IWC endpoint (`/`) data, the backend can embed the System API User Information
Nodes (ozp:user) to reduce the need for the IWC bus to make an additional HTTP request to gather it.


***
### /
#### The root endpoint of the IWC Bus. Path set by `ozpIwc.config.apiRootUrl`
**Purpose**: This endpoint provides the IWC bus with the pairing of link relations to their specific endpoint path.

**Schema**: [vnd.ozp-iwc-root-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/mock/api/index.json) **TODO:Undocumented linked to mock** 

**Required to provide**:

* _links
    * **ozp:user-data** endpoint relation link
    * **ozp:application** endpoint relation link
    * **ozp:user** endpoint relation link
    * **ozp:system** endpoint relation link
    * **ozp:intent** endpoint relation link
    
**GET response(sample):**
```
{
  "_links": {
    "curies": {
      "href": "http://ozoneplatform.org/docs/rels/{rel}",
      "name": "ozp",
      "templated": true
    },
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

***
### ozp:user-data (Data API Nodes)
**Purpose**: Provides the IWC Bus with a list of Data API Node links for gathering.

**Schema**:  [vnd.ozp-iwc-list-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/mock/api/profile/v1/exampleUser/index.json) **TODO:Undocumented linked to mock** 

**Required to provide**:

* _links
    * **item** Array of object-wrapped href's for Data API Nodes 
    * **self** An object-wrapped href to this resource
    
**GET Response (sample):**
```
{
  "_links": {
    "item": [
      {
        "href": "https://localhost:13000/profile/7/data/dashboard-data"
      },
      {
        "href": "https://localhost:13000/profile/7/data/locationLister/listings"
      },
      {
        "href": "https://localhost:13000/profile/7/data/locationLister/listings/13ab7e80"
      },
      {
        "href": "https://localhost:13000/profile/7/data/locationLister/listings/6a49f259"
      }
    ],
    "self": {
      "href": "https://localhost:13000/profile/7/data"
    }
  }
}
```

**See [Data API Nodes](data.md) for GET/PUT format on individual nodes** 

***
### ozp:application (System API: Application Nodes)
**Purpose**: Provides the IWC Bus with a list of System API Application Node links for gathering.

**Schema**:  [vnd.ozp-iwc-list-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/mock/api/profile/v1/exampleUser/application/index.json) **TODO:Undocumented linked to mock** 

**Required to provide**:

* _links
    * **item** Array of object-wrapped href's for System API Application Nodes 
    * **self** An object-wrapped href to this resource
    
**GET Response (sample):**
```
{
  "_links": {
    "item": [
      {
        "href": "https://localhost:13000/api/listing/25"
      },
      {
        "href": "https://localhost:13000/api/listing/22"
      },
      {
        "href": "https://localhost:13000/api/listing/34"
      }
    ],
    "self": {
      "href": "https://localhost:13000/api/application"
    }
  }
}
```

**See [System API Application Nodes](application.md) for GET format on individual nodes** 

***
### ozp:user (System API: User Information Nodes)
**Purpose**: Provides the IWC Bus with a list of System API User Node links for gathering.

**Schema**: [vnd.ozp-profile-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/schema/vnd.ozp-profile-v1%2Bjson.json)

**Required to provide**:
* _links
    * **self** An object-wrapped href to this resource

    
**GET Response (sample):**
```
{
  "email": "jsmith@nowhere.com",
  "bio": "",
  "createdDate": "2015-09-29T15:50:30.000+0000",
  "lastLogin": "2015-09-29T16:26:31.000+0000",
  "highestRole": "ADMIN",
  "launchInWebtop": false,
  "organizations": [],
  "stewardedOrganizations": [],
  "id": 7,
  "displayName": "John",
  "username": "jSmith",
  "_links": {
    "self": {
      "href": "https://localhost:13000/api/profile/7"
    }
  }
}
```
***
### ozp:system (System API: Platform Information Node)
**Purpose**: Provides the IWC Bus with a System API Platform Information Node for gathering.

**Schema**: [vnd.ozp-server-v1+json](https://github.com/ozone-development/ozp-data-schemas/blob/master/mock/api/system/v1/index.json) **TODO: undocumented liked to mock**

**Required to provide**:
* **version** A string representation of the version of backend 
* **name** A string representation of the name of backend
* _links
    * **item** Array of object-wrapped href's for System API Platform Information Nodes 
    
**GET Response (sample):**
```
{
  "version": "1.0",
  "name": "IWC Sample Backend",
  "_links": {
    "self": {
      "href": "https://localhost:13000/api/system"
    }
  }
}
```
***
### ozp:intent (Intents API Common Handler Definition Nodes)
#### Future implementation: Not used in current IWC version. 
**Purpose**: Provides the IWC Bus with a list of Intents API Common Handler Definition Node links for gathering. These
nodes will fill the IWC bus with commonly used Intent definitions to aid the user when prompted to make a decision.

**Schema**:  **TODO**

**Required to provide**:

* _links
    * **item** Array of object-wrapped href's for Intent API Nodes 
    * **self** An object-wrapped href to this resource

**GET Response (sample):**
```
{
  "_links": {
    "item": [
      {
        "href": "https://localhost:13000/api/intent/1"
      },
      {
        "href": "https://localhost:13000/api/intent/2"
      }
    ],
    "self": {
      "href": "https://localhost:13000/api/intent"
    }
  }
}
```
**See [Intents API Handler Definition Nodes](application.md) for GET format on individual nodes** 