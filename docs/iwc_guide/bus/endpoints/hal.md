###HAL
The IWC's utilization of HAL formatted data gathering allows for flexibility in data loading as well as simple 
integration of future resource content-types.

####HAL Links and Embedded Resources
Each IWC endpoint and its children are expected to serve HAL formatted data. The IWC's HAL parser will walk through 
`_embedded.item` properties as well as `_links.item` properties recursively to load all data associated with an endpoint.
When receiving a HAL response, the body of the HAL object associates with the IWC resource created in relation to the
response's HREF.

If a link to a resource is provided that was received during the recursive process, the link will not be gathered. This
means commonly returned resources can be passed in the `_embedded.item` field of the HAL data for an endpoint to reduce
the amount of AJAX calls.

For example, if the IWC had some endpoint `ozp:sample` that was loaded with the data below, 3 resources would be handled
as embedded resources (`/resource1`, `/resource2`, `/resource3`) and require no additional AJAX request. Two resource
paths in the `_links.item` are not included in the embedded resources (`/resource4`, `/resource5`) which would open
an AJAX request each to be gathered.

```
{
  "_links":{
    "item": [
       {
         "type": "application/vnd.ozp.sample+json",
         "href": "/resource1"
       },
       {
         "type": "application/vnd.ozp.sample+json",
         "href": "/resource2"
       },
       {
         "type": "application/vnd.ozp.sample+json",
         "href": "/resource3"
       },
       {
         "type": "application/vnd.ozp.sample+json",
         "href": "/resource4"
       },
       {
         "type": "application/vnd.ozp.sample+json",
         "href": "/resource5"
       }
     ],
    "self": {
      "href": "/"
    }
  },
  
  "_embedded":{
    "item": [
      {
        "id": "1cc16131-d013-4dee-bc8c-82ffae60042b",
        "title": "Sample 1",
        "body": "some text."
        "_links": {
          "self": {
            "type": "application/vnd.ozp.sample+json",
            "href": "/resource1"
          }
        }
      },
      {
        "id": "6f460796-55e0-45c4-924d-ddf54c101efa",
        "title": "Sample 2",
        "body": "some text."
        "_links": {
          "self": {
            "type": "application/vnd.ozp.sample+json",
            "href": "/resource2"
          }
        }
      },
      {
        "id": "3c46e645-8545-4398-9e6c-822013fbf4a4",
        "title": "Sample 3",
        "body": "some text."
        "_links": {
          "self": {
            "type": "application/vnd.ozp.sample+json",
            "href": "/resource3"
          }
        }
      }    
    ]  
    
  }
}

```

**/resource4**
```
{
  "_links":{
   "self": {
      "href": "/resource3",
      "type": "application/vnd.ozp.sample+json"
    }
  },
  "_embedded": {},
  "id": "a6194bae-3ac7-4641-b0d2-6b0debce64a7",
  "title": "Sample 4",
  "body": "some text."
}
```

**/resource5**
```
{
  "_links":{
   "self": {
      "href": "/resource4",
      "type": "application/vnd.ozp.sample+json"
    }
  },
  "_embedded": {},
  "id": "a6194bae-3ac7-4641-b0d2-6b0debce64a7",
  "title": "Sample 5",
  "body": "some text."
}
```

####HAL Links
As seen in in the sample endpoint data above, all link objects (including nested `_links` of `_embedded` resources)
have both a `href` and `type` property. **The IWC requires both properties in all link objects.**

| property | description |
|----------|-------------|
| href     | the url path associated with the resource.    |
| type     | the content-type associated with the resource, will be used in GET request if resource is not embedded.|


####Schemas
The `type` of a IWC Resource is mapped to the node creation process in the IWC. It is important to follow the given
schemas for resource types as IWC nodes will not be created if the received data does not match its type.

**IWC Schemas do not dictate `_embedded` resources**. A schema only dictates what is in the body of the
HAL response (the root of the HAL object) as well as any links needed. 

The schema for the example type used above can be found below. It is split into thtrr tables:
    1. **Resource**: Properties pertaining to the body of the HAL response.
    2. **Links**: Properties pertaining to the `_links` object of the HAL response.


####application/vnd.sample+json
**Resource**

| property | type    | description                               |
|----------|---------|-------------------------------------------|
|  id      | String  | A UUID pertaining to the resource.        |
|  title   | String  | A title string.                           |
|  body    | String  | A body of text.                           |

**Links**

| property   | type    | description                               |
|------------|---------|-------------------------------------------|
|  self      | Object  | the link object for this resource.        |
|  self.href | String  | the url of this resource.                 |
|  self.type | String  | the content-type of this resource.        |
