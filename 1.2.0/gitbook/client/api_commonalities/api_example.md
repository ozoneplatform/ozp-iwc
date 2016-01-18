###Example
This snippit is an example of using the **Data API** through an already connected client.

```
var dataApi = client.data();

var foo = { 'bar': 'buz' };

dataApi.set('/foo',{ entity: foo});           //(1)

dataApi.get('/foo').then(function(res){       //(2)
    //res has /foo's value
});

dataApi.watch('/foo',function(event,done){ //(3)
    //when I'm done watching I call done
    done();                                   //(4)
});
```

**(1)**: a **set** action is performed on the node `/foo` of the Data API. After this action completes, the value
stored at `/foo` will equal `{'bar': 'buz'}`.

**(2)**: a **get** action is performed on the node `/foo` of the Data API. In the **resolution** of this action, the value
of `/foo`  will be available in the variable `res` in the following format:

```
{
    'entity': {
        'bar' : 'buz'
    }
}
```

**(3)**: a **watch** action is performed on the resource `/foo` of the Data API. In the **callback** of this action, a
report of the value change of `/foo` will be available in the variable `event` in the following format:

```
{
    'entity': {
        'newValue': ${New value of /foo},
        'oldValue': ${Previous value of /foo},
    }
}
```

**(4)** Based on the change of value of `/foo` the watch may no longer be necessary. Because of this a `done` parameter is
available to the callback. Calling `done()` will cause the callback to be unregistered.
