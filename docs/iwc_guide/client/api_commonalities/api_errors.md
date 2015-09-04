##Error Handling
Not all requests are valid. In the event that a request cannot be handled, or should not be allowed, the promise will
reject. This allows for a clean separation for error handling. The value of **errRes** follows the same format of
a valid api response (see [API Responses](api_responses.md)).


####Error Example
In this example a get request is sent, but no node was specified in the **get** action  call ( `dataApi.get()` )

```
var dataApi = client.data();

var foo;

dataApi.get().then(function(res){
    foo = res.entity;
}).catch(function(errRes){
    // handle the error here.
});
```
Because of this, the response will be in the `catch` because it was a failed request. Further information about why the
request failed can be found in the `response` field of **errRes**.

**NOTE:** If supporting IE 8, `catch` is a keyword and cannot be used. In this situation replacing `catch` with
`['catch']` will prevent IE 8 from failing. See snippit below:

```
dataApi.get().then(function(res){
    foo = res.entity;
})['catch'](function(errRes){
    // handle the error here.
});
```
    