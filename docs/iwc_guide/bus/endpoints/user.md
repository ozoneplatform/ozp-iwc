##ozp:user
##System API User Node Endpoints
The System API requests a user node listed from the [ozp:user](overview.md) endpoint. The IWC does not care
how the data is handled on the backend rather that it meets/handles its required content-types.


The root of `ozp:user` **is the resource to be gathered**. Any subsequent resource gathered via either
`_links.item` or `_embedded.item` will override the user node.

The user node is a reference for IWC applications to see the username and display name of the current user. This is
set to the static System API resource `/user`

###Supported Content Types
The following content-types can be handled if linked under the `ozp:user` endpoint.

| Content-Type| Description|
|-------------|------------|
|application/vnd.ozp-profile-v1+json| The IWC's current corresponding ozone backend [ozp-rest](https://github.com/ozone-development/ozp-rest) matches this content-type.|
|application/vnd.ozp-iwc-user+json;version=2| Used in the new ozone backend [ozp-backend](https://github.com/ozone-development/ozp-backend).|

***
###User Node Resources

####application/vnd.ozp-profile-v1+json

**Resource**

| property | type    | description                               |
|------------|---------|-------------------------------------------|
| id          | Number | a UUID of the user                        |
| displayName| String | A human readable display name.            |
| username    | String | the username of the user's account.       |
| email    | String | the email address associated with the user's account.       |

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |

**Example**
```
{
  "email": "johns@nowhere.com",
  "bio": "",
  "displayName": "John Smith",
  "username": "johns",
  "id": 7,
  "_links": {
    "self": {
      "href": "https://localhost:1313/marketplace/api/profile/7"
    }
  }
}
```
####[application/vnd.ozp-iwc-user+json;version=2]()

**Resource**

| property    | type   | description                               |
|-------------|--------|-------------------------------------------|
| id          | Number | a UUID of the user                        |
| display_name| String | A human readable display name.            |
| username    | String | the username of the user's account.       |
| email    | String | the email address associated with the user's account.       |

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self                   | Object  | the link object for this resource.        |
|  self.href              | String  | the url of this resource.                 |
|  self.type              | String  | the content-type of this resource.        |

**Example**
```
{
  "_embedded": {},
  "id": 1,
  "_links": {
    "self": {
      "href": "http://localhost:1212/iwc-api/self/",
      "type": "application/vnd.ozp-iwc-user+json;version=2"
    }
  },
  "display_name": "Winston Smith",
  "username": "wsmith"
  "email": "wsmith@nowhere.com"
}
```

