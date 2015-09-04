##API Responses
Since the IWC operates asynchronously, all requests receive a response sent back to a client that resolves the actions
promise.

The promise structure is as follows:

```
client.${Api}().${Action}(...).then(function(res){...});
```

The `then` of the promise receives a formatted response object. The contents of the response **res** are as follows:

| Property   | Type   | Description                                                                                                                                                                        |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| response   | String | The result of the request. "ok" means a successful operation.                                                                                                                      |
| entity     | Object | The payload of the response. If an action is to return data it will be in this object.                                                                                             |
| src        | String | The sender of the message.                                                                                                                                                         |
| dst        | String | The receiver of the message.                                                                                                                                                       |
| pattern    | String |  A string pattern set to the node to compile its collection of other relevant nodes when watched.                                                                                  |
| collection | Array  |  An array of node keys matching this node's pattern , this only updated if the node is being watched.                                                                             |
| ver        | Number | The version of the node.                                                                                                                                                           |
| time       | Number |  Epoch time representation of when the response was generated.                                                                                                                     |
| msgId      | String | Each data transmission through the IWC is labeled with a unique message identifier. The bus keeps track of message identifiers so that components know to whom they should reply.  |
| replyTo    | String | The message identifier of the request that this response was sent because of.                                                                                                      |
|            |        |                                                                                                                                                                                    |


####Response Types
The following table breaks down the `response` property of the object passed back to the promises then, catch, or
registered callback:

| Response      | Occurs When                                     | Reason |
|---------------|-------------------------------------------------|--------|
| ok            | Promise resolves or registered callback called. | Action was performed as expected        |
| changed       | Registered callback for a watch action called.  | A node has changed after a watch request was issued. The entity contains fields "newValue" and "oldValue" fields that of the indicated contentType.If the node was deleted, "newValue" will be undefined. If the node was created, "oldValue" will be null.|
| badResource   | Promise rejects.                                |  The node was not semantically valid for this API.|
| badAction     | Promise rejects.                                | The action property of the request is not valid in this API.|
| badPermission | Promise rejects.                                | The permission property of the request was not valid.|
| noPermission  | Promise rejects.                                | Sender does not have permission to perform the requested action.|
| noMatch       | Promise rejects.                                | A conditional action failed.|
***

**NOTE**: This guide uses the `then` and `catch` resolution/rejection's of promises only as needed to demonstrate use.
If they are not demonstrated in an example that does not mean they are not useable. All actions will resolve/reject with
the response received from the Bus.

***

####Response Example
The variable `foo` contains the value stored at `/foo` once the api request receives its response.

```
var dataApi = client.data();

var foo;

dataApi.get('/foo').then(function(res){
    foo = res.entity;
});
```

The value of `res`, the resolved object of the list request, is formatted as follows:

```
{
    "response":"ok",
    "src":"data.api",
    "dst":"4e31a811.31de4ddb",
    "entity":{
        'bar': "buzz"
    },
    "ver":1,
    "time":1424897169456,
    "msgId":"i:1397"
    "replyTo":"p:704",
}
```

**response**: Seeing a response of 'ok' is indication that the request was handled without error.

**src**: The origin of the response. With the request to **get** the node `/foo` sent to the Data API, the
response was generated and sent from the Data API module.

**dst**: The destination of the response. Each IWC client is assigned a unique address local to the IWC Bus.
This address designates who should receive the data being transmitted.

**entity**: The value of the node. In this case, `/foo` holds `{ 'bar': "buzz"}`

**pattern**: A string pattern set to the node to compile its collection of other relevant nodes when watched.

**collection**: An array of node keys matching this node's pattern , this only updated if the node is being
 watched.

**ver**: The version of the node. Whenever the value of `/foo` changes, `ver` will increment.

**time**: Epoch time representation of when the response was generated.

**msgId**: Each data transmission through the IWC is labeled with a unique message identifier. The
Bus keeps track of message identifiers so that components know to whom they should reply.

**replyTo**: The message identifier of the request that this response was sent because of.
